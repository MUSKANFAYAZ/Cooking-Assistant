import React from 'react';
import './SearchBar.css'; 
import { CiSearch } from "react-icons/ci";
import { FaMicrophone } from "react-icons/fa";

// Receive the new props: isListening and onVoiceSearch
const SearchBar = ({ searchTerm, onSearchChange, onSearchSubmit, isListening, onVoiceSearch }) => {
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit();
  }

  return (
    <form className="search-container" onSubmit={handleSubmit}>
      <h2 className="search-title">Find Your Perfect Recipe</h2>
      <div className="search-input-wrapper">
        <CiSearch className="search-input-icon" />
        <input
          type="text"
          placeholder="Search for recipes..."
          className="search-input"
          value={searchTerm}
          onChange={onSearchChange}
        />
        <button type="submit" className="search-button">Search</button>
      </div>
      <div className="voice-search-wrapper">
        <span className="voice-search-text">or use voice search</span>
        {/* Add onClick handler and a dynamic class for visual feedback */}
        <button 
          type="button" 
          className={`voice-search-button ${isListening ? 'listening' : ''}`}
          onClick={onVoiceSearch}
        >
          <FaMicrophone />
        </button>
      </div>
      <p className="search-hint">
        Try saying: "find me a paneer recipe" or "show me chicken dishes"
      </p>
    </form>
  );
};

export default SearchBar;