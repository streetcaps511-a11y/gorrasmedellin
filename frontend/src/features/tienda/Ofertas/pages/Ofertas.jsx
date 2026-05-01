/* === PÁGINA PRINCIPAL === 
   Este componente es la interfaz visual principal de la ruta. 
   Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */

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
        

        <div className="gm-products-page-layout" style={{ marginTop: '30px' }}>
          
          {/* SIDEBAR DE FILTROS */}
          

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


