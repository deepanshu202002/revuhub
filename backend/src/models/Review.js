import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    text: String,
    imageUrls: [String],
    status: {
      type: String,
      enum: ["in-progress", "approved", "declined"],
      default: "in-progress",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
