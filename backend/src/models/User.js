const mongoose = require("mongoose");

// User Schema with auth fields
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Please add a password"],
    },
    role: {
      type: String,
      enum: ["Student", "Club Admin", "System Admin"],
      default: "Student",
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
