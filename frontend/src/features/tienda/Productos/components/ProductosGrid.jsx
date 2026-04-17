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
  getRatingFromProduct,
  // Props de Filtros
  selectedColors = [],
  selectedSizes = [],
  selectedCategories = [],
  allAvailableFilters = { categories: [], colors: [], sizes: [] },
  toggleFilter,
  clearFilters
}) => {
  return (
    <div className="gm-container">
      <div className="gm-products-page-layout">
        
        {/* SIDEBAR DE FILTROS (Columna Izquierda) */}
        <aside className="gm-filters-sidebar">
          <div className="gm-filters-content">
            <div className="gm-filters-header-row">
              <h3>Filtros</h3>
              {(selectedColors.length > 0 || selectedSizes.length > 0 || selectedCategories.length > 0 || searchTerm) && (
                <button onClick={clearFilters} className="gm-clear-all-btn">Limpiar</button>
              )}
            </div>

            {/* CATEGORÍAS */}
            <div className="gm-filter-group">
              <h4>Categorías</h4>
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
            </div>

            {/* COLORES */}
            <div className="gm-filter-group">
              <h4>Colores</h4>
              <div className="gm-filter-options">
                {allAvailableFilters.colors.map(color => (
                  <label key={color} className="gm-filter-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedColors.includes(color)}
                      onChange={() => toggleFilter('color', color)}
                    />
                    <span>{color}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* TALLAS */}
            <div className="gm-filter-group">
              <h4>Tallas</h4>
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
        </main>
      </div>
    </div>
  );
};

export default ProductosGrid;
