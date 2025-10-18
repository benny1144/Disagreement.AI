import express from 'express';
import { summarizeDescription } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/summarize-description
router.post('/summarize-description', summarizeDescription);

export default router;
