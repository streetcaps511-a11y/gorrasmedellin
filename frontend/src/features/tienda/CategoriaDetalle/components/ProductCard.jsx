import '../styles/ProductCard.css';
import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import RatingStars from '../../../shared/components/tienda/RatingStars';

const ProductCard = ({ product, onOpenModal, getRatingFromProduct, safeImg }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const scrollerRef = React.useRef(null);
  
  const images = Array.isArray(product.imagenes) && product.imagenes.filter(Boolean).length
    ? product.imagenes.filter(Boolean).map((x) => String(x).trim()).filter(Boolean).slice(0, 4)
    : [safeImg(product)];
  
  const rating = getRatingFromProduct(product);

  const isAgotado = Number(product.stock) === 0;

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
    if (onOpenModal) onOpenModal(product);
  };

  return (
    <div className="gm-card">
      <div className="gm-img-wrapper">
        <div className="gm-img-scroller" onScroll={handleScroll} ref={scrollerRef}>
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${product.nombre} - ${idx + 1}`}
              onClick={handleOpenDetail}
              loading="lazy"
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
      <div className="gm-info">
        <h3 className="gm-product-name" onClick={handleOpenDetail}>
          {product.nombre}
        </h3>
        <div className="gm-stars-row">
          <RatingStars value={rating} />
        </div>
        <div className="gm-badge-container">
          {isAgotado && (
            <span className="gm-badge-inline gm-badge--agotado">AGOTADO</span>
          )}
          {(product.hasDiscount || product.oferta) && (
            <span className="gm-badge-inline gm-badge--oferta">OFERTA</span>
          )}
        </div>
        <div className="gm-actions-row">
          <div className="gm-price-actions">
            {(product.hasDiscount || product.oferta) && product.precioOferta ? (
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
                  ${Math.round(product.precio || 0).toLocaleString()}
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
