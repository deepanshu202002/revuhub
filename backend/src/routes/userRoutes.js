import express from "express";

import { protect } from "../middlewares/authMiddleware.js";

import { getProfile, updateProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);

export default router;
