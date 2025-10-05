import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import './RecipeCard.css';
import { FaRegHeart, FaHeart } from 'react-icons/fa';
import { useFavorites } from '../../context/FavoritesContext';

// Utility to create slug from recipe name
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/[^\w-]+/g, '')      // Remove non-word chars
    .replace(/--+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')           // Trim - from start
    .replace(/-+$/, '');          // Trim - from end
};

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorited } = useFavorites();
  
  // Destructure MongoDB _id instead of id
  const { _id, image, cuisine, name, stores } = recipe;
  const recipeId = _id || id;

  // Check if this recipe is favorited
  const favorited = isFavorited(recipeId);

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent navigating to recipe page
    if (favorited) {
      removeFavorite(recipeId); // Remove by ID
    } else {
      addFavorite(recipeId);  // Optional extra info
    }
  };

  const handleNavigate = () => {
    const slug = slugify(name);
    navigate(`/recipe/${recipeId}/${slug}`);
  };

  return (
    <div className="recipe-card" onClick={handleNavigate}>
      <div className="card-image-wrapper">
        <img src={image} alt={name} className="card-image" />
        <button className="favorite-button" onClick={handleFavoriteClick}>
          {favorited 
            ? <FaHeart className="favorite-icon favorited" /> 
            : <FaRegHeart className="favorite-icon" />
          }
        </button>
      </div>
      <div className="card-content">
        <p className="card-cuisine">{cuisine}</p>
        <h3 className="card-name">{name}</h3>
      </div>
    </div>
  );
};

export default RecipeCard;
