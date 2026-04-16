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

  if (loading) {
    return (
      <div className="gm-home" style={{ background: "var(--gm-bg)", display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'white' }}>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="gm-home" style={{ background: "var(--gm-bg)" }}>
      <div className="gm-hero">
        <div className="gm-hero-bg" />
        <div className="gm-hero-fade-top" />
        <div className="gm-hero-fade-bottom" />
        <div className="gm-hero-inner">
          <Link to="/categorias" className="gm-pill-btn" style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
            <FaArrowLeft /> <span>Volver a Categorías</span>
          </Link>
          <h1 className="gm-hero-title">{nombreCategoria}</h1>
          <p className="gm-hero-sub">
            {descripcionCategoria || "Explora nuestra colección exclusiva con los mejores diseños."}
          </p>
        </div>
      </div>

      <div className="gm-container">
        {productos.length > 0 ? (
          <div className="gm-products-grid" style={{ marginTop: '0' }}>
            {productos.map((product) => (
              <div key={product.id} className="gm-slot" style={{ minWidth: 'auto', padding: '0' }}>
                <ProductCard 
                  product={product} 
                  onOpenModal={handleOpenModal}
                  getRatingFromProduct={getRatingFromProduct}
                  safeImg={safeImg}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 20px', color: '#9CA3AF' }}>
            <p>No se encontraron productos en esta categoría.</p>
          </div>
        )}
      </div>

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

      <SuccessToast show={showSuccessToast} />
      
    </div>
  );
};

export default CategoriaDetalle;
