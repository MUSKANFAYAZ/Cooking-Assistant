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
    const { id: externalIdFromParams, slug } = useParams(); 
    
    // --- State and Context ---
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { isFavorited, toggleFavorite } = useFavorites();
    
    // FIX 2: Prioritize the persistent ID from the URL parameters.
    // The mealDbIdFromState is ignored as it breaks on refresh.
    const mealDbId = externalIdFromParams; 
    // Check favorite status for the current recipe using the persistent ID
    const isCurrentRecipeFavorited = mealDbId ? isFavorited(mealDbId) : false;

    // --- Voice Assistant Logic (Omitted for brevity, assumed correct) ---
    const [currentStep, setCurrentStep] = useState(-1);
    const [autoMode, setAutoMode] = useState(false);
    const { transcript, speak, pause, resume, stop, resetTranscript, ...assistant } = useSpeechAssistant();
    
    // Build the instructions into an array of steps
    const recipeSteps = useMemo(() => {
        if (!recipe || !recipe.strInstructions) return [];
        // Split by newlines or sentence periods that are followed by a space and a capital letter
        const parts = recipe.strInstructions
          .split(/\r?\n+|\.\s+(?=[A-Z])/)
          .map(s => s.trim())
          // drop empty lines, lone numbers like "1." or "2", and single punctuation
          .filter(s => s && !/^\d+\.?$/.test(s) && !/^[\-•]$/.test(s));
        return parts;
    }, [recipe]);

    // Voice command processing: start, pause, continue, stop, next, previous, repeat
    useEffect(() => {
        if (!transcript) return;
        const t = transcript.toLowerCase();

        if (t.includes('start')) {
            if (recipeSteps.length > 0) {
                setAutoMode(true);
                setCurrentStep(0);
            }
            resetTranscript();
            return;
        }
        if (t.includes('read instructions') || t.includes('read recipe') || t.includes('read all')) {
            // Read out all recipe instructions
            const allInstructions = recipeSteps.join('. ');
            speak({
                text: `Here are all the instructions for ${recipe?.strMeal || 'this recipe'}. ${allInstructions}`,
                onEnd: () => {
                    // After reading all instructions, user can give further commands
                }
            });
            resetTranscript();
            return;
        }
        if (t.includes('pause')) {
            pause();
            resetTranscript();
            return;
        }
        if (t.includes('continue') || t.includes('resume')) {
            resume();
            resetTranscript();
            return;
        }
        if (t.includes('stop')) {
            stop();
            setAutoMode(false);
            setCurrentStep(-1);
            resetTranscript();
            return;
        }
        if (t.includes('next')) {
            if (currentStep + 1 < recipeSteps.length) setCurrentStep(currentStep + 1);
            resetTranscript();
            return;
        }
        if (t.includes('previous') || t.includes('back')) {
            if (currentStep > 0) setCurrentStep(currentStep - 1);
            resetTranscript();
            return;
        }
        if (t.includes('repeat')) {
            if (currentStep >= 0 && currentStep < recipeSteps.length) {
                speak({ text: `Repeating step ${currentStep + 1}. ${recipeSteps[currentStep]}` });
            }
            resetTranscript();
            return;
        }
    }, [transcript, recipeSteps, currentStep, pause, resume, stop, speak, resetTranscript, recipe]);

    // Logic to automatically speak the next step (auto-advance with no delay)
  useEffect(() => {
    if (currentStep < 0) return;
    if (!recipeSteps || currentStep >= recipeSteps.length) return;
    const stepText = recipeSteps[currentStep];

    speak({
      text: `Step ${currentStep + 1}. ${stepText}`,
      onEnd: () => {
        if (!autoMode) return;
        const next = currentStep + 1;
        if (next < recipeSteps.length) {
          setCurrentStep(next);
        } else {
          setAutoMode(false);
        }
      }
    });
  }, [currentStep, recipeSteps, speak, autoMode]);

  const activateAssistant = () => {
    // Start listening and provide clear voice instructions
    if (!assistant.isListening) {
      assistant.startListening();
      speak({
        text: `Voice assistant activated. You can say: start to begin cooking instructions, pause to pause, continue to resume, next for next step, previous for previous step, repeat to repeat current step, or stop to end. Say start to begin the recipe instructions.`,
        onEnd: () => {
          // Assistant is now ready for commands
        }
      });
    }
  };

  // On-screen voice control buttons
  const handleStartClick = () => {
    // Do NOT start listening here to avoid any system chirp; just greet then read all
    setAutoMode(false);
    setCurrentStep(-1);
    speak({
      text: `Hello! Welcome to your cooking assistant. I'll now read out the recipe instructions for ${recipe?.strMeal || 'this recipe'}.`,
      onEnd: () => {
        readAllInstructions();
      },
    });
  };
  const handlePauseClick = () => { pause(); };
  const handleResumeClick = () => { resume(); };
  const handleStopClick = () => {
    stop();
    setAutoMode(false);
    setCurrentStep(-1);
  };

  // Helper to read all instructions without turning on the mic (no chirp)
  const readAllInstructions = () => {
    const allInstructions = recipeSteps.join('. ');
    if (!allInstructions) {
      speak({ text: 'There are no instructions for this recipe.' });
      return;
    }
    speak({
      text: `Here are all the instructions for ${recipe?.strMeal || 'this recipe'}. ${allInstructions}`,
      onEnd: () => {
        // Instructions completed
      }
    });
  };

  const handleReadAllClick = () => {
    // Do not start listening; just read all to avoid any activation sounds
    readAllInstructions();
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
      }
    };

    getRecipeDetails();
  }, [mealDbId]); // Dependency is now the persistent URL parameter

  // --- Favorites Toggle Handler ---
  const handleFavoriteToggle = () => {
    if (!mealDbId) return;
    const payload = recipe ? {
      id: mealDbId,
      name: recipe.strMeal,
      image: recipe.strMealThumb,
      cuisine: recipe.strArea,
      category: recipe.strCategory,
    } : { id: mealDbId };

    toggleFavorite(payload);
  };

  // Helper: build ingredients list from MealDB fields
  const getIngredients = (recipeData) => {
    if (!recipeData) return [];
    const list = [];
    for (let i = 1; i <= 20; i++) {
      const ing = recipeData[`strIngredient${i}`];
      const measure = recipeData[`strMeasure${i}`];
      if (ing && ing.trim() !== '') {
        const line = `${measure ? measure : ''} ${ing}`.trim();
        list.push(line);
      }
    }
    return list;
  };

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
              : <FaRegHeart className="favorite-icon" size={30} />}
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
              <button
                className={`mic-button ${assistant.isListening ? 'listening' : ''}`}
                onClick={activateAssistant}
                title="Activate Voice Assistant"
              >
                <FaMicrophone />
              </button>
            )}
            {assistant.isListening && (
              <span className="voice-command-hint">
                Say: "start", "read instructions", "pause", "continue", "next", "previous", "repeat", or "stop"
              </span>
            )}
          </h2>

          <div className="voice-controls">
            <button className="voice-btn start" onClick={handleStartClick}>Start</button>
            <button className="voice-btn read-all" onClick={handleReadAllClick}>Read All</button>
            <button className="voice-btn pause" onClick={handlePauseClick}>Pause</button>
            <button className="voice-btn resume" onClick={handleResumeClick}>Resume</button>
            <button className="voice-btn stop" onClick={handleStopClick}>Stop</button>
          </div>

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