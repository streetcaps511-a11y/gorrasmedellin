import '../styles/ProductCard.css';
import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import RatingStars from '../../../shared/components/tienda/RatingStars';

const ProductCard = ({ product, onOpenModal, safeImg }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const scrollerRef = React.useRef(null);
  
  // Placeholder local (sin llamada de red que puede fallar y demorar)
  const PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%231a1a2e'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='14' font-family='sans-serif'%3ESin imagen%3C/text%3E%3C/svg%3E`;

  // Optimizar URLs de imagen: reducir tamaño para carga rápida
  const optimizeImageUrl = (url) => {
    if (!url || typeof url !== 'string') return PLACEHOLDER;
    // Pinterest: cambiar 1200x por 474x (tamaño thumbnail)
    if (url.includes('pinimg.com')) {
      return url.replace('/1200x/', '/474x/').replace('/736x/', '/474x/');
    }
    // Cloudinary: añadir transformación de resize y compresión
    if (url.includes('cloudinary.com') && !url.includes('/w_')) {
      return url.replace('/upload/', '/upload/w_400,q_70,f_auto/');
    }
    return url;
  };

  const images = (() => {
    if (!Array.isArray(product.imagenes)) return [safeImg ? safeImg(product) : PLACEHOLDER];
    const validImgs = product.imagenes
      .map(x => (typeof x === 'string' ? x.trim() : ''))
      .filter(x => x.length > 5 && !x.endsWith('/') && !x.endsWith('null'))
      .map(optimizeImageUrl);
    return validImgs.length > 0 ? validImgs.slice(0, 4) : [safeImg ? safeImg(product) : PLACEHOLDER];
  })();
  
  const isAgotado = Number(product.stock) === 0;
  const isOffer = (product.hasDiscount || product.has_discount || product.oferta) && product.precioOferta;

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
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER;
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
            {(product.hasDiscount || product.has_discount || product.oferta) && product.precioOferta && product.precio > 0 && (
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
