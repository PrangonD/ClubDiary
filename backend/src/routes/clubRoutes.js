// Feature 5 (Sprint 1) - Club Explorer Dashboard data source (club listing) - Owner: PRANGON
// Feature 4 (Sprint 1) - Create / Edit / Delete Club (CRUD) - Owner: Prapty
const express = require("express");
const Club = require("../models/Club");
const Membership = require("../models/Membership");
const {
  parsePagination,
  normalizeString,
  requireFields,
} = require("../utils/validators");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

const DEFAULT_CLUBS = [
  {
    name: "Programming Club",
    category: "Tech",
    description: "Coding sessions and hackathons.",
  },
  {
    name: "Debate Club",
    category: "Communication",
    description: "Weekly debate practice and public speaking drills.",
  },
  {
    name: "Cultural Club",
    category: "Arts",
    description: "Events, performances, and cultural festivals.",
  },
  {
    name: "Photography Society",
    category: "Arts",
    description: "Photo walks, editing workshops, and gallery showcases.",
  },
  {
    name: "Green Earth Initiative",
    category: "Community",
    description: "Campus cleanup, sustainability talks, and tree drives.",
  },
  {
    name: "Esports & Gaming",
    category: "Tech",
    description: "Competitive matches, scrims, and casual gaming nights.",
  },
];

async function ensureDefaultClubs() {
  const existing = await Club.find({}, { name: 1 }).lean();
  const existingNames = new Set(existing.map((club) => club.name));
  const missing = DEFAULT_CLUBS.filter((club) => !existingNames.has(club.name));
  if (missing.length > 0) {
    await Club.insertMany(missing);
  }
}

// GET all clubs (public)
router.get("/", async (req, res) => {
  await ensureDefaultClubs();

  const { page, limit, skip } = parsePagination(req.query, {
    page: 1,
    limit: 6,
    maxLimit: 50,
  });
  const [clubs, total] = await Promise.all([
    Club.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Club.countDocuments(),
  ]);

  const clubIds = clubs.map((club) => club._id);
  const memberCounts = await Membership.aggregate([
    { $match: { club: { $in: clubIds }, status: "approved" } },
    { $group: { _id: "$club", count: { $sum: 1 } } },
  ]);
  const memberCountMap = new Map(
    memberCounts.map((item) => [String(item._id), item.count]),
  );
  const clubsWithCounts = clubs.map((club) => ({
    ...club,
    membersCount: memberCountMap.get(String(club._id)) || 0,
    memberCount: memberCountMap.get(String(club._id)) || 0,
  }));

  res.json({
    items: clubsWithCounts,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// POST create club (admin only)
router.post("/", protect, allowRoles("Admin"), async (req, res) => {
  try {
    const payload = {
      name: normalizeString(req.body.name, 80),
      category: normalizeString(req.body.category || "General", 50),
      description: normalizeString(req.body.description || "", 500),
    };

    const required = requireFields(payload, ["name"]);
    if (!required.ok) {
      return res
        .status(400)
        .json({
          message: `Missing required field(s): ${required.missing.join(", ")}`,
        });
    }

    if (payload.name.length < 1 || payload.name.length > 80) {
      return res
        .status(400)
        .json({ message: "Club name must be between 1 and 80 characters" });
    }

    const existing = await Club.findOne({ name: payload.name });
    if (existing) {
      return res
        .status(400)
        .json({ message: "A club with this name already exists" });
    }

    const club = await Club.create({
      name: payload.name,
      category: payload.category,
      description: payload.description,
    });

    res.status(201).json({
      _id: club._id,
      name: club.name,
      category: club.category,
      description: club.description,
      createdAt: club.createdAt,
      membersCount: 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create club" });
  }
});

// PUT update club (admin only)
router.put("/:id", protect, allowRoles("Admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const payload = {
      name:
        req.body.name !== undefined
          ? normalizeString(req.body.name, 80)
          : club.name,
      category:
        req.body.category !== undefined
          ? normalizeString(req.body.category, 50)
          : club.category,
      description:
        req.body.description !== undefined
          ? normalizeString(req.body.description, 500)
          : club.description,
    };

    if (payload.name.length < 1 || payload.name.length > 80) {
      return res
        .status(400)
        .json({ message: "Club name must be between 1 and 80 characters" });
    }

    if (payload.name !== club.name) {
      const existing = await Club.findOne({ name: payload.name });
      if (existing) {
        return res
          .status(400)
          .json({ message: "A club with this name already exists" });
      }
    }

    club.name = payload.name;
    club.category = payload.category;
    club.description = payload.description;
    await club.save();

    const memberCount = await Membership.countDocuments({
      club: club._id,
      status: "approved",
    });

    res.json({
      _id: club._id,
      name: club.name,
      category: club.category,
      description: club.description,
      updatedAt: club.updatedAt,
      membersCount: memberCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update club" });
  }
});

// DELETE club (admin only)
router.delete("/:id", protect, allowRoles("Admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const memberCount = await Membership.countDocuments({
      club: id,
      status: "approved",
    });
    if (memberCount > 0) {
      return res.status(409).json({
        message: `Cannot delete club with ${memberCount} active member(s). Remove members first.`,
      });
    }

    await Club.findByIdAndDelete(id);

    res.json({ message: "Club deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete club" });
  }
});

module.exports = router;
