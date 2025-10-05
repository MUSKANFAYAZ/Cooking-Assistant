import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FavoritesProvider } from './context/FavoritesContext';
import MainMenuPage from './pages/MainMenuPage/MainMenuPage';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Favorites from './pages/Favourites/Favourites';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/SignUp/SignupPage';
import TimersPage from './pages/TimersPage/TimersPage';
import RecipeDetailPage from './pages/RecipeDetail/RecipeDetail';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    // NOTE: BrowserRouter is typically outside the App component, but kept here for context
    // You likely have <Router> wrapping this entire App component in main.jsx
    <AuthProvider>
      <FavoritesProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/signup" element={<SignupPage />} />
          <Route path="/main-menu" element={<MainMenuPage />} />
          
          {/* FIX: Change path parameter from :id to :slug to match the URL in RecipeCard */}
          <Route path="/recipe/:id/:slug" element={<RecipeDetailPage />} /> 

          <Route 
            path="/favorites" 
            element={<ProtectedRoute><Favorites /></ProtectedRoute>} 
          />
          <Route 
            path="/timers" 
            element={<ProtectedRoute><TimersPage /></ProtectedRoute>} 
          />

        </Routes>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;