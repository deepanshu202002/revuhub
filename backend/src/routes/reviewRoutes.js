import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

import {
  getReviews,
  getMyReviews,
  createReview,
  approveReview,
  declineReview,
  getAllReviewsAdmin,
} from "../controllers/reviewController.js";

const router = express.Router();
router.get("/", getReviews);
router.get("/admin", getAllReviewsAdmin);
router.get("/me", protect, getMyReviews);
router.post("/", protect, createReview);
router.post("/:id/approve", protect, adminOnly, approveReview);
router.post("/:id/decline", protect, adminOnly, declineReview);
export default router;
