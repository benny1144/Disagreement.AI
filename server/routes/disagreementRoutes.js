import express from "express";
import {
  getDisagreements,
  setDisagreement,
  updateDisagreement,
  deleteDisagreement,
} from "../controllers/disagreementController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getDisagreements).post(protect, setDisagreement);
router
  .route("/:id")
  .delete(protect, deleteDisagreement)
  .put(protect, updateDisagreement);

export default router;
