import React, { useState, useEffect } from 'react';
import { fetchRecipesByFirstLetter } from '../../services/apiService';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import './MainMenuPage.css'; 


const MainMenuPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const recipeData = await fetchRecipesByFirstLetter(selectedLetter);
        setRecipes(recipeData);
      } catch (err) {
        setError('Failed to load recipes. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadRecipes();
  }, [selectedLetter]);

  return (
    <div className="main-menu-page">
      {/* Title updated */}
      <h1 className="main-menu-title">Main Menu</h1>
      {/* Instruction text added */}
      <p className="menu-instruction">Select a letter to browse recipes alphabetically.</p>
      
      <div className="alphabet-nav">
        {alphabet.map(letter => (
          <button
            key={letter}
            className={`alpha-button ${selectedLetter === letter ? 'active' : ''}`}
            onClick={() => setSelectedLetter(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="recipe-list-section">
        {loading && <div className="loading-indicator">Loading recipes for '{selectedLetter}'...</div>}
        {error && <div className="error-indicator">{error}</div>}
        
        {!loading && !error && (
          recipes.length > 0 ? (
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={{ ...recipe, cuisine: selectedLetter }}
                />
              ))}
            </div>
          ) : (
            <p className="no-results-message">
              No recipes found starting with the letter '{selectedLetter}'.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default MainMenuPage; 