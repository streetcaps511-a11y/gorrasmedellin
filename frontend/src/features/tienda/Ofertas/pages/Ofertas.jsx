import React, { useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import OfertasHero from '../components/OfertasHero';
import OfertasGrid from '../components/OfertasGrid';
import ProductModal from '../components/ProductModal';
import SuccessToast from '../components/SuccessToast';
import { useCart } from '../../../shared/contexts';
import { useOfertas } from '../hooks/useOfertas';
import '../styles/Ofertas.css';

const Ofertas = () => {
  const {
    loading,
    ofertas,
    searchFiltered,
    searchTerm,
    setGlobalSearch,
    selectedProduct,
    inventory,
    getAvailableFor,
    selectedSize,
    quantity,
    showSuccessToast,
    showSizeError,
    openModal,
    closeModal,
    handleSizeSelect,
    incrementQuantity,
    decrementQuantity,
    handleModalAddToCart,
    normalizeSizes,
    safeImg,
    getRatingFromProduct,
    BULK_MIN_QTY,
    handleQuantityInput,
    // Filtros
    selectedColors,
    selectedSizes,
    selectedCategories,
    allAvailableFilters,
    toggleFilter,
    clearFilters
  } = useOfertas();

  // Mapeo de colores 
  const COLOR_MAP = {
    'negro': '#000000', 'blanco': '#FFFFFF', 'rojo': '#FF0000', 'azul': '#2563eb',
    'verde': '#008000', 'amarillo': '#FFFF00', 'gris': '#808080', 'naranja': '#FFA500',
    'morado': '#800080', 'cafe': '#A52A2A', 'marrón': '#A52A2A', 'rosado': '#FFC0CB',
    'rosa': '#FFC0CB', 'beige': '#F5F5DC', 'crema': '#FFFDD0', 'dorado': '#FFD700',
    'plateado': '#C0C0C0', 'azul marino': '#000080', 'vinotinto': '#800000',
    'khaki': '#F0E68C', 'oliva': '#808000',
  };


  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({ colors: true, sizes: true });

  const toggleFilterSection = (section) => {
    setExpandedFilters(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="page-container">
      
      <OfertasHero />

      <div className="gm-container">
        {/* Botón para móviles */}
        <button 
          className="gm-mobile-filter-toggle" 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          style={{ display: 'none' }}
        >
          <FaFilter /> {isFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>

        <div className="gm-products-page-layout" style={{ marginTop: '30px' }}>
          
          {/* SIDEBAR DE FILTROS */}
          <aside className={`gm-filters-sidebar ${isFilterOpen ? 'mobile-open' : ''}`}>
            <div className="gm-filters-content">
              <div className="gm-filters-header-row">
                <h3>Filtros</h3>
                {(selectedColors.length > 0 || selectedSizes.length > 0 || selectedCategories.length > 0 || searchTerm) && (
                  <button onClick={clearFilters} className="gm-clear-all-btn">Limpiar</button>
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
                          style={{ color: hex }}
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

          <main className="gm-products-main-content">
            <OfertasGrid 
              ofertas={ofertas}
              searchFiltered={searchFiltered}
              searchTerm={searchTerm}
              setGlobalSearch={setGlobalSearch}
              openModal={openModal}
              safeImg={safeImg}
              getRatingFromProduct={getRatingFromProduct}
              loading={loading}
            />
          </main>
        </div>
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          closeModal={closeModal}
          inventory={inventory}
          getAvailableFor={getAvailableFor}
          selectedSize={selectedSize}
          handleSizeSelect={handleSizeSelect}
          quantity={quantity}
          incrementQuantity={incrementQuantity}
          decrementQuantity={decrementQuantity}
          handleModalAddToCart={handleModalAddToCart}
          showSizeError={showSizeError}
          normalizeSizes={normalizeSizes}
          safeImg={safeImg}
          BULK_MIN_QTY={BULK_MIN_QTY}
          handleQuantityInput={handleQuantityInput}
        />
      )}

      <SuccessToast show={showSuccessToast} />
      
    </div>
  );
};

export default Ofertas;
