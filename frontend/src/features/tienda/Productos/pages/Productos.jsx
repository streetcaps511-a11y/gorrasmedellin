import React from 'react';
import ProductosHero from '../components/ProductosHero';
import ProductosGrid from '../components/ProductosGrid';
import ProductModal from '../components/ProductModal';
import { useProductos } from '../hooks/useProductos';
import '../styles/Productos.css';

const Productos = () => {
  const {
    loading,
    initialProducts,
    productsByCategory,
    carouselIndices,
    handleCarouselScroll,
    filteredProducts,
    searchTerm,
    setGlobalSearch,
    selectedProduct,
    openModal,
    closeModal,
    selectedSize,
    handleSizeSelect,
    quantity,
    incrementQuantity,
    decrementQuantity,
    handleModalAddToCart,
    handleQuantityInput, // 🔥 NUEVO
    showSizeError,
    normalizeSizes,
    safeImg,
    getRatingFromProduct,
    BULK_MIN_QTY
  } = useProductos();


  return (
    <div className="gm-productos-page">
      <ProductosHero />
      
      <ProductosGrid 
        filteredProducts={filteredProducts}
        searchTerm={searchTerm}
        setGlobalSearch={setGlobalSearch}
        initialProducts={initialProducts}
        openModal={openModal}
        safeImg={safeImg}
        getRatingFromProduct={getRatingFromProduct}
      />

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          closeModal={closeModal}
          selectedSize={selectedSize}
          handleSizeSelect={handleSizeSelect}
          quantity={quantity}
          incrementQuantity={incrementQuantity}
          decrementQuantity={decrementQuantity}
          handleQuantityInput={handleQuantityInput} // 🔥 NUEVO
          handleModalAddToCart={handleModalAddToCart}
          showSizeError={showSizeError}
          normalizeSizes={normalizeSizes}
          safeImg={safeImg}
          BULK_MIN_QTY={BULK_MIN_QTY}
        />
      )}

    </div>
  );
};

export default Productos;
