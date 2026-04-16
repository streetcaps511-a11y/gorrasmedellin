import React, { useState, useRef } from 'react';
import { FaShoppingCart, FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const RatingStars = ({ value }) => {
  if (value == null) return null;
  const full = Math.floor(value);
  const half = value - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span className="gm-rating" title={`Calificación: ${value}/5`}>
      {Array.from({ length: full }).map((_, i) => (
        <FaStar key={`f-${i}`} />
      ))}
      {half === 1 && <FaStarHalfAlt key="half" />}
      {Array.from({ length: empty }).map((_, i) => (
        <FaRegStar key={`e-${i}`} />
      ))}
    </span>
  );
};

const ProductCard = ({ product, badge, badgeType, openModal }) => {
  if (!product) return null;

  const images = Array.isArray(product.imagenes) && product.imagenes.filter(Boolean).length
      ? product.imagenes.filter(Boolean).map((x) => String(x).trim()).filter(Boolean).slice(0, 4)
      : [product.safeImg || product.imagen || "https://via.placeholder.com/800x800?text=Sin+Imagen"];

  const [imgIndex, setImgIndex] = useState(0);
  const currentImage = images[imgIndex] || images[0];

  const setIndex = (i) => {
    setImgIndex(i);
  };

  const rating = product.rating || product.calificacion || null;

  const handleOpenDetail = () => {
    if (openModal) openModal(product);
  };

    const isAgotado = Number(product.stock) === 0;

  return (
    <div className="gm-card">
      <div className="gm-img-wrapper">
        <div className="gm-img-scroller">
          <img
            src={currentImage}
            alt={`${product.nombre} - ${imgIndex + 1}`}
            onClick={handleOpenDetail}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/800x800?text=Sin+Imagen";
            }}
          />
        </div>
        {images.length > 1 && (
          <div className="gm-img-dots">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`gm-dot ${i === imgIndex ? "active" : ""}`} 
                onMouseEnter={() => setIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="gm-info">
        <h3 className="gm-product-name" onClick={handleOpenDetail}>
          {product.nombre}
        </h3>
        <div className="gm-stars-row">
          <RatingStars value={rating} />
        </div>
        <div className="gm-badge-container">
          {isAgotado && (
            <span className="gm-badge-inline gm-badge--agotado">
              Agotado
            </span>
          )}
          {badge && (
            <span className={`gm-badge-inline gm-badge--${badgeType || "default"}`}>
              {badge}
            </span>
          )}
        </div>
        <div className="gm-actions-row">
          <div className="gm-price-actions">
            {(product.hasDiscount || product.has_discount || product.oferta) && product.precioOferta ? (
              <>
                <div className="gm-price-main-row">
                  <span className="gm-current-price">
                    ${Math.round(product.precioOferta).toLocaleString()}
                  </span>
                  <span className="gm-discount-tag">
                    -{Math.round(((product.precio - product.precioOferta) / product.precio) * 100)}%
                  </span>
                </div>
                <span className="gm-old-price">
                  ${Math.round(product.precio).toLocaleString()}
                </span>
              </>
            ) : (
              <span className="gm-current-price">
                ${Math.round(product.precio || 0).toLocaleString()}
              </span>
            )}
          </div>
          <button
            className="gm-btn-cart"
            onClick={(e) => { e.stopPropagation(); handleOpenDetail(); }}
            type="button"
          >
            <FaShoppingCart size={15} color="#000" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
