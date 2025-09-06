import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  const { name, category, images = [] } = req.body;
  const p = await Product.create({ name, category, images });
  res.json(p);
};

export const listProducts = async (req, res) => {
  const { q, category } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (q) filter.name = new RegExp(q, "i");
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
};

export const getProduct = async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Not Found" });
  res.json(p);
};
