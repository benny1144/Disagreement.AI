userRoutes.js
import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { check } from 'express-validator';

const router = express.Router();

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  registerUser
);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

export default router;