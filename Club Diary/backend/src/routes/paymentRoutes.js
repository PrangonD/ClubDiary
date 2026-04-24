// Feature 16 (Sprint 4) - Membership Fee Tracking API - Owner: Unassigned in sprint note
const express = require("express");
const Payment = require("../models/Payment");
const Club = require("../models/Club");
const User = require("../models/User");
const { protect, allowRoles } = require("../middleware/authMiddleware");
const { isValidObjectId, parsePagination, monthKey } = require("../utils/validators");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });
  const filter = {};
  if (req.query.clubId) {
    if (!isValidObjectId(req.query.clubId)) return res.status(400).json({ message: "Invalid club id" });
    filter.club = req.query.clubId;
  }
  if (req.query.billingPeriod) filter.billingPeriod = req.query.billingPeriod;

  const [payments, total] = await Promise.all([
    Payment.find(filter).populate("user", "name email").populate("club", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Payment.countDocuments(filter)
  ]);

  res.json({ items: payments, page, limit, total, totalPages: Math.ceil(total / limit) });
});

router.post("/", protect, allowRoles("Admin", "President"), async (req, res) => {
  const { userId, clubId } = req.body;
  const amount = Number(req.body.amount);
  const billingPeriod = req.body.billingPeriod || monthKey(new Date());

  if (!userId || !clubId || !Number.isFinite(amount)) {
    return res.status(400).json({ message: "userId, clubId and amount are required" });
  }
  if (amount <= 0) return res.status(400).json({ message: "Amount must be greater than 0" });
  if (!isValidObjectId(userId) || !isValidObjectId(clubId)) {
    return res.status(400).json({ message: "Invalid userId or clubId" });
  }

  const [user, club] = await Promise.all([User.findById(userId), Club.findById(clubId)]);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!club) return res.status(404).json({ message: "Club not found" });

  try {
    const payment = await Payment.create({ user: userId, club: clubId, amount, billingPeriod });
    res.status(201).json(payment);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: `Payment already recorded for ${billingPeriod}` });
    }
    throw err;
  }
});

module.exports = router;
