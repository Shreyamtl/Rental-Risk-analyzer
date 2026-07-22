import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  analyzeAgreement,
  getAgreementHistory,
  getAgreementById,
  downloadReport,
  submitFeedback,
  deleteAgreement,
  chatAboutAgreement 
} from "../controllers/agreementController.js";

const router = express.Router();

router.post("/analyze", protect, upload.array("agreement" , 15), analyzeAgreement);
router.get("/", protect, getAgreementHistory);
router.get("/:id", protect, getAgreementById);
router.get("/:id/report", protect, downloadReport);
router.patch("/:id/feedback/:clauseIndex", protect, submitFeedback);
router.post("/:id/chat", protect, chatAboutAgreement);
router.delete("/:id", protect, deleteAgreement);

export default router;
