import axios from 'axios';

// 1. An instance for your own backend API
export const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:3000/api', 
});

// 2. A separate instance for TheMealDB API
const mealDbClient = axios.create({
  baseURL: 'https://www.themealdb.com/api/json/v1/1/',
});


// --- AUTHENTICATION HELPERS ---
const getToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    // Ensure the user object and token exist
    return user && user.token ? user.token : null; 
  } catch (error) {
    console.error("Error retrieving token from localStorage:", error);
    return null;
  }
};


// --- YOUR BACKEND API FUNCTIONS ---

// Function to fetch the user profile, which now includes populated favorites
// frontend/src/services/apiService.js (Updated getProfile)

export const getProfile = async () => {
    const token = getToken();
    
    if (!token) {
        throw new Error("Authentication token not found.");
    }

    const config = { 
        headers: { 
            // Ensures the JWT is correctly added
            Authorization: `Bearer ${token}` 
        }
    };

    try {
        // FIX: Ensure the path starts with the correct router prefix. 
        // We explicitly use the plural 'users' here.
        const response = await apiClient.get('/users/profile', config); 
        
        return response.data;
    } catch (error) {
        // Re-throw to be caught by the context, preserving the error information
        console.error("Error fetching user profile:", error.message);
        throw error; 
    }
};

// Consolidated function to toggle favorite status
export const apiToggleFavorite = async (recipeId, payload = {}) => {
    // Now strictly accepts and uses only the recipeId
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");

    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // POST to the URL with the recipeId parameter
    const response = await apiClient.post(`/users/favorites/toggle/${recipeId}`, payload, config);
    // Returns: { message, isFavorited, favorites: [...] }
    return response.data; 
};


const normalizeMealDbRecipe = (meal) => ({
  id: meal.idMeal,
  name: meal.strMeal,
  image: meal.strMealThumb,
});

export const searchRecipesByName = async (query) => {
  const response = await mealDbClient.get(`search.php?s=${query}`);
  const meals = response.data.meals;
  return meals ? meals.map(normalizeMealDbRecipe) : [];
};

export const fetchCategories = async () => {
  const response = await mealDbClient.get('categories.php');
  return response.data.categories || [];
};

export const fetchRecipesByCategory = async (categoryName) => {
  const response = await mealDbClient.get(`filter.php?c=${categoryName}`);
  const meals = response.data.meals;
  return meals ? meals.map(normalizeMealDbRecipe) : [];
};

export const fetchRecipeById = async (recipeId) => {
  if (!recipeId) {
    console.error('fetchRecipeById called with null/undefined ID.');
    return null;
  }
  const response = await mealDbClient.get(`lookup.php?i=${recipeId}`);
  return response.data.meals ? response.data.meals[0] : null;
};

export const fetchRecipesByFirstLetter = async (letter) => {
  const response = await mealDbClient.get(`search.php?f=${letter}`);
  const meals = response.data.meals;
  return meals ? meals.map(normalizeMealDbRecipe) : [];
};

// --- TIMERS (Per-user persistence) ---
export const getUserTimers = async () => {
  const token = getToken();
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const res = await apiClient.get('/users/timers', config);
  return res.data?.timers || [];
};

export const setUserTimers = async (timers) => {
  const token = getToken();
  if (!token) throw new Error('Authentication token not found.');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const res = await apiClient.put('/users/timers', { timers }, config);
  return res.data?.timers || [];
};