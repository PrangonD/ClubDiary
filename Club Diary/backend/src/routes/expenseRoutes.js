// Feature 14 (Sprint 4) - Expense Management API - Owner: Unassigned in sprint note
const express = require("express");
const Expense = require("../models/Expense");
const Club = require("../models/Club");
const { protect, allowRoles } = require("../middleware/authMiddleware");
const { uploadReceipt } = require("../middleware/uploadReceipt");
const { isValidObjectId, parsePagination, normalizeString } = require("../utils/validators");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });
  const filter = {};

  if (req.query.clubId) {
    if (!isValidObjectId(req.query.clubId)) return res.status(400).json({ message: "Invalid club id" });
    filter.club = req.query.clubId;
  }

  if (req.query.start || req.query.end) {
    filter.createdAt = {};
    if (req.query.start) filter.createdAt.$gte = new Date(req.query.start);
    if (req.query.end) filter.createdAt.$lte = new Date(req.query.end);
  }

  const [expenses, total] = await Promise.all([
    Expense.find(filter).populate("club", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Expense.countDocuments(filter)
  ]);

  res.json({ items: expenses, page, limit, total, totalPages: Math.ceil(total / limit) });
});

router.post(
  "/",
  protect,
  allowRoles("Admin", "President"),
  (req, res, next) => {
    uploadReceipt.single("receipt")(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message || "Receipt upload failed" });
      next();
    });
  },
  async (req, res) => {
    const clubId = req.body.clubId;
    const title = normalizeString(req.body.title, 160);
    const amount = Number(req.body.amount);

    if (!clubId || !title || !Number.isFinite(amount)) {
      return res.status(400).json({ message: "clubId, title and amount are required" });
    }
    if (amount <= 0) return res.status(400).json({ message: "Amount must be greater than 0" });
    if (!isValidObjectId(clubId)) return res.status(400).json({ message: "Invalid club id" });
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });

    let receiptUrl = normalizeString(req.body.receiptUrl, 500);
    if (req.file) {
      const base = `${req.protocol}://${req.get("host")}`;
      receiptUrl = `${base}/uploads/receipts/${req.file.filename}`;
    }

    const expense = await Expense.create({
      club: clubId,
      title,
      amount,
      receiptUrl,
      createdBy: req.user._id
    });

    res.status(201).json(expense);
  }
);

module.exports = router;
