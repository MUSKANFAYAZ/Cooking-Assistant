// backend/routes/user.routes.js 
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware.js');
const {
  getUserProfile,
  toggleFavorite,
  getUserTimers,
  setUserTimers,
} = require('../controllers/user.controller.js');

router.route('/profile').get(protect, getUserProfile);

// The POST route correctly uses :recipeId in the URL parameter
router.route('/favorites/toggle/:recipeId')
  .post(protect, toggleFavorite);

// Timers: per-user persistence
router.route('/timers')
  .get(protect, getUserTimers)
  .put(protect, setUserTimers);

module.exports = router;