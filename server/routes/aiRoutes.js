import express from 'express';
import { summarizeDescription, summarizeTitle } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/summarize-description
router.post('/summarize-description', summarizeDescription);
// POST /api/ai/summarize-title
router.post('/summarize-title', summarizeTitle);

export default router;
