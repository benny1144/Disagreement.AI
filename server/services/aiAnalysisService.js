import Disagreement from '../models/disagreementModel.js';
import User from '../models/userModel.js';
import { getAIResponseToSummon, classifyMessageToxicity, getAIReEngagementMessage, getAISummary, getAIResolutionProposal } from '../controllers/aiController.js';

// Inactivity timer cache per room (AI Re-engagement v2.3)
const roomTimers = {};
// Per-room message counter for summarization (v2.5)
const roomMessageCounters = {};

function resetRoomTimer(roomId, io) {
  try {
    if (!roomId) return;
    if (roomTimers[roomId]) {
      clearTimeout(roomTimers[roomId]);
    }
    roomTimers[roomId] = setTimeout(() => {
      // noinspection JSIgnoredPromiseFromCall
      triggerInactivityAI(roomId, io).catch((e) => {
        try { console.error('[Timer] triggerInactivityAI error:', e?.message || e); } catch (_) {}
      });
    }, 10 * 60 * 1000); // 10 minutes
    console.log(`[Timer] Inactivity timer reset for room ${roomId}.`);
  } catch (e) {
    console.error('[Timer] resetRoomTimer error:', e?.message || e);
  }
}

async function triggerInactivityAI(roomId, io) {
  try {
    console.log(`[AI Analysis] Inactivity detected in room ${roomId}. Triggering re-engagement.`);

    const aiSenderId = process.env.AI_MEDIATOR_USER_ID;
    if (!aiSenderId) {
      console.warn('[AI Analysis] AI_MEDIATOR_USER_ID not set; cannot emit re-engagement message.');
      return;
    }

    const disagreement = await Disagreement.findById(roomId).populate({
      path: 'messages.sender',
      select: 'name'
    });
    if (!disagreement) return;

    const messageHistory = Array.isArray(disagreement.messages) ? disagreement.messages : [];

    let aiReEngagementText = '';
    try {
      aiReEngagementText = await getAIReEngagementMessage(messageHistory);
    } catch (e) {
      console.error('[AI Analysis] getAIReEngagementMessage error:', e?.message || e);
    }
    if (!aiReEngagementText) return;

    disagreement.messages.push({ sender: aiSenderId, text: aiReEngagementText, isAIMessage: true });
    await disagreement.save();

    const saved = disagreement.messages[disagreement.messages.length - 1];
    let aiUserDoc = null;
    try {
      aiUserDoc = await User.findById(aiSenderId).select('name');
    } catch (_) {}
    const populatedAiMessage = {
      _id: saved?._id,
      sender: aiUserDoc ? { _id: aiUserDoc._id, name: aiUserDoc.name } : { _id: aiSenderId, name: 'DAI' },
      text: aiReEngagementText,
      isAIMessage: true
    };
    io.to(roomId).emit('receive_message', populatedAiMessage);

    // Reset timer for another window after intervening
    resetRoomTimer(roomId, io);
  } catch (e) {
    console.error('[AI Analysis] triggerInactivityAI error:', e?.message || e);
  }
}

// AI Active Listening Hub: invoked for every new human message
async function analyzeMessage(message, roomId, io) {
  try {
    const text = (message?.text || '').toString();
    const messageText = text.toLowerCase();
    const summonKeywords = ['@dai'];

    // 0) Resolution Proposal (highest priority)
    const proposalTrigger = '@dai propose an agreement';
    if (messageText.includes(proposalTrigger)) {
      console.log(`[AI Analysis] Resolution Proposal triggered for room ${roomId}.`);
      const aiSenderId = process.env.AI_MEDIATOR_USER_ID;
      if (!aiSenderId) {
        console.warn('[AI Analysis] AI_MEDIATOR_USER_ID not set; cannot emit resolution proposal.');
        return;
      }

      // Fetch full conversation history with populated sender names
      const disagreement = await Disagreement.findById(roomId).populate({
        path: 'messages.sender',
        select: 'name'
      });
      if (!disagreement) return;
      const messageHistory = Array.isArray(disagreement.messages) ? disagreement.messages : [];

      // Call AI service for resolution proposal
      let proposalText = '';
      try {
        proposalText = await getAIResolutionProposal(messageHistory);
      } catch (e) {
        console.error('[AI Analysis] getAIResolutionProposal error:', e?.message || e);
      }
      if (!proposalText) return;

      // Save + emit AI proposal (mark as proposal)
      disagreement.messages.push({ sender: aiSenderId, text: proposalText, isAIMessage: true, isProposal: true });
      await disagreement.save();

      const saved = disagreement.messages[disagreement.messages.length - 1];
      let aiUserDoc = null;
      try {
        aiUserDoc = await User.findById(aiSenderId).select('name');
      } catch (_) {}
      const populatedAiMessage = {
        _id: saved?._id,
        sender: aiUserDoc ? { _id: aiUserDoc._id, name: aiUserDoc.name } : { _id: aiSenderId, name: 'DAI' },
        text: proposalText,
        isAIMessage: true,
        isProposal: true
      };
      io.to(roomId).emit('receive_message', populatedAiMessage);
      return;
    }

    // 1) Summon Rule
    const isSummoned = summonKeywords.some(keyword => messageText.includes(keyword));
    if (isSummoned) {
      console.log(`[AI Analysis] Summon detected in room ${roomId}.`);

      // Fetch conversation history with populated sender names
      const disagreement = await Disagreement.findById(roomId).populate({
        path: 'messages.sender',
        select: 'name'
      });
      if (!disagreement) return;
      const messageHistory = Array.isArray(disagreement.messages) ? disagreement.messages : [];

      // Call AI service for summon response
      let aiResponseText = '';
      try {
        aiResponseText = await getAIResponseToSummon(messageHistory, text);
      } catch (e) {
        console.error('[AI Analysis] getAIResponseToSummon error:', e?.message || e);
      }
      if (!aiResponseText) return;

      // Save + emit AI response
      const aiSenderId = process.env.AI_MEDIATOR_USER_ID;
      if (!aiSenderId) {
        console.warn('[AI Analysis] AI_MEDIATOR_USER_ID not set; cannot emit AI response to summon.');
        return;
      }

      disagreement.messages.push({ sender: aiSenderId, text: aiResponseText, isAIMessage: true });
      await disagreement.save();

      const saved = disagreement.messages[disagreement.messages.length - 1];
      let aiUserDoc = null;
      try {
        aiUserDoc = await User.findById(aiSenderId).select('name');
      } catch (_) {}
      const populatedAiMessage = {
        _id: saved?._id,
        sender: aiUserDoc ? { _id: aiUserDoc._id, name: aiUserDoc.name } : { _id: aiSenderId, name: 'DAI' },
        text: aiResponseText,
        isAIMessage: true
      };
      io.to(roomId).emit('receive_message', populatedAiMessage);
      console.log(`[AI Analysis] AI response sent to room ${roomId}.`);
      return;
    }

    // 2) Toxicity Check (runs only if not summoned)
    let classification = 'NEUTRAL';
    try {
      classification = await classifyMessageToxicity(text);
    } catch (e) {
      console.error('[AI Analysis] classifyMessageToxicity error:', e?.message || e);
    }
    console.log(`[AI Analysis] Message classification: ${classification}`);

    if (classification === 'TOXIC') {
      console.log(`[AI Analysis] Toxicity detected in room ${roomId}. Triggering de-escalation.`);
      const deEscalationText = "A reminder to all participants: Please focus on the issue, not the person. Let's maintain a respectful conversation.";

      const aiSenderId = process.env.AI_MEDIATOR_USER_ID;
      if (!aiSenderId) {
        console.warn('[AI Analysis] AI_MEDIATOR_USER_ID not set; cannot emit de-escalation message.');
        return;
      }

      const disagreement = await Disagreement.findById(roomId);
      if (!disagreement) return;

      disagreement.messages.push({ sender: aiSenderId, text: deEscalationText, isAIMessage: true });
      await disagreement.save();

      const saved = disagreement.messages[disagreement.messages.length - 1];
      let aiUserDoc = null;
      try {
        aiUserDoc = await User.findById(aiSenderId).select('name');
      } catch (_) {}
      const populatedAiMessage = {
        _id: saved?._id,
        sender: aiUserDoc ? { _id: aiUserDoc._id, name: aiUserDoc.name } : { _id: aiSenderId, name: 'DAI' },
        text: deEscalationText,
        isAIMessage: true
      };
      io.to(roomId).emit('receive_message', populatedAiMessage);
    }

    // 3) Summarization Check (runs last)
    try {
      roomMessageCounters[roomId] = (roomMessageCounters[roomId] || 0) + 1;
      if (roomMessageCounters[roomId] >= (Number(process.env.AI_SUMMARY_MESSAGE_THRESHOLD || 8))) {
        console.log(`[AI Analysis] Summarization trigger met for room ${roomId}.`);
        // reset counter immediately to prevent duplicate triggers
        roomMessageCounters[roomId] = 0;

        const aiSenderId = process.env.AI_MEDIATOR_USER_ID;
        if (!aiSenderId) {
          console.warn('[AI Analysis] AI_MEDIATOR_USER_ID not set; cannot emit summary message.');
        } else {
          const disagreement = await Disagreement.findById(roomId).populate({
            path: 'messages.sender',
            select: 'name'
          });
          if (disagreement) {
            let summaryText = '';
            try {
              summaryText = await getAISummary(disagreement.messages);
            } catch (e) {
              console.error('[AI Analysis] getAISummary error:', e?.message || e);
            }
            if (summaryText) {
              disagreement.messages.push({ sender: aiSenderId, text: summaryText, isAIMessage: true });
              await disagreement.save();

              const saved = disagreement.messages[disagreement.messages.length - 1];
              let aiUserDoc = null;
              try {
                aiUserDoc = await User.findById(aiSenderId).select('name');
              } catch (_) {}
              const populatedAiMessage = {
                _id: saved?._id,
                sender: aiUserDoc ? { _id: aiUserDoc._id, name: aiUserDoc.name } : { _id: aiSenderId, name: 'AI Mediator' },
                text: summaryText,
                isAIMessage: true
              };
              io.to(roomId).emit('receive_message', populatedAiMessage);
            }
          }
        }
      }
    } catch (e) {
      console.error('[AI Analysis] summarization check error:', e?.message || e);
    }
  } catch (err) {
    console.error('[AI Analysis] analyzeMessage internal error:', err?.message || err);
  }
}

function cleanupRoomState(roomId) {
  if (!roomId) return;
  if (roomTimers[roomId]) {
    clearTimeout(roomTimers[roomId]);
    delete roomTimers[roomId];
    console.log(`[Timer] Cleared timer for room ${roomId}.`);
  }
  if (roomMessageCounters[roomId]) {
    delete roomMessageCounters[roomId];
    console.log(`[Counter] Cleared message counter for room ${roomId}.`);
  }
}

export { analyzeMessage, resetRoomTimer, cleanupRoomState };
