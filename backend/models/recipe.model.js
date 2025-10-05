const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  ingredients: [String],
  steps: [String],
  image: String, // optional URL or base64
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
