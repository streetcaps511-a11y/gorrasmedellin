import React from 'react';
import { FaTimes } from 'react-icons/fa';
import ProductCard from './ProductCard';
import '../styles/ProductosGrid.css';

const ProductosGrid = ({ 
  filteredProducts, 
  searchTerm, 
  setGlobalSearch, 
  initialProducts, 
  openModal, 
  safeImg, 
  getRatingFromProduct 
}) => {
  return (
    <div className="gm-container">
      {/* Resultados de búsqueda */}
      {filteredProducts !== null && (
        <>
          <div className="gm-search-results-header">
            <div className="gm-search-title-row">
              <h2 className="gm-search-title">
                Resultados para: <span className="gm-search-term">"{searchTerm}"</span>
              </h2>
              <button onClick={() => setGlobalSearch("")} className="gm-clean-btn">
                <FaTimes size={14} /> Limpiar búsqueda
              </button>
            </div>
            <p className="gm-search-count">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} encontrado{filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="gm-no-results">
              <p>No se encontraron productos</p>
              <button onClick={() => setGlobalSearch("")} className="gm-primary-btn">
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="gm-products-grid">
              {filteredProducts.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  openModal={openModal} 
                  safeImg={safeImg} 
                  getRatingFromProduct={getRatingFromProduct}
                  badge={p.hasDiscount || p.oferta ? "Oferta" : (p.destacado || p.isFeatured ? "Destacado" : null)}
                  badgeType={p.hasDiscount || p.oferta ? "oferta" : (p.destacado || p.isFeatured ? "destacado" : null)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Todos los productos (si no se está buscando) */}
      {filteredProducts === null && (
        <div className="gm-products-grid">
          {(initialProducts || [])
            .filter(p => (p.isActive !== false))
            .map((p) => (
            <ProductCard 
              key={p.id} 
              product={p} 
              openModal={openModal} 
              safeImg={safeImg} 
              getRatingFromProduct={getRatingFromProduct}
              badge={p.hasDiscount || p.oferta ? "Oferta" : (p.destacado || p.isFeatured ? "Destacado" : null)}
              badgeType={p.hasDiscount || p.oferta ? "oferta" : (p.destacado || p.isFeatured ? "destacado" : null)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductosGrid;
