const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Allow frontend to talk to backend
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/club_diary')
  .then(() => console.log('✅ MongoDB connected!'))
  .catch((err) => console.log('❌ Error:', err));

// Define what a Club looks like in the database
const ClubSchema = new mongoose.Schema({
  name:            String,
  category:        String,
  description:     String,
  memberCount:     Number,
  meetingSchedule: String,
  contactEmail:    String,
  tags:            [String],
  coverImage:      String,
});

const Club = mongoose.model('Club', ClubSchema);

// ─── ROUTES ───────────────────────────────────────

// GET all clubs (with optional search & category filter)
app.get('/api/clubs', async (req, res) => {
  try {
    const { search, category } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    const clubs = await Club.find(filter);
    res.json({ success: true, data: clubs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET one club by ID
app.get('/api/clubs/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    res.json({ success: true, data: club });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET stats (total clubs & members)
app.get('/api/stats', async (req, res) => {
  try {
    const totalClubs = await Club.countDocuments();
    const all = await Club.find({}, 'memberCount');
    const totalMembers = all.reduce((sum, c) => sum + (c.memberCount || 0), 0);
    res.json({ success: true, data: { totalClubs, totalMembers } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add a new club
app.post('/api/clubs', async (req, res) => {
  try {
    const club = await Club.create(req.body);
    res.status(201).json({ success: true, data: club });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('🚀 Server running at http://localhost:5000');
});
