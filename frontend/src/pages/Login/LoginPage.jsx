import React, { useState } from 'react';
import { Link, useNavigate, useLocation  } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
  // State to hold the user's input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

   const from = location.state?.from?.pathname || "/";

  // Handler for form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); 
    try {
      const response = await axios.post('http://127.0.0.1:3000/api/auth/login', {
        email,
        password,
      });

      // After successful login, you'll likely save a token, but for now we just navigate
        login(response.data);
      // 4. Navigate to the 'from' path instead of a hardcoded one
      navigate(from, { replace: true });

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };


  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Welcome Back!</h1>
        <p className="login-subtitle">Sign in to continue</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              className="login-input"
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
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
           {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">Login</button>
        </form>
        <div className="login-links">
          <Link to="/login/forgot-password">Forgot Password?</Link>
          <span> | </span>
          <Link to="/login/signup">Don't have an account? Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;