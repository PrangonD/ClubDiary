const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scanCode: { type: String, required: true, trim: true, maxlength: 120 }
  },
  { timestamps: true }
);

attendanceSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
