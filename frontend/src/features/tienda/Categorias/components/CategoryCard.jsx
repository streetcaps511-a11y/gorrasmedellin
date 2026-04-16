import '../styles/CategoryCard.css';
import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category, imgUrl, defaultImg }) => {
  const isCamiseta = category.Nombre?.toLowerCase() === "camisetas";
  
  return (
    <Link
      to={`/categorias/${encodeURIComponent(category.Nombre)}`}
      className={`categoria-card ${isCamiseta ? "camisetas-card" : ""}`}
    >
      <img
        src={imgUrl}
        alt={category.Nombre}
        className="categoria-img"
        onError={(e) => {
          e.target.src = defaultImg;
        }}
      />
      <div className="categoria-name-container">
        <div className="categoria-name-content">
          <h3 className="categoria-name">{category.Nombre}</h3>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
