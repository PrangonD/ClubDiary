// Feature 10 (Sprint 2) - Event Creation & Management API - Owner: PRANGON
const express = require("express");
const Event = require("../models/Event");
const Club = require("../models/Club");
const { protect, allowRoles } = require("../middleware/authMiddleware");
const { isValidObjectId, parsePagination, normalizeString } = require("../utils/validators");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });
  const filter = {};
  if (req.query.start || req.query.end) {
    filter.date = {};
    if (req.query.start) filter.date.$gte = new Date(req.query.start);
    if (req.query.end) filter.date.$lte = new Date(req.query.end);
  }

  const [events, total] = await Promise.all([
    Event.find(filter).populate("club", "name").sort({ date: 1 }).skip(skip).limit(limit),
    Event.countDocuments(filter)
  ]);

  res.json({ items: events, page, limit, total, totalPages: Math.ceil(total / limit) });
});

router.post("/", protect, allowRoles("Admin", "President"), async (req, res) => {
  const title = normalizeString(req.body.title, 120);
  const description = normalizeString(req.body.description, 1000);
  const date = req.body.date;
  const clubId = req.body.clubId;

  if (!title || !date || !clubId) {
    return res.status(400).json({ message: "title, date and clubId are required" });
  }
  if (!isValidObjectId(clubId)) {
    return res.status(400).json({ message: "Invalid club id" });
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: "Invalid event date" });
  }

  const club = await Club.findById(clubId);
  if (!club) return res.status(404).json({ message: "Club not found" });

  const event = await Event.create({
    title,
    description,
    date: parsedDate,
    club: clubId,
    createdBy: req.user._id
  });
  res.status(201).json(event);
});

router.put("/:id", protect, allowRoles("Admin", "President"), async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid event id" });

  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  const isAdmin = req.user.role === "Admin";
  const isOwner = String(event.createdBy) === String(req.user._id);
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: "Only creator or admin can modify this event" });
  }

  if (req.body.title !== undefined) event.title = normalizeString(req.body.title, 120);
  if (req.body.description !== undefined) event.description = normalizeString(req.body.description, 1000);
  if (req.body.date !== undefined) {
    const d = new Date(req.body.date);
    if (Number.isNaN(d.getTime())) return res.status(400).json({ message: "Invalid event date" });
    event.date = d;
  }
  if (req.body.clubId !== undefined) {
    if (!isValidObjectId(req.body.clubId)) return res.status(400).json({ message: "Invalid club id" });
    const club = await Club.findById(req.body.clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });
    event.club = req.body.clubId;
  }

  await event.save();
  res.json(event);
});

router.delete("/:id", protect, allowRoles("Admin", "President"), async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid event id" });
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  const isAdmin = req.user.role === "Admin";
  const isOwner = String(event.createdBy) === String(req.user._id);
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: "Only creator or admin can delete this event" });
  }

  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: "Event deleted" });
});

module.exports = router;
