// Feature 2 (Sprint 1) - Profile Management - Owner: Prapty
const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const { normalizeString } = require("../utils/validators");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) return res.status(404).json({ message: "Profile not found" });
  res.json(user);
});

router.put("/", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "Profile not found" });

  const nextName = req.body.name !== undefined ? normalizeString(req.body.name, 80) : user.name;
  const nextDepartment = req.body.department !== undefined ? normalizeString(req.body.department, 80) : user.department;
  const nextBio = req.body.bio !== undefined ? normalizeString(req.body.bio, 500) : user.bio;

  if (!nextName) {
    return res.status(400).json({ message: "Name is required" });
  }

  user.name = nextName;
  user.department = nextDepartment;
  user.bio = nextBio;
  await user.save();

  res.json({
    message: "Profile updated",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      bio: user.bio
    }
  });
});

module.exports = router;
