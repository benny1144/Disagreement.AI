import axios from 'axios';
import Disagreement from '../models/disagreementModel.js';
import User from '../models/userModel.js';

/**
 * Triggers the Clarity AI service to analyze the conversation and generate a response.
 * This is the new "brain" of the AI.
 *
 * @param {string} disagreementId - The ID of the disagreement to analyze.
 * @param {object} io - The Socket.IO instance.
 */
async function triggerClarityAI(disagreementId, io) {
  console.log(`[AI Trigger] Triggering Clarity AI for disagreement: ${disagreementId}`);

  try {
    // 1. Fetch the full disagreement and its history
    const disagreement = await Disagreement.findById(disagreementId)
      .populate({
        path: 'messages.sender',
        select: 'name _id'
      });

    if (!disagreement) {
      console.error(`[AI Trigger] Disagreement ${disagreementId} not found.`);
      return;
    }

    // Identify AI sender id
    const clarityUserId = process.env.CLARITY_USER_ID || '';

    // 2. Format the chat history for the Python service
    const chatHistory = (disagreement.messages || []).map(msg => {
      const senderId = (msg?.sender && msg.sender._id) ? String(msg.sender._id) : String(msg.sender || '');
      return {
        role: senderId && clarityUserId && senderId === clarityUserId ? 'assistant' : 'user',
        content: msg.text
      };
    });

    // 3. Determine the context
    // Use the AI's last saved context, or the initial description if this is the first time.
    const context = disagreement.aiContext || disagreement.description;

    // 4. Construct the request payload
    const payload = {
      chat_history: chatHistory,
      dispute_context: context
    };

    // 5. Call the Python AI Service
    const aiServiceUrl = `${process.env.CLARITY_AI_SERVICE_URL}/mediate`;
    const response = await axios.post(aiServiceUrl, payload);

    const { response_message, updated_context, is_formal_proposal } = (response?.data) || {};

    if (!response_message) {
      console.log('[AI Trigger] AI returned a valid response but no message. No action taken.');
      return;
    }

    // Handle formal proposal path
    if (is_formal_proposal === true) {
      // Prepare disagreement for agreement workflow
      disagreement.status = 'awaiting_agreement';
      disagreement.isFormalProposalActive = true;
      disagreement.finalAgreementText = response_message;
      // Reset participant agreements for fresh vote
      if (Array.isArray(disagreement.participants)) {
        disagreement.participants.forEach(p => { p.hasAgreed = false; });
      }
      // Update the AI context/memory
      disagreement.aiContext = (updated_context !== undefined) ? updated_context : (disagreement.aiContext ?? null);
      await disagreement.save();

      // Emit formal proposal event to clients
      try {
        io.to(disagreementId).emit('formal_proposal_received', disagreement);
      } catch (e) {
        try { console.error('[socket] formal_proposal_received emit error:', e?.message || e); } catch (_) {}
      }
      return; // Do not post the proposal as a normal chat message
    }

    // 6. Save the AI's response to the database (embedded message)
    const aiSender = clarityUserId;
    disagreement.messages.push({
      sender: aiSender,
      text: response_message,
      isAIMessage: true
    });
    await disagreement.save();

    // 7. Broadcast the AI's message to the room (match existing client event)
    const saved = disagreement.messages[disagreement.messages.length - 1];
    let aiUserDoc = null;
    try {
      if (aiSender) {
        aiUserDoc = await User.findById(aiSender).select('name');
      }
    } catch (_) {}

    const populatedAiMessage = {
      _id: saved?._id,
      sender: aiUserDoc ? { _id: aiUserDoc._id, name: aiUserDoc.name } : { _id: aiSender, name: 'Clarity' },
      text: response_message,
      isAIMessage: true
    };
    io.to(disagreementId).emit('receive_message', populatedAiMessage);

    // 8. Update the disagreement's "memory"
    disagreement.aiContext = (updated_context !== undefined) ? updated_context : (disagreement.aiContext ?? null);
    await disagreement.save();

  } catch (error) {
    console.error(`[AI Trigger] CRITICAL ERROR: ${error?.message || error}`);
    // Send a fallback message to the user
    try {
      const errorMessage = "I am currently having trouble processing that request. Please wait a moment and try again.";
      const aiSender = process.env.CLARITY_USER_ID || '';
      const disagreement = await Disagreement.findById(disagreementId);
      if (!disagreement) return;

      disagreement.messages.push({ sender: aiSender, text: errorMessage, isAIMessage: true });
      await disagreement.save();

      const saved = disagreement.messages[disagreement.messages.length - 1];
      let aiUserDoc = null;
      try { aiUserDoc = await User.findById(aiSender).select('name'); } catch (_) {}
      const populatedErrorMessage = {
        _id: saved?._id,
        sender: aiUserDoc ? { _id: aiUserDoc._id, name: aiUserDoc.name } : { _id: aiSender, name: 'Clarity' },
        text: errorMessage,
        isAIMessage: true
      };
      io.to(disagreementId).emit('receive_message', populatedErrorMessage);
    } catch (e2) {
      console.error('[AI Trigger] Fallback message error:', e2?.message || e2);
    }
  }
}

export { triggerClarityAI };
