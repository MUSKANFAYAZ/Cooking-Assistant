import React from 'react';
import './RecipeCardSkeleton.css';

const RecipeCardSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-text short"></div>
        <div className="skeleton-text long"></div>
        <div className="skeleton-text medium"></div>
      </div>
    </div>
  );
};

export default RecipeCardSkeleton;