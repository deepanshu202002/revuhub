import express from "express";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";

import {
  createProduct,
  listProducts,
  getProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", protect, adminOnly, createProduct);
// router.post("/", createProduct);

export default router;
