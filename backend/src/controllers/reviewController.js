import Review from "../models/Review.js";
import Product from "../models/Product.js";

// export const getReviews = async (req, res) => {
//   const { category, productId } = req.query;
//   let query = { status: "approved" };

//   if (category) {
//     const products = await Product.find({ category });
//     query.product = { $in: products.map((p) => p._id) };
//   }

//   if (productId) query.product = productId;

//   const reviews = await Review.find(query).populate("user product");
//   res.json(reviews);
// };

// Get all reviews for admin (no status filter)
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name picture") // return only name & picture
      .populate("product"); // include product info
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching all reviews:", err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

export const getReviews = async (req, res) => {
  const { category, productId } = req.query;
  let query = { status: "approved" };

  if (category) {
    const products = await Product.find({ category });
    query.product = { $in: products.map((p) => p._id) };
  }

  if (productId) query.product = productId;

  const reviews = await Review.find(query)
    .populate("user", "name picture") // only return name & picture
    .populate("product"); // still return product
  res.json(reviews);
};

// export const getMyReviews = async (req, res) => {
//   const reviews = await Review.find({ user: req.user.id }).populate("product");
//   res.json(reviews);
// };
export const getMyReviews = async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate("product")
    .populate("user", "name picture");
  res.json(reviews);
};

// export const createReview = async (req, res) => {
//   const { productId, text, imageUrls = {} } = req.body;
//   const review = await Review.create({
//     user: req.user.id,
//     product: productId,
//     text,
//     imageUrls,
//     status: "in-progress",
//   });
//   res.json(review);
// };

export const createReview = async (req, res) => {
  const { productId, text, imageUrls = [] } = req.body;
  let review = await Review.create({
    user: req.user._id,
    product: productId,
    text,
    imageUrls,
    status: "in-progress",
  });

  review = await review.populate("user", "name picture");
  review = await review.populate("product");

  res.json(review);
};

export const approveReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  review.status = "approved";
  await review.save();
  res.json(review);
};

export const declineReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  review.status = "declined";
  await review.save();
  res.json(review);
};
