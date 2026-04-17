import React, { useState } from 'react';
import { FaShoppingCart, FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import '../styles/ProductCard.css';

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

const ProductCard = ({ product, openModal, safeImg }) => {
  if (!product) return null;

  const images = Array.isArray(product.imagenes) && product.imagenes.filter(Boolean).length
      ? product.imagenes.filter(Boolean).map((x) => String(x).trim()).filter(Boolean).slice(0, 4)
      : [safeImg ? safeImg(product) : (product.safeImg || "https://via.placeholder.com/800x800?text=Sin+Imagen")];
      
  const [imgIndex, setImgIndex] = useState(0);
  const scrollerRef = React.useRef(null);
  
  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== imgIndex) setImgIndex(newIndex);
    }
  };

  const setIndex = (i) => {
    setImgIndex(i);
    if (scrollerRef.current) {
      const width = scrollerRef.current.offsetWidth;
      scrollerRef.current.scrollTo({ left: i * width, behavior: 'smooth' });
    }
  };

  const handleOpenDetail = () => {
    if (openModal) openModal(product);
  };

  const isAgotado = Number(product.stock) === 0;
  const isOffer = (product.hasDiscount || product.has_discount || product.oferta) && product.precioOferta;

  return (
    <div className="gm-card">
      <div className="gm-img-wrapper">
        {/* BADGES EN LAS ESQUINAS */}
        {isAgotado && (
          <div className="gm-img-badge-corner agotado">
            AGOTADO
          </div>
        )}
        
        {isOffer && (
          <div className="gm-img-badge-corner oferta">
            OFERTA
          </div>
        )}

        <div className="gm-img-scroller" onScroll={handleScroll} ref={scrollerRef}>
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${product.nombre} - ${idx + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                if (images.length > 1) {
                  setIndex((idx + 1) % images.length);
                }
              }}
              loading="eager"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/800x800?text=Sin+Imagen";
              }}
            />
          ))}
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

      <div className="gm-info" onClick={handleOpenDetail} style={{ cursor: 'pointer' }}>
        <h3 className="gm-product-name">
          {product.nombre}
        </h3>
        
        <div className="gm-actions-row">
          <div className="gm-price-actions">
            {(product.hasDiscount || product.has_discount || product.oferta) && product.precioOferta ? (
              <div className="gm-price-main-row">
                <span className="gm-current-price">
                  ${Math.round(product.precioOferta).toLocaleString()}
                </span>
                <span className="gm-old-price-simple">
                  ${Math.round(product.precio).toLocaleString()}
                </span>
              </div>
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
            {(product.hasDiscount || product.has_discount || product.oferta) && product.precioOferta && (
              <span className="gm-discount-tag-simple">
                -{Math.round(((product.precio - product.precioOferta) / product.precio) * 100)}%
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
