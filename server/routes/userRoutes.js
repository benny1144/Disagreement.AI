import express from 'express';
const router = express.Router();
import { registerUser, loginUser, getMe, changePassword, deleteMe, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.delete('/me', protect, deleteMe);

export default router;