import React from 'react';
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
    handleQuantityInput
  } = useOfertas();


  return (
    <div className="page-container">
      
      <OfertasHero />

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
