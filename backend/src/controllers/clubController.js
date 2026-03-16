const Club = require('../models/Club');

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Private (All authenticated roles)
exports.getClubs = async (req, res) => {
  try {
    const clubs = await Club.find({ status: 'Active' });
    res.status(200).json({ success: true, count: clubs.length, data: clubs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get single club
// @route   GET /api/clubs/:id
// @access  Private (All authenticated roles)
exports.getClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }
    res.status(200).json({ success: true, data: club });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create new club
// @route   POST /api/clubs
// @access  Private (System Admin)
exports.createClub = async (req, res) => {
  try {
    // Only System Admins can create clubs per our clarification
    const club = await Club.create(req.body);
    res.status(201).json({
      success: true,
      data: club
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update club
// @route   PUT /api/clubs/:id
// @access  Private (Club Admin for this club, or System Admin)
exports.updateClub = async (req, res) => {
  try {
    let club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }

    // Role check: If Club Admin, must be listed in club.admins
    if (req.user.role === 'Club Admin') {
      const isAdminOfClub = club.admins.some(adminId => adminId.toString() === req.user.id);
      if (!isAdminOfClub) {
        return res.status(403).json({ success: false, error: 'User is not an admin of this club' });
      }
    }

    club = await Club.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: club });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete club
// @route   DELETE /api/clubs/:id
// @access  Private (System Admin)
exports.deleteClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }

    await club.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
