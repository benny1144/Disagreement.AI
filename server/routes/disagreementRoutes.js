import express from 'express';
const router = express.Router();
import {
    getDisagreements,
    createDisagreement,
    getDisagreement,
    // updateDisagreement,
    // deleteDisagreement,
    // processDisagreement,
    createDirectInvite,
    getInviteDetails,
    acceptInvite,
    manageParticipant,
    approveInvitation,
    denyInvitation
} from '../controllers/disagreementController.js'; // Added .js
import { protect } from '../middleware/authMiddleware.js'; // Added .js
import Disagreement from '../models/disagreementModel.js';

// Public invite details (no auth)
router.get('/invite/:token', getInviteDetails);
// Accept invite requires authentication
router.post('/invite/:token', protect, acceptInvite);

// List/create disagreements
router.route('/')
  .get(protect, getDisagreements)
  .post(protect, createDisagreement);

// Participant management (creator only, enforced in controller)
router.put('/:id/participants', protect, manageParticipant);

// Approval/Deny for pending invitations (creator only)
router.post('/:id/invitations/approve', protect, approveInvitation);
router.post('/:id/invitations/deny', protect, denyInvitation);
// Alias route: Approve participant (creator only)
router.post('/:id/approve', protect, approveInvitation);

// Direct invites (participant allowed)
router.post('/:id/invite', protect, createDirectInvite);

// Legacy routes (left commented for now; to be reintroduced in later parts if needed)
// router.post('/:id/process', protect, processDisagreement);
// router.route('/:id')
//   .get(protect, getDisagreement)
//   .put(protect, updateDisagreement)
//   .delete(protect, deleteDisagreement);

// Keep GET by id available
router.get('/:id', protect, getDisagreement);

// Finalization and agreement download
import { finalizeAgreement, downloadAgreement } from '../controllers/disagreementController.js';
router.post('/:id/finalize', protect, finalizeAgreement);
router.get('/:id/agreement', protect, downloadAgreement);

// --- Proposal Voting Endpoint (v3.2) ---
router.post('/:disagreementId/proposals/:messageId/vote', protect, async (req, res) => {
  try {
    const { disagreementId, messageId } = req.params || {};
    const vote = (req.body?.vote || '').toString().toLowerCase();
    const userId = req.user?._id;

    if (!disagreementId || !messageId) {
      return res.status(400).json({ message: 'Invalid parameters.' });
    }
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized.' });
    }

    const disagreement = await Disagreement.findById(disagreementId);
    if (!disagreement) {
      return res.status(404).json({ message: 'Disagreement not found.' });
    }

    const msg = disagreement.messages.id(messageId);
    if (!msg) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    if (!msg.isProposal) {
      return res.status(400).json({ message: 'Not a proposal message.' });
    }

    // Prevent duplicate agreements by this user
    const alreadyAgreed = Array.isArray(msg.agreements)
      ? msg.agreements.some(a => String(a.user) === String(userId))
      : false;

    if (vote === 'agree') {
      if (!alreadyAgreed) {
        if (!Array.isArray(msg.agreements)) msg.agreements = [];
        msg.agreements.push({ user: userId, agreedAt: new Date() });
        await disagreement.save();
      }
    } else {
      // For now, ignore non-agree votes (future: collect feedback for disagreements)
    }

    // Re-load populated message to include names
    const populated = await Disagreement.findById(disagreementId)
      .populate({ path: 'messages.sender', select: 'name' })
      .populate({ path: 'messages.agreements.user', select: 'name' })
      .lean();

    const updatedMsg = Array.isArray(populated?.messages)
      ? populated.messages.find(m => String(m._id) === String(messageId))
      : null;

    // Emit real-time update
    try {
      const io = req.app.get('io');
      if (io && updatedMsg) {
        io.to(disagreementId).emit('proposalUpdated', updatedMsg);
      }
    } catch (e) {
      try { console.error('[socket] proposalUpdated emit error:', e?.message || e); } catch (_) {}
    }

    return res.status(200).json(updatedMsg || { ok: true });
  } catch (err) {
    console.error('vote endpoint error:', err?.message || err);
    return res.status(500).json({ message: 'Failed to record vote.' });
  }
});

export default router;