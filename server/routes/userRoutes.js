const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public route for user registration
router.post('/register', registerUser);

// Public route for user login
router.post('/login', loginUser);

// Private route to get current user's data
// This route is protected by the 'protect' middleware
router.get('/me', protect, getMe);

module.exports = router;