import '../styles/CategoriaDetalle.css';
import '../styles/CategoryHero.css';
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaFilter } from "react-icons/fa";
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import SuccessToast from '../components/SuccessToast';
import { useCategoriaDetalle } from '../hooks/useCategoriaDetalle';

const CategoriaDetalle = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({ colors: true, sizes: true });

  const toggleFilterSection = (section) => {
    setExpandedFilters(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const {
    nombreCategoria,
    descripcionCategoria,
    productos,
    selectedProduct,
    selectedSize,
    quantity,
    showSizeError,
    showSuccessToast,
    loading,
    sizesForModal,
    handleOpenModal,
    closeModal,
    handleSizeSelect,
    incrementQuantity,
    decrementQuantity,
    handleQuantityInput,
    handleAddToCart,
    getRatingFromProduct,
    safeImg,
    BULK_MIN_QTY,
    // Filtros
    selectedColors,
    selectedSizes,
    allAvailableFilters,
    toggleFilter,
    clearFilters
  } = useCategoriaDetalle();

  // Mapeo de colores (mismo que ProductosGrid)
  const COLOR_MAP = {
    'negro': '#000000', 'blanco': '#FFFFFF', 'rojo': '#FF0000', 'azul': '#2563eb',
    'verde': '#008000', 'amarillo': '#FFFF00', 'gris': '#808080', 'naranja': '#FFA500',
    'morado': '#800080', 'cafe': '#A52A2A', 'marrón': '#A52A2A', 'rosado': '#FFC0CB',
    'rosa': '#FFC0CB', 'beige': '#F5F5DC', 'crema': '#FFFDD0', 'dorado': '#FFD700',
    'plateado': '#C0C0C0', 'azul marino': '#000080', 'vinotinto': '#800000',
    'khaki': '#F0E68C', 'oliva': '#808000',
  };


  return (
    <div className="gm-home" style={{ background: "var(--gm-bg)" }}>
      <div className="gm-hero">
        <div className="gm-hero-bg" />
        <div className="gm-hero-fade-top" />
        <div className="gm-hero-fade-bottom" />
        <div className="gm-hero-inner">
          <Link to="/categorias" className="gm-pill-btn gm-back-btn">
            <FaArrowLeft /> <span>Volver a Categorías</span>
          </Link>
          <h1 className="gm-hero-title">{nombreCategoria}</h1>
          <p className="gm-hero-sub">
            {descripcionCategoria || "Explora nuestra colección exclusiva con los mejores diseños."}
          </p>
        </div>
      </div>
      
      <div className="gm-container">
        {/* Botón para móviles */}
        

        <div className="gm-products-page-layout" style={{ marginTop: '30px' }}>
          
          {/* SIDEBAR DE FILTROS */}
          

          {/* CONTENIDO PRINCIPAL */}
          <main className="gm-products-main-content">
            {/* Spinner discreto */}
            {loading && productos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9CA3AF' }}>
                <div className="gm-loader" style={{ 
                  width: '36px', height: '36px', 
                  border: '3px solid rgba(255,215,0,0.1)', 
                  borderTop: '3px solid #F5C81B', 
                  borderRadius: '50%',
                  animation: 'gm-spin 1s linear infinite',
                  margin: '0 auto 16px'
                }} />
                <p style={{ fontStyle: 'italic', opacity: 0.6 }}>Cargando productos...</p>
              </div>
            )}

            {/* Grid de productos */}
            {productos.length > 0 ? (
              <div className="gm-products-grid">
                {productos.map((product) => (
                  <ProductCard 
                    key={product.id}
                    product={product} 
                    onOpenModal={handleOpenModal}
                    getRatingFromProduct={getRatingFromProduct}
                    safeImg={safeImg}
                  />
                ))}
              </div>
            ) : (
              !loading && (
                <div style={{ textAlign: 'center', padding: '100px 20px', color: '#9CA3AF' }}>
                  <p>No se encontraron productos con estos filtros.</p>
                </div>
              )
            )}
          </main>
        </div>
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          closeModal={closeModal}
          safeImg={safeImg}
          BULK_MIN_QTY={BULK_MIN_QTY}
          sizesForModal={sizesForModal}
          selectedSize={selectedSize}
          handleSizeSelect={handleSizeSelect}
          showSizeError={showSizeError}
          quantity={quantity}
          decrementQuantity={decrementQuantity}
          incrementQuantity={incrementQuantity}
          handleQuantityInput={handleQuantityInput}
          handleAddToCart={handleAddToCart}
        />
      )}

      <SuccessToast show={showSuccessToast} />
      
    </div>
  );
};

export default CategoriaDetalle;

