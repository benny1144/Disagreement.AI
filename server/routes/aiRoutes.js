import express from 'express';
import { summarizeDescription, summarizeTitle, checkNeutrality, generateNeutralTitleAndDescription } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/summarize-description
router.post('/summarize-description', summarizeDescription);
// POST /api/ai/summarize-title
router.post('/summarize-title', summarizeTitle);
// POST /api/ai/check-neutrality
router.post('/check-neutrality', checkNeutrality);
// POST /api/ai/generate-neutral
router.post('/generate-neutral', generateNeutralTitleAndDescription);

export default router;
