const express = require('express');
const router = express.Router();
const {
  createDisagreement,
  getDisagreements,
  getDisagreementById,
  inviteUserToDisagreement,
  analyzeDisagreement,
  generateUploadUrl,
} = require('../controllers/disagreementController');
const { protect } = require('../middleware/authMiddleware');

// Routes for creating and getting all disagreements
router
  .route('/')
  .post(protect, createDisagreement)
  .get(protect, getDisagreements);

// Route for getting a specific disagreement by its ID
router.route('/:id').get(protect, getDisagreementById);

// Route for inviting a user to a specific disagreement
router.route('/:id/invite').post(protect, inviteUserToDisagreement);

// Route for triggering AI analysis
router.route('/:id/analyze').post(protect, analyzeDisagreement);

// Route for generating a pre-signed upload URL 
router.route('/:id/upload').post(protect, generateUploadUrl);

module.exports = router;