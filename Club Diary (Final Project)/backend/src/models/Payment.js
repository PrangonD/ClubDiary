const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    amount: { type: Number, required: true, min: 0.01 },
    billingPeriod: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/
    },
    paidAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, club: 1, billingPeriod: 1 }, { unique: true });

module.exports = mongoose.model("Payment", paymentSchema);
