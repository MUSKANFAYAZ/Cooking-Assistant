// frontend/src/context/FavoritesContext.jsx (Updated to use only recipeId)

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getProfile, apiToggleFavorite } from '../services/apiService'; 

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    // Store the full populated recipe objects (for FavoritesPage rendering)
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
                // Set the state with the full array of recipe objects
                setFavorites(profile.favorites || []); 
            } catch (err) {
                console.error('Failed to fetch favorites', err);
            }
        };
        fetchFavorites();
    }, [currentUser]);
    
    // --- Consolidated Toggle Logic ---
    const handleToggleFavorite = async (recipeId) => {
        // Now strictly accepts and uses the recipeId
        if (!recipeId || !currentUser) return;
        
        try {
            const result = await apiToggleFavorite(recipeId);
            
            // Update local state with the new list returned from the backend
            setFavorites(result.favorites); 
            
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };
    
    // --- Helper Function ---
    const isFavorited = (recipeId) => {
        // Accepts the recipeId (string) and checks against the objects' _id
        if (!recipeId) return false;
        return favorites.some(recipe => recipe._id === recipeId); 
    };

    // --- Context Value ---
    return (
        <FavoritesContext.Provider 
            value={{ 
                favorites, 
                isFavorited, 
                // CRUCIAL CHANGE: Expose handlers that only take the ID string
                // RecipeCard will need to be updated slightly to pass the ID directly.
                // We use the simpler version here for maximum compatibility:
                addFavorite: handleToggleFavorite, 
                removeFavorite: handleToggleFavorite, 
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};