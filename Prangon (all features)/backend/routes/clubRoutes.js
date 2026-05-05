// Feature 5 (Sprint 1) - Club Explorer Dashboard data source (club listing) - Owner: PRANGON
const express = require("express");
const Club = require("../models/Club");
const Membership = require("../models/Membership");
const { parsePagination } = require("../utils/validators");

const router = express.Router();

const DEFAULT_CLUBS = [
  { name: "Programming Club", category: "Tech", description: "Coding sessions and hackathons." },
  { name: "Debate Club", category: "Communication", description: "Weekly debate practice and public speaking drills." },
  { name: "Cultural Club", category: "Arts", description: "Events, performances, and cultural festivals." },
  { name: "Photography Society", category: "Arts", description: "Photo walks, editing workshops, and gallery showcases." },
  { name: "Green Earth Initiative", category: "Community", description: "Campus cleanup, sustainability talks, and tree drives." },
  { name: "Esports & Gaming", category: "Tech", description: "Competitive matches, scrims, and casual gaming nights." }
];

async function ensureDefaultClubs() {
  const existing = await Club.find({}, { name: 1 }).lean();
  const existingNames = new Set(existing.map((club) => club.name));
  const missing = DEFAULT_CLUBS.filter((club) => !existingNames.has(club.name));
  if (missing.length > 0) {
    await Club.insertMany(missing);
  }
}

router.get("/", async (req, res) => {
  await ensureDefaultClubs();

  const { page, limit, skip } = parsePagination(req.query, { page: 1, limit: 6, maxLimit: 50 });
  const [clubs, total] = await Promise.all([
    Club.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Club.countDocuments()
  ]);

  const clubIds = clubs.map((club) => club._id);
  const memberCounts = await Membership.aggregate([
    { $match: { club: { $in: clubIds }, status: "approved" } },
    { $group: { _id: "$club", count: { $sum: 1 } } }
  ]);
  const memberCountMap = new Map(memberCounts.map((item) => [String(item._id), item.count]));
  const clubsWithCounts = clubs.map((club) => ({
    ...club,
    membersCount: memberCountMap.get(String(club._id)) || 0,
    memberCount: memberCountMap.get(String(club._id)) || 0
  }));

  res.json({
    items: clubsWithCounts,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

module.exports = router;
