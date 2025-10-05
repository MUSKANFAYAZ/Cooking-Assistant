import React from 'react';
import { useFavorites } from '../../context/FavoritesContext';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import './Favourites.css';

const Favorites = () => {
  const { favorites } = useFavorites();

  return (
    <div className="favorites-page">
      <h1 className="favorites-title">Your Favorite Recipes</h1>
      <div className="recipe-list-section">
        {favorites.length > 0 ? (
          <div className="recipe-grid">
            {favorites.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <p className="no-favorites-message">
            You haven't added any favorites yet. Click the heart on any recipe to save it here!
          </p>
        )}
      </div>
    </div>
  );
};

export default Favorites;