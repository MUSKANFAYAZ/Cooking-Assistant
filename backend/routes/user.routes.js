// backend/routes/user.routes.js 
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware.js');
const {
  getUserProfile,
  toggleFavorite,
} = require('../controllers/user.controller.js');

router.route('/profile').get(protect, getUserProfile);

// The POST route correctly uses :recipeId in the URL parameter
router.route('/favorites/toggle/:recipeId')
  .post(protect, toggleFavorite);

module.exports = router;