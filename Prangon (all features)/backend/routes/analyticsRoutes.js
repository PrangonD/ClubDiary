// Feature 15/19 (Sprint 5) - Budget Tracking + Analytics Dashboard API - Owner: PRANGON (feature 19)
const express = require("express");
const Membership = require("../models/Membership");
const Event = require("../models/Event");
const Expense = require("../models/Expense");
const Payment = require("../models/Payment");
const { protect, allowRoles } = require("../middleware/authMiddleware");
const { isValidObjectId } = require("../utils/validators");

const router = express.Router();

const CACHE_TTL_MS = 45000;
const analyticsCache = new Map();

const buildRange = (start, end) => {
  if (!start && !end) return null;
  const range = {};
  if (start) range.$gte = new Date(start);
  if (end) range.$lte = new Date(end);
  if (range.$gte && Number.isNaN(range.$gte.getTime())) return null;
  if (range.$lte && Number.isNaN(range.$lte.getTime())) return null;
  return range;
};

router.get("/", protect, allowRoles("Admin", "President"), async (req, res) => {
  const { clubId, start, end } = req.query;
  if (clubId && !isValidObjectId(clubId)) {
    return res.status(400).json({ message: "Invalid club id" });
  }

  const range = buildRange(start, end);
  if ((start || end) && !range) {
    return res.status(400).json({ message: "Invalid start/end date filter" });
  }

  const cacheKey = JSON.stringify({ clubId: clubId || "all", start: start || "", end: end || "" });
  const cached = analyticsCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return res.json({ ...cached.payload, cached: true });
  }

  const membershipFilter = { status: "approved" };
  if (clubId) membershipFilter.club = clubId;
  if (range) membershipFilter.createdAt = range;

  const eventFilter = {};
  if (clubId) eventFilter.club = clubId;
  if (range) eventFilter.date = range;

  const expenseMatch = {};
  if (clubId) expenseMatch.club = new (require("mongoose").Types.ObjectId)(clubId);
  if (range) expenseMatch.createdAt = range;

  const paymentMatch = {};
  if (clubId) paymentMatch.club = new (require("mongoose").Types.ObjectId)(clubId);
  if (range) paymentMatch.createdAt = range;

  const [approvedMembers, totalEvents, expenseAgg, paymentAgg, expenseTrend, feeTrend] = await Promise.all([
    Membership.countDocuments(membershipFilter),
    Event.countDocuments(eventFilter),
    Expense.aggregate([
      { $match: expenseMatch },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Payment.aggregate([
      { $match: paymentMatch },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Payment.aggregate([
      { $match: paymentMatch },
      {
        $group: {
          _id: "$billingPeriod",
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  const totalExpenses = expenseAgg[0]?.total || 0;
  const totalFees = paymentAgg[0]?.total || 0;
  const budgetBalance = totalFees - totalExpenses;

  const payload = {
    members: approvedMembers,
    events: totalEvents,
    finances: {
      totalExpenses,
      totalFees,
      budgetBalance,
      overspending: budgetBalance < 0,
      overspendingAmount: budgetBalance < 0 ? Math.abs(budgetBalance) : 0
    },
    trends: {
      expensesByMonth: expenseTrend,
      feesByMonth: feeTrend
    }
  };

  analyticsCache.set(cacheKey, { ts: Date.now(), payload });
  res.json({ ...payload, cached: false });
});

module.exports = router;
