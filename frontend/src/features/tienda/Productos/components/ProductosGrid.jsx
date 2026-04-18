import React, { useState } from 'react';
import { FaTimes, FaFilter } from 'react-icons/fa';
import ProductCard from './ProductCard';
import '../styles/ProductosGrid.css';

// Mapeo de colores a HEX para las bolitas del filtro
const COLOR_MAP = {
  'negro': '#000000',
  'blanco': '#FFFFFF',
  'rojo': '#FF0000',
  'azul': '#0000FF',
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
      {/* Botón para móviles */}
      <button 
        className="gm-mobile-filter-toggle" 
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        style={{ display: 'none' }} /* El CSS se encarga de mostrarlo en móvil */
      >
        <FaFilter /> {isFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
      </button>

      <div className="gm-products-page-layout">
        
        {/* SIDEBAR DE FILTROS (Columna Izquierda) */}
        <aside className={`gm-filters-sidebar ${isFilterOpen ? 'mobile-open' : ''}`}>
          <div className="gm-filters-content">
            <div className="gm-filters-header-row">
              <h3>Filtros</h3>
              {(selectedColors.length > 0 || selectedSizes.length > 0 || selectedCategories.length > 0 || searchTerm) && (
                <button onClick={clearFilters} className="gm-clear-all-btn">Limpiar</button>
              )}
            </div>

            {/* CATEGORÍAS */}
            <div className={`gm-filter-group ${expandedFilters.categories ? 'is-expanded' : ''}`}>
              <div className="gm-filter-group-header" onClick={() => toggleFilterSection('categories')}>
                <h4>Categorías</h4>
                <span className="gm-chevron-icon">{expandedFilters.categories ? '−' : '+'}</span>
              </div>
              {expandedFilters.categories && (
                <div className="gm-filter-options">
                  {allAvailableFilters.categories.map(cat => (
                    <label key={cat} className="gm-filter-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleFilter('category', cat)}
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* COLORES (Círculos) */}
            <div className={`gm-filter-group ${expandedFilters.colors ? 'is-expanded' : ''}`}>
              <div className="gm-filter-group-header" onClick={() => toggleFilterSection('colors')}>
                <h4>Colores</h4>
                <span className="gm-chevron-icon">{expandedFilters.colors ? '−' : '+'}</span>
              </div>
              {expandedFilters.colors && (
                <div className="gm-color-options-row">
                  {allAvailableFilters.colors.map(color => {
                    const hex = COLOR_MAP[color.toLowerCase()] || '#555';
                    const isActive = selectedColors.includes(color);
                    return (
                      <button 
                        key={color}
                        className={`gm-color-circle-btn ${isActive ? 'active' : ''}`}
                        title={color}
                        onClick={() => toggleFilter('color', color)}
                        style={{ backgroundColor: hex }}
                      >
                        {isActive && <div className="gm-color-check" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TALLAS */}
            <div className={`gm-filter-group ${expandedFilters.sizes ? 'is-expanded' : ''}`}>
              <div className="gm-filter-group-header" onClick={() => toggleFilterSection('sizes')}>
                <h4>Tallas</h4>
                <span className="gm-chevron-icon">{expandedFilters.sizes ? '−' : '+'}</span>
              </div>
              {expandedFilters.sizes && (
                <div className="gm-filter-options gm-sizes-grid">
                  {allAvailableFilters.sizes.map(size => (
                    <button 
                      key={size} 
                      className={`gm-size-pill ${selectedSizes.includes(size) ? 'active' : ''}`}
                      onClick={() => toggleFilter('size', size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL (Columna Derecha) */}
        <main className="gm-products-main-content">
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
        </main>
      </div>
    </div>
  );
};

export default ProductosGrid;
