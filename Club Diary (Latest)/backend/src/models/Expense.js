const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 160 },
    amount: { type: Number, required: true, min: 0.01 },
    receiptUrl: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
