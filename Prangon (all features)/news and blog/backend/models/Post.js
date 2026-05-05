const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 160 },
    content: { type: String, required: true, trim: true, minlength: 5, maxlength: 5000 },
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
