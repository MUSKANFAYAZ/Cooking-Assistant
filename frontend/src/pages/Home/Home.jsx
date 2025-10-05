import React, { useState, useEffect, useRef} from 'react';
import './Home.css';
import { searchRecipesByName, fetchRecipesByCategory, fetchCategories } from '../../services/apiService.js';
import SearchBar from '../../components/SearchBar/SearchBar';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import RecipeCardSkeleton from '../../components/RecipeCard/RecipeCardSkeleton.jsx';

// --- VOICE SEARCH SETUP ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'en-US';
}

const extractKeyword = (transcript) => {
  const stopWords = [
    'find', 'me', 'a', 'an', 'the', 'recipe', 'recipes', 
    'show', 'some', 'dishes', 'dish', 'for', 'about'
  ];
    const words = transcript.toLowerCase().split(' ');
  const keywords = words.filter(word => !stopWords.includes(word));
  
  return keywords.join(' '); // Join remaining words back into a string
};


const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Beef'); // Reverted to 'activeFilter'
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(recognition);

  // Effect to fetch the list of categories for the filter buttons
  useEffect(() => {
    const getCategories = async () => {
      try {
        const categoryData = await fetchCategories();
        // Show the first 6 categories for a clean UI
        setCategories(categoryData.slice(0, 6)); 
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    getCategories();
  }, []);

  // Effect to fetch recipes based on the active category filter
  useEffect(() => {
    const loadRecipesByFilter = async () => {
      if (!activeFilter) return;
      setLoading(true);
      setError(null);
      try {
        const recipeData = await fetchRecipesByCategory(activeFilter);
        setRecipes(recipeData);
      } catch (err) {
        setError('Failed to load recipes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadRecipesByFilter();
  }, [activeFilter]);
  
   useEffect(() => {
    const rec = recognitionRef.current;
    if (!rec) return;

    rec.onresult = (event) => {
      const rawTranscript = event.results[0][0].transcript;
      console.log("Raw transcript:", rawTranscript);
      
      // Use our new function to get the keyword
      const keyword = extractKeyword(rawTranscript);
      console.log("Extracted keyword:", keyword);

      setSearchTerm(keyword); // Set the search box to the clean keyword
      handleSearchSubmit(keyword); // Immediately search for the keyword
      
      setIsListening(false);
      rec.stop();
    };

    rec.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

    const handleSearchSubmit = async (voiceQuery) => {
    const termToSearch = voiceQuery || searchTerm;
    if (!termToSearch.trim()) return;
    
    setLoading(true);
    setError(null);
    setActiveFilter(null);
    try {
      const recipeData = await searchRecipesByName(termToSearch);
      setRecipes(recipeData);
    } catch (err) {
      setError('Failed to find recipes. Please try another search.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (categoryName) => {
    setSearchTerm('');
    setActiveFilter(categoryName);
  };
  
   const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      console.log("Speech recognition not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  return (
    <div className="home-page">
      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        isListening={isListening}
        onVoiceSearch={handleVoiceSearch}
      />

      <div className="filter-section">
        {/* Render filter buttons from the fetched categories state */}
        {categories.map((cat) => (
          <button
            key={cat.idCategory}
            className={`filter-button ${activeFilter === cat.strCategory ? 'active' : ''}`}
            onClick={() => handleFilterChange(cat.strCategory)}
          >
            {cat.strCategory}
          </button>
        ))}
      </div>

      <div className="recipe-list-section">
        {error && <div className="error-indicator">{error}</div>}
        
        <div className="recipe-grid">
          {loading ? (
            // If loading, show a grid of 8 skeleton cards
            Array.from({ length: 8 }).map((_, index) => (
              <RecipeCardSkeleton key={index} />
            ))
          ) : (
            // If not loading, show the actual recipe cards or "no results" message
            recipes.length > 0 ? (
              recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={{
                    ...recipe,
                    cuisine: activeFilter || 'Search Result'
                  }}
                />
              ))
            ) : (
              <p className="no-results-message">
                No recipes found. Try a different search or category!
              </p>
            )
        )}
        </div>
      </div>
    </div>
  );
};

export default Home;