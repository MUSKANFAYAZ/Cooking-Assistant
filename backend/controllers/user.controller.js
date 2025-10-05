// backend/controllers/user.controller.js (Updated to use only recipeId)

const User = require('../models/user.model.js');
const Recipe = require('../models/recipe.model.js'); 
const mongoose = require('mongoose');

// Existing function to get the current user's profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('favorites');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            favorites: user.favorites, // Populated with full recipe objects
            timers: user.timers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// NEW: Single function to efficiently toggle a recipe in/out of favorites
const toggleFavorite = async (req, res) => {
    // Expects recipeId from URL parameter
    const { recipeId } = req.params; 
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
        // You might skip this validation if you use MealDB IDs which are strings, 
        // but keep it if you expect MongoDB ObjectIds.
        // For hybrid systems, you might need a custom ID check.
        // For now, let's keep it assuming your backend deals with MongoDB IDs.
        return res.status(400).json({ message: 'Invalid Recipe ID format.' });
    }

    try {
        // Find the user and check current favorite status
        const user = await User.findById(userId).select('favorites');
        const isCurrentlyFavorited = user.favorites.some(
            (favId) => favId.toString() === recipeId
        );

        let updateOperation;
        let action;

        if (isCurrentlyFavorited) {
            updateOperation = { $pull: { favorites: recipeId } };
            action = 'removed';
        } else {
            // Note: Since you're dealing with multiple ID types (MongoDB vs MealDB), 
            // ensure the Recipe model (if used here) can handle the lookup, 
            // or trust the frontend is sending a valid ID you want to store.
            updateOperation = { $addToSet: { favorites: recipeId } };
            action = 'added';
        }

        await User.findByIdAndUpdate(userId, updateOperation);

        // Fetch the updated favorites list (populated) to send back to the frontend
        const updatedUser = await User.findById(userId).populate('favorites');
        
        res.status(200).json({ 
            message: `Recipe successfully ${action}.`,
            isFavorited: action === 'added',
            favorites: updatedUser.favorites // Send the full list back
        });

    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ message: 'Server error while toggling favorite.' });
    }
};

module.exports = { 
    getUserProfile, 
    toggleFavorite 
};