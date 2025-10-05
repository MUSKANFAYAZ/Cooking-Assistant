// frontend/src/context/FavoritesContext.jsx (Updated to use only recipeId)

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getProfile, apiToggleFavorite } from '../services/apiService'; 

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    // Store populated Recipe docs from backend (with _id, externalId, name, image, etc.)
    const [favorites, setFavorites] = useState([]); 
    const { currentUser } = useAuth();
    
    // --- Initial Fetch ---
    useEffect(() => {
        if (!currentUser) {
            setFavorites([]);
            return;
        }
        
        const fetchFavorites = async () => {
            try {
                const profile = await getProfile(); 
                setFavorites(profile.favorites || []); 
            } catch (err) {
                console.error('Failed to fetch favorites', err);
            }
        };
        fetchFavorites();
    }, [currentUser]);
    
    // --- Toggle logic using externalId and upsert payload ---
    const toggleFavorite = async (recipe) => {
        if (!recipe || !currentUser) return;

        const externalId = recipe.id || recipe.externalId; // MealDB id or stored externalId
        if (!externalId) return;

        // Minimal payload for upsert on backend
        const payload = {
            name: recipe.name || recipe.strMeal,
            image: recipe.image || recipe.strMealThumb,
            cuisine: recipe.cuisine || recipe.strArea,
            category: recipe.category || recipe.strCategory,
        };

        try {
            const result = await apiToggleFavorite(externalId, payload);
            setFavorites(result.favorites || []);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };
    
    // --- Helper Function ---
    const isFavorited = (externalId) => {
        if (!externalId) return false;
        return favorites.some(recipe => recipe.externalId === externalId);
    };

    // --- Context Value ---
    return (
        <FavoritesContext.Provider 
            value={{ 
                favorites, 
                isFavorited, 
                toggleFavorite,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};