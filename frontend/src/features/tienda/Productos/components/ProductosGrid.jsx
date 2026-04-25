import React, { useState } from 'react';
import { FaTimes, FaFilter } from 'react-icons/fa';
import ProductCard from './ProductCard';
import '../styles/ProductosGrid.css';

// Mapeo de colores a HEX para las bolitas del filtro
const COLOR_MAP = {
  'negro': '#000000',
  'blanco': '#FFFFFF',
  'rojo': '#FF0000',
  'azul': '#2563eb',
  'verde': '#008000',
  'amarillo': '#FFFF00',
  'gris': '#808080',
  'naranja': '#FFA500',
  'morado': '#800080',
  'cafe': '#A52A2A',
  'marrón': '#A52A2A',
  'rosado': '#FFC0CB',
  'rosa': '#FFC0CB',
  'beige': '#F5F5DC',
  'crema': '#FFFDD0',
  'dorado': '#FFD700',
  'plateado': '#C0C0C0',
  'azul marino': '#000080',
  'vinotinto': '#800000',
  'khaki': '#F0E68C',
  'oliva': '#808000',
};

const ProductosGrid = ({ 
  filteredProducts, 
  searchTerm, 
  setGlobalSearch, 
  initialProducts, 
  openModal, 
  safeImg, 
  getRatingFromProduct,
  // Props de Filtros
  selectedColors = [],
  selectedSizes = [],
  selectedCategories = [],
  allAvailableFilters = { categories: [], colors: [], sizes: [] },
  toggleFilter,
  clearFilters
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({ categories: true, colors: true, sizes: true });

  const toggleFilterSection = (section) => {
    setExpandedFilters(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="gm-container">


      <div className="gm-products-page-layout">
        


        {/* CONTENIDO PRINCIPAL (Columna Derecha) */}
        <main className="gm-products-main-content">
          {/* ⚡ ESTADO DE CARGA INICIAL */}
          {(!initialProducts || initialProducts.length === 0) && (
            <div className="gm-loading-container">
              <div className="gm-loader"></div>
              <p>Cargando catálogo premium...</p>
            </div>
          )}

          {/* Resultados de búsqueda */}
          {filteredProducts !== null && (
            <>
              <div className="gm-search-results-header">
                <div className="gm-search-title-row">
                  <h2 className="gm-search-title">
                    Resultados para: <span className="gm-search-term">"{searchTerm}"</span>
                  </h2>
                  <button onClick={clearFilters} className="gm-clean-btn">
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
                  <button onClick={clearFilters} className="gm-primary-btn">
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
                .filter(p => (p.isActive !== false && (p.stock > 0)))
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
        </main>
      </div>
    </div>
  );
};

export default ProductosGrid;
