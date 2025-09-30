import express from "express";
import {
  createDisagreement,
  getDisagreements,
  getDisagreementById,
  addMessage,
  inviteUserToDisagreement,
  removeDisagreement,
  analyzeDisagreement,
} from "../controllers/disagreementController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createDisagreement).get(protect, getDisagreements);

router
  .route("/:id")
  .get(protect, getDisagreementById)
  .delete(protect, removeDisagreement);

router.route("/:id/messages").post(protect, addMessage);
router.route("/:id/invite").post(protect, inviteUserToDisagreement);
router.route("/:id/analyze").post(protect, analyzeDisagreement);

export default router;
