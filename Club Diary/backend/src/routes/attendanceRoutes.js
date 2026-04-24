// Feature 12 (Sprint 5) - Attendance Tracking API - Owner: Unassigned in sprint note
const express = require("express");
const Attendance = require("../models/Attendance");
const Event = require("../models/Event");
const User = require("../models/User");
const { protect, allowRoles } = require("../middleware/authMiddleware");
const { isValidObjectId, parsePagination, normalizeString } = require("../utils/validators");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });
  const filter = {};
  if (req.query.eventId) {
    if (!isValidObjectId(req.query.eventId)) return res.status(400).json({ message: "Invalid event id" });
    filter.event = req.query.eventId;
  }
  const [items, total] = await Promise.all([
    Attendance.find(filter).populate("event", "title date").populate("user", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Attendance.countDocuments(filter)
  ]);
  res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
});

router.get("/options", protect, allowRoles("Admin", "President"), async (_req, res) => {
  const [events, users] = await Promise.all([
    Event.find().select("title date").sort({ date: -1 }).limit(100),
    User.find().select("name email").sort({ name: 1 }).limit(500)
  ]);
  res.json({ events, users });
});

router.post("/scan", protect, allowRoles("Admin", "President"), async (req, res) => {
  const { eventId, userId } = req.body;
  const scanCode = normalizeString(req.body.scanCode || "SIMULATED-SCAN", 120);
  if (!eventId || !userId) return res.status(400).json({ message: "eventId and userId are required" });
  if (!isValidObjectId(eventId) || !isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid eventId or userId" });
  }

  const [event, user] = await Promise.all([Event.findById(eventId), User.findById(userId)]);
  if (!event) return res.status(404).json({ message: "Event not found" });
  if (!user) return res.status(404).json({ message: "User not found" });

  try {
    const record = await Attendance.create({ event: eventId, user: userId, scanCode });
    res.status(201).json(record);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Attendance already recorded" });
    throw err;
  }
});

module.exports = router;
