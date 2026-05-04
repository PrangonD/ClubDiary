// Feature 20 (Sprint 4) - Discussion Forum API - Owner: PRANGON
const express = require("express");
const Discussion = require("../models/Discussion");
const Membership = require("../models/Membership");
const Club = require("../models/Club");
const { protect } = require("../middleware/authMiddleware");
const { isValidObjectId, parsePagination, normalizeString } = require("../utils/validators");

const router = express.Router();

router.get("/:clubId", protect, async (req, res) => {
  const { clubId } = req.params;
  if (!isValidObjectId(clubId)) return res.status(400).json({ message: "Invalid club id" });

  const club = await Club.findById(clubId);
  if (!club) return res.status(404).json({ message: "Club not found" });

  const allowed = await Membership.findOne({ user: req.user._id, club: clubId, status: "approved" });
  if (!allowed && req.user.role === "Student") {
    return res.status(403).json({ message: "Join and get approved first" });
  }

  const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 30, maxLimit: 100 });
  const [messages, total] = await Promise.all([
    Discussion.find({ club: clubId }).populate("createdBy", "name role").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Discussion.countDocuments({ club: clubId })
  ]);

  res.json({
    items: messages.reverse(),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

router.post("/", protect, async (req, res) => {
  const clubId = req.body.clubId;
  const text = normalizeString(req.body.text, 1000);
  if (!clubId || !text) {
    return res.status(400).json({ message: "clubId and text are required" });
  }
  if (!isValidObjectId(clubId)) return res.status(400).json({ message: "Invalid club id" });

  if (req.user.role === "Student") {
    const approved = await Membership.findOne({ user: req.user._id, club: clubId, status: "approved" });
    if (!approved) {
      return res.status(403).json({ message: "Join the club and wait for approval before posting in its discussion" });
    }
  }

  const message = await Discussion.create({ club: clubId, text, createdBy: req.user._id });
  const populated = await Discussion.findById(message._id).populate("createdBy", "name role");
  res.status(201).json(populated);
});

module.exports = router;
