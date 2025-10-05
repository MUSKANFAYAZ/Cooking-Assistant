import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {

 const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  });

    const login = (userData) => {
    // Save user data (including token) to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    // Update the state
    setCurrentUser(userData);
  };

   const logout = () => {
    // Remove user from localStorage
    localStorage.removeItem('user');
    // Update the state
    setCurrentUser(null);
  };

  
  const value = {
    currentUser,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};