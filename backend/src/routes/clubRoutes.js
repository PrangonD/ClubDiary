const express = require('express');
const {
  getClubs,
  getClub,
  createClub,
  updateClub,
  deleteClub
} = require('../controllers/clubController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Apply verifyToken to all routes
router.use(verifyToken);

router.route('/')
  .get(getClubs)
  .post(authorizeRoles('System Admin'), createClub);

router.route('/:id')
  .get(getClub)
  .put(authorizeRoles('System Admin', 'Club Admin'), updateClub)
  .delete(authorizeRoles('System Admin'), deleteClub);

module.exports = router;
