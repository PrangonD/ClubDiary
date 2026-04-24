// Feature 8/9 (Sprint 2/3) - Join Request + Member Management - Owner: Prapty
const express = require("express");
const Membership = require("../models/Membership");
const Club = require("../models/Club");
const { protect, allowRoles } = require("../middleware/authMiddleware");
const { isValidObjectId, parsePagination } = require("../utils/validators");

const router = express.Router();

router.post("/join", protect, async (req, res) => {
  const { clubId } = req.body;
  if (!isValidObjectId(clubId)) {
    return res.status(400).json({ message: "Invalid club id" });
  }

  const club = await Club.findById(clubId);
  if (!club) return res.status(404).json({ message: "Club not found" });

  try {
    const request = await Membership.create({ user: req.user._id, club: clubId });
    res.status(201).json(request);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Request already exists" });
    throw err;
  }
});

router.get("/mine", protect, async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 10, maxLimit: 50 });
  const query = { user: req.user._id };
  const [items, total] = await Promise.all([
    Membership.find(query).populate("club", "name category").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Membership.countDocuments(query)
  ]);
  res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
});

router.get("/requests", protect, allowRoles("Admin", "President"), async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });
  const status = String(req.query.status || "pending");
  const query = {};
  if (["pending", "approved", "rejected"].includes(status)) {
    query.status = status;
  } else {
    query.status = "pending";
  }
  if (isValidObjectId(req.query.clubId)) {
    query.club = req.query.clubId;
  }
  const [requests, total] = await Promise.all([
    Membership.find(query).populate("user", "name email role").populate("club", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Membership.countDocuments(query)
  ]);
  const q = String(req.query.q || "").trim().toLowerCase();
  const filtered = q
    ? requests.filter((r) => {
        const userName = (r.user?.name || "").toLowerCase();
        const userEmail = (r.user?.email || "").toLowerCase();
        const clubName = (r.club?.name || "").toLowerCase();
        return userName.includes(q) || userEmail.includes(q) || clubName.includes(q);
      })
    : requests;
  res.json({ items: filtered, page, limit, total, totalPages: Math.ceil(total / limit) });
});

router.put("/:id/status", protect, allowRoles("Admin", "President"), async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid membership id" });
  }
  const status = String(req.body.status || "");
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Status must be approved or rejected" });
  }

  const membership = await Membership.findById(req.params.id);
  if (!membership) return res.status(404).json({ message: "Request not found" });
  membership.status = status;
  await membership.save();
  res.json(membership);
});

router.delete("/:id", protect, allowRoles("Admin", "President"), async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid membership id" });
  }
  const deleted = await Membership.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Membership record not found" });
  res.json({ message: "Member removed" });
});

module.exports = router;
