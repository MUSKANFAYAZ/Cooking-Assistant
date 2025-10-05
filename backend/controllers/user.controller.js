// backend/controllers/user.controller.js

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

// --- Timers: Get current user's timers ---
const getUserTimers = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('timers');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ timers: user.timers || [] });
    } catch (error) {
        console.error('Error fetching timers:', error);
        res.status(500).json({ message: 'Server error while fetching timers.' });
    }
};

// --- Timers: Replace current user's timers array ---
// Expects body: { timers: Array< { id, name, minutes } > }
const setUserTimers = async (req, res) => {
    try {
        const { timers } = req.body || {};
        if (!Array.isArray(timers)) {
            return res.status(400).json({ message: 'Invalid timers payload. Expected an array.' });
        }

        await User.findByIdAndUpdate(
            req.user._id,
            { $set: { timers } },
            { new: true, upsert: false }
        );

        const updated = await User.findById(req.user._id).select('timers');
        res.status(200).json({ message: 'Timers updated', timers: updated?.timers || [] });
    } catch (error) {
        console.error('Error updating timers:', error);
        res.status(500).json({ message: 'Server error while updating timers.' });
    }
};

// NEW: Toggle a recipe in/out of favorites using externalId and upserting Recipe
const toggleFavorite = async (req, res) => {
    // externalId comes from URL param. Additional recipe fields can be sent in body for upsert.
    const { recipeId: externalId } = req.params; 
    const userId = req.user._id;

    if (!externalId) {
        return res.status(400).json({ message: 'Missing external recipe ID.' });
    }

    try {
        console.log('Toggle favorite request', { userId: userId?.toString?.(), externalId, body: req.body });
        // Upsert Recipe by externalId using any provided fields
        const {
            name,
            image,
            cuisine,
            category,
            description,
            ingredients,
            steps,
        } = req.body || {};

        const upsertDoc = {
            externalId: String(externalId),
        };
        if (name) upsertDoc.name = name;
        if (image) upsertDoc.image = image;
        if (cuisine) upsertDoc.cuisine = cuisine;
        if (category) upsertDoc.category = category;
        if (description) upsertDoc.description = description;
        if (Array.isArray(ingredients)) upsertDoc.ingredients = ingredients;
        if (Array.isArray(steps)) upsertDoc.steps = steps;

        // Ensure required fields on insert
        if (!upsertDoc.name) {
            upsertDoc.name = 'Unknown Recipe';
        }

        // Read -> update-or-create to avoid operator conflicts
        let recipe = await Recipe.findOne({ externalId: String(externalId) });
        if (recipe) {
            const setUpdate = {
                ...(name ? { name } : {}),
                ...(image ? { image } : {}),
                ...(cuisine ? { cuisine } : {}),
                ...(category ? { category } : {}),
                ...(description ? { description } : {}),
                ...(Array.isArray(ingredients) ? { ingredients } : {}),
                ...(Array.isArray(steps) ? { steps } : {}),
            };
            if (Object.keys(setUpdate).length > 0) {
                recipe = await Recipe.findByIdAndUpdate(recipe._id, { $set: setUpdate }, { new: true });
            }
        } else {
            recipe = await Recipe.create({
                externalId: String(externalId),
                name: upsertDoc.name,
                image: upsertDoc.image,
                cuisine: upsertDoc.cuisine,
                category: upsertDoc.category,
                description: upsertDoc.description,
                ingredients: upsertDoc.ingredients,
                steps: upsertDoc.steps,
            });
        }

        // Ensure recipe exists
        if (!recipe) {
            recipe = await Recipe.findOne({ externalId: String(externalId) });
            if (!recipe) {
                return res.status(500).json({ message: 'Recipe upsert failed', error: 'Recipe document is null after upsert.' });
            }
        }

        // Now toggle the recipe._id in user's favorites
        let user = await User.findById(userId).select('favorites');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Clean any nulls in favorites to prevent TypeError
        if (user.favorites && user.favorites.some(f => f === null)) {
            await User.updateOne({ _id: userId }, { $pull: { favorites: null } });
            user = await User.findById(userId).select('favorites');
        }

        // Ensure favorites is an array
        if (!Array.isArray(user.favorites)) {
            await User.updateOne({ _id: userId }, { $set: { favorites: [] } });
            user = await User.findById(userId).select('favorites');
        }

        const isCurrentlyFavorited = (user.favorites || []).some(
            (favId) => favId && favId.toString() === recipe._id.toString()
        );

        let updateOperation;
        let action;
        if (isCurrentlyFavorited) {
            updateOperation = { $pull: { favorites: recipe._id } };
            action = 'removed';
        } else {
            updateOperation = { $addToSet: {favorites: recipe._id } };
            action = 'added';
        }

        await User.findByIdAndUpdate(userId, updateOperation);

        const updatedUser = await User.findById(userId).populate('favorites');

        res.status(200).json({
            message: `Recipe successfully ${action}.`,
            isFavorited: action === 'added',
            favorites: updatedUser.favorites,
        });
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ message: 'Server error while toggling favorite.', error: error.message });
    }
};

module.exports = {
    getUserProfile,
    getUserTimers,
    setUserTimers,
    toggleFavorite,
};