// Feature 3 (Sprint 2) - Role-Based Access Control support (role assignment/admin control) - Owner: MUNEEM
const express = require("express");
const User = require("../models/User");
const { protect, allowRoles } = require("../middleware/authMiddleware");
const { isValidObjectId } = require("../utils/validators");

const router = express.Router();

router.get("/", protect, allowRoles("Admin", "President"), async (_req, res) => {
  const users = await User.find().select("name email role").sort({ name: 1 });
  res.json(users);
});

router.patch("/:id/role", protect, allowRoles("Admin"), async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }
  const allowedRoles = ["Admin", "President", "Student"];
  const role = String(req.body.role || "");
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role value" });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.role = role;
  await user.save();

  res.json({
    message: "Role updated",
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

module.exports = router;
