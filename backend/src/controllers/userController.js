import User from "../models/User.js";

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
};
export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User Not Found" });

  user.name = req.body.name || user.name;
  user.picture = req.body.picture || user.picture;
  await user.save();

  res.json(user);
};
