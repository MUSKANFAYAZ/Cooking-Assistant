const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  // External API persistent identifier (e.g., MealDB id)
  externalId: { type: String, index: true, unique: true },

  name: { type: String, required: true },
  description: String,
  category: { type: String },
  cuisine: { type: String }, // a.k.a. area in MealDB
  ingredients: [String],
  steps: [String], // parsed instructions
  image: String, // optional URL or base64
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
