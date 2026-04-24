// Feature 1 (Sprint 1) - User Authentication (Login/Register/JWT) - Owner: MUNEEM
const express = require("express");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { normalizeString, requireFields } = require("../utils/validators");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const payload = {
      name: normalizeString(req.body.name, 80),
      email: normalizeString(req.body.email, 120).toLowerCase(),
      password: req.body.password
    };

    const required = requireFields(payload, ["name", "email", "password"]);
    if (!required.ok) {
      return res.status(400).json({ message: `Missing required field(s): ${required.missing.join(", ")}` });
    }

    if (payload.password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const exists = await User.findOne({ email: payload.email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    // Security: all self-registrations are Student only.
    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: "Student"
    });

    return res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (_error) {
    return res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = normalizeString(req.body.email, 120).toLowerCase();
    const password = req.body.password || "";
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    return res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (_error) {
    return res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
