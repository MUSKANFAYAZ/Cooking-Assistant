import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // If the user is not logged in, redirect to the login page
    // We pass the current location in the state so we can redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is logged in, render the component they wanted to see
  return children;
};

export default ProtectedRoute;