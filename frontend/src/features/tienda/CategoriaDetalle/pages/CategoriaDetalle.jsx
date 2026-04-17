import '../styles/CategoriaDetalle.css';
import '../styles/CategoryHero.css';
import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import SuccessToast from '../components/SuccessToast';
import { useCategoriaDetalle } from '../hooks/useCategoriaDetalle';

const CategoriaDetalle = () => {
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
    BULK_MIN_QTY
  } = useCategoriaDetalle();


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
        {/* Spinner discreto solo si está cargando Y no hay productos aún */}
        {loading && productos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9CA3AF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="gm-loader" style={{ 
              width: '36px', height: '36px', 
              border: '3px solid rgba(255,215,0,0.1)', 
              borderTop: '3px solid #F5C81B', 
              borderRadius: '50%',
              animation: 'gm-spin 1s linear infinite'
            }} />
            <p style={{ fontStyle: 'italic', opacity: 0.6, margin: 0 }}>Cargando productos...</p>
            <style>{`@keyframes gm-spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
          </div>
        )}

        {/* Grid de productos */}
        {productos.length > 0 ? (
          <div className="gm-products-grid" style={{ marginTop: '0' }}>
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
              <p>No se encontraron productos en esta categoría.</p>
            </div>
          )
        )}
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
