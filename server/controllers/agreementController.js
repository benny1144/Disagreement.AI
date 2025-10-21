import Disagreement from '../models/disagreementModel.js';
import { triggerClarityAI } from '../services/aiAnalysisService.js';

// Helper: ensure ObjectId comparison as strings
const sameId = (a, b) => String(a) === String(b);

/**
 * POST /api/disagreements/:id/agree
 * Marks the authenticated participant as having agreed to the formal proposal.
 */
export const agreeToProposal = async (req, res) => {
  try {
    const disagreementId = req.params.id;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Not authorized' });

    const disagreement = await Disagreement.findById(disagreementId);
    if (!disagreement) return res.status(404).json({ message: 'Disagreement not found' });

    // Confirm the user is an active participant
    const participant = (disagreement.participants || []).find(p => sameId(p.user, userId));
    if (!participant) return res.status(403).json({ message: 'You are not a participant in this disagreement' });
    if (participant.status !== 'active') return res.status(403).json({ message: 'Your participation is not active' });

    // Set hasAgreed = true for this participant
    participant.hasAgreed = true;

    // Determine if all active participants have agreed
    const allActiveAgreed = (disagreement.participants || [])
      .filter(p => p.status === 'active')
      .every(p => Boolean(p.hasAgreed));

    if (allActiveAgreed) {
      disagreement.status = 'resolved';
      disagreement.isFormalProposalActive = false;
      disagreement.resolvedAt = new Date();
    }

    await disagreement.save();

    // Emit appropriate socket event
    try {
      const io = req.app.get('io');
      if (io) {
        if (allActiveAgreed) {
          io.to(String(disagreement._id)).emit('case_resolved', disagreement);
        } else {
          io.to(String(disagreement._id)).emit('agreement_status_update', disagreement.participants);
        }
      }
    } catch (e) {
      try { console.error('[socket] agree emit error:', e?.message || e); } catch (_) {}
    }

    return res.status(200).json(disagreement);
  } catch (err) {
    console.error('[agreeToProposal] error:', err?.message || err);
    return res.status(500).json({ message: 'Failed to record agreement' });
  }
};

/**
 * POST /api/disagreements/:id/disagree
 * Resets agreement state and asks Clarity to continue mediation.
 */
export const disagreeWithProposal = async (req, res) => {
  try {
    const disagreementId = req.params.id;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Not authorized' });

    const disagreement = await Disagreement.findById(disagreementId);
    if (!disagreement) return res.status(404).json({ message: 'Disagreement not found' });

    // Reset agreement state
    disagreement.isFormalProposalActive = false;
    disagreement.status = 'active';
    disagreement.finalAgreementText = null;
    if (Array.isArray(disagreement.participants)) {
      disagreement.participants.forEach(p => { p.hasAgreed = false; });
    }

    // Add a contextual system message to the chat history
    const systemText = 'System: A participant has disagreed with the previous proposal. Please help the parties address the remaining concerns to find a new path to agreement.';
    const claritySender = process.env.CLARITY_USER_ID || undefined;
    disagreement.messages.push({ sender: claritySender, text: systemText, isAIMessage: true });

    await disagreement.save();

    // Emit reset status update and the system message
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(String(disagreement._id)).emit('agreement_status_update', disagreement.participants);
        const saved = disagreement.messages[disagreement.messages.length - 1];
        // Broadcast system message using existing event used by clients
        io.to(String(disagreement._id)).emit('receive_message', {
          _id: saved?._id,
          sender: { _id: claritySender, name: 'Clarity' },
          text: systemText,
          isAIMessage: true,
        });
      }
    } catch (e) {
      try { console.error('[socket] disagree emit error:', e?.message || e); } catch (_) {}
    }

    // Trigger Clarity AI to continue mediation
    try {
      const io = req.app.get('io');
      await triggerClarityAI(String(disagreement._id), io);
    } catch (e) {
      try { console.error('[Clarity AI] trigger after disagree error:', e?.message || e); } catch (_) {}
    }

    return res.status(200).json(disagreement);
  } catch (err) {
    console.error('[disagreeWithProposal] error:', err?.message || err);
    return res.status(500).json({ message: 'Failed to process disagreement action' });
  }
};
