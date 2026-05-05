const express = require("express");
const router = express.Router();
const Media = require("../models/Media");
const { protect } = require("../middleware/authMiddleware");
const { uploadMultiple } = require("../middleware/upload");

// POST upload media for a club
router.post("/upload/:clubId", protect, uploadMultiple, async (req, res) => {
  try {
    const { clubId } = req.params;
    
    if (!clubId) {
      return res.status(400).json({ message: "Club ID is required" });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    
    const mediaFiles = req.files.map(file => ({
      club: clubId,
      filename: file.filename,
      originalName: file.originalname,
      filePath: `/uploads/${file.filename}`,
      fileType: file.mimetype.startsWith("image/") ? "image" : "video",
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadedBy: req.user.id,
    }));
    
    const savedMedia = await Media.insertMany(mediaFiles);
    
    res.status(201).json({
      message: `${savedMedia.length} files uploaded successfully`,
      media: savedMedia,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Failed to upload files" });
  }
});

// GET all media for a specific club
router.get("/club/:clubId", async (req, res) => {
  try {
    const { clubId } = req.params;
    
    if (!clubId) {
      return res.status(400).json({ message: "Club ID is required" });
    }
    
    const media = await Media.find({ club: clubId })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      media,
      count: media.length,
    });
  } catch (error) {
    console.error("Fetch media error:", error);
    res.status(500).json({ message: "Failed to fetch media" });
  }
});

// DELETE media file
router.delete("/:mediaId", protect, async (req, res) => {
  try {
    const { mediaId } = req.params;
    
    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }
    
    // Check if user is admin or uploaded this media
    if (req.user.role !== "Admin" && media.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this media" });
    }
    
    await Media.findByIdAndDelete(mediaId);
    
    res.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({ message: "Failed to delete media" });
  }
});

module.exports = router;
