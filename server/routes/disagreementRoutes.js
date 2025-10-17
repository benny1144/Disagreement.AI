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

export default router;