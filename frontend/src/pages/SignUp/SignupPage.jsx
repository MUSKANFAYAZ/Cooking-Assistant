import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import './SignupPage.css';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate(); // Hook for navigation

  // 2. Make the handleSubmit function async
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      // 3. Send a POST request to your backend's registration endpoint
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        name,
        email,
        password,
      });

      // If successful, show an alert and redirect to the login page
      console.log('Registration successful:', response.data);
      alert('Registration successful! Please log in.');
      navigate('/login');

    } catch (err) {
      // 4. If the backend returns an error, display it
      // 'err.response.data.message' comes from the JSON response of your backend
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err.response?.data);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-title">Create an Account</h1>
        <p className="signup-subtitle">Get started with your culinary journey!</p>
        <form onSubmit={handleSubmit} className="signup-form">
          {/* ... your input fields for name, email, password, etc. remain the same ... */}
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              className="signup-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              className="signup-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="signup-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input 
              type="password" 
              id="confirm-password" 
              className="signup-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="signup-button">Sign Up</button>
        </form>
        <div className="signup-links">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;