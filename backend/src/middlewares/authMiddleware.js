import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
  if (!token) return res.status(401).json({ message: "Not authorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).lean();
    if (!req.user) return res.status(401).json({ message: "Invalid User" });
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

export const adminOnly = (req, res, next) => {
  const isAdmin =
    req.user?.role === "admin" || req.user?.email === process.env.ADMIN_EMAIL;
  if (!isAdmin) return res.status(403).json({ message: "Admin only" });
  next();
};
