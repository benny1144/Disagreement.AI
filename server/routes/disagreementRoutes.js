import express from 'express';
const router = express.Router();
import {
    getDisagreements,
    createDisagreement,
    getDisagreement,
    updateDisagreement,
    deleteDisagreement,
    processDisagreement,
    inviteUser
} from '../controllers/disagreementController.js'; // Added .js
import { protect } from '../middleware/authMiddleware.js'; // Added .js

router.route('/').get(protect, getDisagreements).post(protect, createDisagreement);
router.route('/:id/process').post(protect, processDisagreement);
router.route('/:id/invite').post(protect, inviteUser);
router.route('/:id').get(protect, getDisagreement).put(protect, updateDisagreement).delete(protect, deleteDisagreement);

export default router;