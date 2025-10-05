import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { fetchRecipeById } from '../../services/apiService';
import { useSpeechAssistant } from '../../hooks/useSpeechAssistant';
import { useFavorites } from '../../context/FavoritesContext'; 
import { FaMicrophone, FaRegHeart, FaHeart } from 'react-icons/fa'; 
import './RecipeDetail.css';

const RecipeDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // FIX 1: Get the ID and slug directly from the URL params.
    // Assuming your router path is now "/recipe/:mealDbId/:slug" (as recommended).
    // If your router path is "/recipe/:id/:slug", you need to alias the first param.
    const { id: mealDbIdFromParams, slug } = useParams(); 
    
    // --- State and Context ---
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { isFavorited, addFavorite, removeFavorite } = useFavorites();
    
    // FIX 2: Prioritize the persistent ID from the URL parameters.
    // The mealDbIdFromState is ignored as it breaks on refresh.
    const mealDbId = mealDbIdFromParams; 

    // Check favorite status for the current recipe using the persistent ID
    const isCurrentRecipeFavorited = mealDbId ? isFavorited(mealDbId) : false;

    // --- Voice Assistant Logic (Omitted for brevity, assumed correct) ---
    const [currentStep, setCurrentStep] = useState(-1);
    const { transcript, speak, pause, resume, stop, resetTranscript, ...assistant } = useSpeechAssistant();

    const recipeSteps = useMemo(() => {
        if (!recipe || !recipe.strInstructions) return [];
        return recipe.strInstructions.split('. ').filter(s => s.trim().length > 0);
    }, [recipe]);

    // Command processing logic (Correct as is)
    useEffect(() => { /* ... */ }, [transcript, recipeSteps, currentStep, pause, resume, stop, speak, resetTranscript]);

    // Logic to automatically speak the next step (Correct as is)
    useEffect(() => { /* ... */ }, [currentStep, recipeSteps, speak]);

    const activateAssistant = () => {
        assistant.startListening();
        speak({ text: "Hello... Happy cooking! Say 'start' to begin." });
    };

    // --- Data Fetching Logic (FIXED to use URL parameter) ---
    useEffect(() => {
        if (!mealDbId) {
            // This error now only occurs if the URL itself is malformed.
            setError('Recipe ID is missing from the URL. Please verify the link or navigate from the home page.');
            setLoading(false);
            return;
        }

        const getRecipeDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch using the persistent ID from the URL parameter
                const recipeData = await fetchRecipeById(mealDbId);
                
                if (recipeData) {
                    setRecipe(recipeData);
                } else {
                    setError('Recipe details could not be found.');
                }
            } catch (err) {
                setError('Failed to fetch recipe details from external API.');
            } finally {
                setLoading(false);
            }
        };

        getRecipeDetails();
    }, [mealDbId]); // Dependency is now the persistent URL parameter

    // --- Favorites Toggle Handler (Correct as is) ---
    const handleFavoriteToggle = () => {
        if (!mealDbId) return; 

        if (isCurrentRecipeFavorited) {
            removeFavorite(mealDbId);
        } else {
            addFavorite(mealDbId); 
        }
    };

    // Helper function to parse ingredients (Correct as is)
    const getIngredients = (recipeData) => {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipeData[`strIngredient${i}`];
            const measure = recipeData[`strMeasure${i}`];
            if (ingredient && ingredient.trim() !== '') {
                ingredients.push(`${measure} ${ingredient}`);
            }
        }
        return ingredients;
    };

    if (loading) return <div className="loading-indicator">Loading recipe...</div>;
    if (error) return <div className="error-indicator">{error}</div>;
    if (!recipe) return <p className="no-results-message">Recipe not found.</p>;

    // --- Full JSX to Render the Page ---
    return (
        <div className="recipe-detail-page">
            <div className="title-and-favorites">
                <h1 className="recipe-title">{recipe.strMeal}</h1>
                <button className="favorite-button-large" onClick={handleFavoriteToggle}>
                    {isCurrentRecipeFavorited 
                        ? <FaHeart className="favorite-icon favorited" size={30} /> 
                        : <FaRegHeart className="favorite-icon" size={30} />
                    }
                </button>
            </div>
            
            <div className="recipe-meta">
                <span><strong>Category:</strong> {recipe.strCategory}</span>
                <span><strong>Cuisine:</strong> {recipe.strArea}</span>
            </div>
            <div className="recipe-layout">
                <img src={recipe.strMealThumb} alt={recipe.strMeal} className="recipe-image" referrerPolicy="no-referrer" />
                <div className="recipe-ingredients">
                    <h2>Ingredients</h2>
                    <ul>
                        {getIngredients(recipe).map((ing, index) => (
                            <li key={index}>{ing}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="recipe-instructions">
                <h2>
                    Instructions
                    {assistant.hasSpeechSupport && (
                        <button className={`mic-button ${assistant.isListening ? 'listening' : ''}`} onClick={activateAssistant} title="Activate Voice Assistant">
                            <FaMicrophone />
                        </button>
                    )}
                    {assistant.isListening && (
                        <span className="voice-command-hint">
                            Say: "start", "pause", "continue", "repeat", or "stop"
                        </span>
                    )}
                </h2>
                <ol>
                    {recipeSteps.map((step, index) => (
                        <li key={index} className={index === currentStep ? 'current-step' : ''}>
                            {step}.
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
};

export default RecipeDetailPage;