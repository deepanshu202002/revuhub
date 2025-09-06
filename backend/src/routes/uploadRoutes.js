import express from "express";

import { protect } from "../middlewares/authMiddleware.js";
import {
  getPresignedUrl,
  getPresignedBatch,
} from "../controllers/uploadController.js";

const router = express.Router();

router.post("/presigned-url", protect, getPresignedUrl);
router.post("/presigned-batch", protect, getPresignedBatch);
export default router;
