// Feature 17 (Sprint 3) - News/Blog publishing API - Owner: PRANGON
const express = require("express");
const Post = require("../models/Post");
const Club = require("../models/Club");
const { protect, allowRoles } = require("../middleware/authMiddleware");
const { isValidObjectId, parsePagination, normalizeString } = require("../utils/validators");

const router = express.Router();

router.get("/", async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 10, maxLimit: 50 });
  const filter = {};
  if (req.query.clubId) {
    if (!isValidObjectId(req.query.clubId)) return res.status(400).json({ message: "Invalid club id" });
    filter.club = req.query.clubId;
  }

  const [posts, total] = await Promise.all([
    Post.find(filter).populate("author", "name role").populate("club", "name").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Post.countDocuments(filter)
  ]);

  res.json({ items: posts, page, limit, total, totalPages: Math.ceil(total / limit) });
});

router.post("/", protect, allowRoles("Admin", "President"), async (req, res) => {
  const title = normalizeString(req.body.title, 160);
  const content = normalizeString(req.body.content, 5000);
  const clubId = req.body.clubId;

  if (!title || !content || !clubId) {
    return res.status(400).json({ message: "title, content and clubId are required" });
  }
  if (!isValidObjectId(clubId)) return res.status(400).json({ message: "Invalid club id" });
  const club = await Club.findById(clubId);
  if (!club) return res.status(404).json({ message: "Club not found" });

  const post = await Post.create({ title, content, club: clubId, author: req.user._id });
  res.status(201).json(post);
});

router.put("/:id", protect, allowRoles("Admin", "President"), async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid post id" });
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const isAdmin = req.user.role === "Admin";
  const isOwner = String(post.author) === String(req.user._id);
  if (!isAdmin && !isOwner) return res.status(403).json({ message: "Only author or admin can edit" });

  if (req.body.title !== undefined) post.title = normalizeString(req.body.title, 160);
  if (req.body.content !== undefined) post.content = normalizeString(req.body.content, 5000);
  if (req.body.clubId !== undefined) {
    if (!isValidObjectId(req.body.clubId)) return res.status(400).json({ message: "Invalid club id" });
    const club = await Club.findById(req.body.clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });
    post.club = req.body.clubId;
  }

  await post.save();
  res.json(post);
});

router.delete("/:id", protect, allowRoles("Admin", "President"), async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid post id" });
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const isAdmin = req.user.role === "Admin";
  const isOwner = String(post.author) === String(req.user._id);
  if (!isAdmin && !isOwner) return res.status(403).json({ message: "Only author or admin can delete" });

  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
});

module.exports = router;
