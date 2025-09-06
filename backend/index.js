import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import errorHandler from "./src/middlewares/errorHandler.js";

dotenv.config();
import { checkS3Credentials } from "../backend/src/config/s3.js";
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
checkS3Credentials();
app.get("/", (req, res) => res.send("RevuHub Api Running"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/uploads", uploadRoutes);
app.use(errorHandler);

// console.log("userRoutes:", userRoutes);
// console.log("productRoutes:", productRoutes);
// console.log("reviewRoutes:", reviewRoutes);
// console.log("uploadRoutes:", uploadRoutes);
// console.log("errorHandler:", errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
