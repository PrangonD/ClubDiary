const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

membershipSchema.index({ user: 1, club: 1 }, { unique: true });

module.exports = mongoose.model("Membership", membershipSchema);
