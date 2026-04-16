import React, { useState } from 'react';
import { FaTimes, FaMinus, FaPlus, FaShoppingCart, FaBan } from 'react-icons/fa';
import '../styles/ProductModal.css';

// Helper: determina si un color es "claro" para usar texto oscuro
const isLightColor = (colorName) => {
  const lightColors = ['white', 'blanco', 'yellow', 'amarillo', 'beige', 'crema', 'cream', 'ivory', 'marfil', 'oro', 'gold', 'dorado', 'lime', 'cyan', 'aqua', 'silver', 'plata', 'celeste', 'lila', 'hueso', 'rosa', 'pink'];
  return lightColors.includes(colorName.toLowerCase());
};

// Helper: mapea nombre de color a hex para background
const colorNameToHex = (name) => {
  const map = {
    'azul marino': '#000080',
    negro: '#000000', black: '#000000',
    blanco: '#ffffff', white: '#ffffff',
    rojo: '#ff0000', red: '#ff0000',
    azul: '#0000ff', blue: '#0000ff',
    verde: '#008000', green: '#008000',
    amarillo: '#ffff00', yellow: '#ffff00',
    morado: '#800080', purple: '#800080',
    gris: '#808080', gray: '#808080', grey: '#808080',
    naranja: '#ffa500', orange: '#ffa500',
    rosa: '#ffc0cb', pink: '#ffc0cb',
    cafe: '#6f4e37', café: '#6f4e37', brown: '#6f4e37', marrón: '#6f4e37',
    beige: '#f5f5dc',
    crema: '#fffdd0',
    celeste: '#87ceeb',
    lila: '#e6e6fa',
    hueso: '#f5f5dc',
    dorado: '#d4ac0d', gold: '#d4ac0d',
    plata: '#c0c0c0', silver: '#c0c0c0',
  };
  return map[name.toLowerCase()] || name.toLowerCase();
};

const ProductModal = ({
  product,
  closeModal,
  safeImg,
  BULK_MIN_QTY,
  sizesForModal,
  selectedSize,
  handleSizeSelect,
  showSizeError,
  quantity,
  decrementQuantity,
  incrementQuantity,
  handleQuantityInput,
  handleAddToCart
}) => {
  if (!product) return null;

  const [modalImgIndex, setModalImgIndex] = useState(0);
  const images = Array.isArray(product.imagenes) && product.imagenes.filter(Boolean).length
    ? product.imagenes.filter(Boolean).map(x => String(x).trim()).filter(Boolean)
    : [safeImg(product)];

  // Stock logic
  const getAvailableFor = (size) => {
    if (!product.tallasStock) return 0;
    try {
      const stockObj = typeof product.tallasStock === 'string'
        ? JSON.parse(product.tallasStock)
        : product.tallasStock;
      
      if (Array.isArray(stockObj)) {
        const found = stockObj.find(item => String(item.talla || '').toLowerCase() === String(size).toLowerCase());
        return found ? Number(found.cantidad || 0) : 0;
      }
      return Number(stockObj[size] ?? 0);
    } catch {
      return 0;
    }
  };

  const remaining = selectedSize ? getAvailableFor(selectedSize) : 0;

  const getStockColor = (count) => {
    if (count >= 20) return '#10b981';
    if (count >= 10) return '#f59e0b';
    return '#ef4444';
  };

  const isOffer = (product.hasDiscount || product.oferta) && product.precioOferta;

  const getDynamicPrice = () => {
    const qty = parseInt(quantity) || 0;
    if (qty >= 80 && parseFloat(product.precioMayorista80) > 0) return product.precioMayorista80;
    if (qty >= 6 && parseFloat(product.precioMayorista6) > 0) return product.precioMayorista6;
    return isOffer ? (product.precioOferta || product.precio) : product.precio;
  };

  return (
    <div className="gm-modal-overlay" onClick={closeModal}>
      <div className="gm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="gm-modal-close" onClick={closeModal} type="button">
          <FaTimes size={18} />
        </button>

        {/* LEFT: IMAGE */}
        <div className="gm-modal-left">
          <div className="gm-modal-imgbox">
            <img src={images[modalImgIndex]} alt={product.nombre} className="gm-modal-img" />
            {images.length > 1 && (
              <div className="gm-modal-dots">
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={`gm-modal-dot ${i === modalImgIndex ? 'active' : ''}`}
                    onMouseEnter={() => setModalImgIndex(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: INFO */}
        <div className="gm-modal-right">
          {/* 1. Title + Color Tags */}
          <div className="gm-modal-title-colors">
            <h2 className="gm-modal-title">{product.nombre}</h2>
            {product.colores && product.colores.length > 0 && (
              <div className="gm-modal-colors-inline">
                {product.colores.map((c, i) => (
                  <span
                    key={i}
                    className="gm-color-tag"
                    style={{
                      backgroundColor: colorNameToHex(c),
                      color: isLightColor(c) ? '#000' : '#fff',
                      borderColor: isLightColor(c) ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 2. Price + Bulk Message + Wholesale Tags */}
          <div className="gm-price-row">
            <div className="gm-modal-price-main">
              ${Math.round(getDynamicPrice() || 0).toLocaleString()}
            </div>

            {/* Wholesale badges */}
            <div className="gm-modal-tags-inline">
              {parseInt(quantity) >= 80 && parseFloat(product.precioMayorista80) > 0 ? (
                <span className="gm-tag gm-tag--destacado" style={{ backgroundColor: '#10b981', color: '#fff' }}>
                  Mayorista 80+
                </span>
              ) : parseInt(quantity) >= 6 && parseFloat(product.precioMayorista6) > 0 ? (
                <span className="gm-tag gm-tag--featured" style={{ backgroundColor: '#2a4a6f', color: '#fff' }}>
                  Mayorista 6+
                </span>
              ) : null}
            </div>

            <div className="gm-bulk-discount-info">
              A partir de {BULK_MIN_QTY} unidades tienes descuento por mayor
            </div>
          </div>

          {/* 3. Original price (only if offer) */}
          {isOffer && (
            <div className="gm-original-price-row">
              <span className="gm-original-price">
                Antes: ${Math.round(product.precio).toLocaleString()}
              </span>
              <span className="gm-discount-badge">
                {Math.round(((product.precio - product.precioOferta) / product.precio) * 100)}% DCTO
              </span>
            </div>
          )}

          {/* 4. Description */}
          <div className="gm-modal-desc-box">
            <p className="gm-modal-description">
              {product.descripcion || "Sin descripción disponible."}
            </p>
          </div>

          {/* 5. Sizes */}
          {sizesForModal.length > 0 && (
            <div className="gm-sizes">
              <div className="gm-sizes-head">
                <span className="gm-sizes-label">Talla:</span>
              </div>
              <div className="gm-sizes-wrap">
                {sizesForModal.map((t) => {
                  const ava = getAvailableFor(t);
                  const disabled = ava <= 0;
                  const isSelected = selectedSize === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`gm-size-chip ${disabled ? "is-disabled" : ""} ${isSelected ? "is-selected" : ""}`}
                      onClick={() => !disabled && handleSizeSelect(t)}
                      title={disabled ? "Agotado" : `Disponible: ${ava}`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              {showSizeError && (
                <div className="gm-size-error-msg">
                  ⚠️ Debes seleccionar una talla primero
                </div>
              )}
            </div>
          )}

          {/* 6. Quantity + Stock */}
          <div className="gm-quantity-selector">
            <span className="gm-quantity-label">Cantidad:</span>
            <div className="gm-quantity-controls">
              <button className="gm-qty-btn" onClick={decrementQuantity} disabled={parseInt(quantity) <= 0} type="button">
                <FaMinus size={10} />
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="gm-qty-input-manual"
                value={quantity}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  handleQuantityInput && handleQuantityInput(val);
                }}
                onFocus={(e) => setTimeout(() => e.target.select(), 10)}
                min="0"
                max={remaining}
              />
              <button 
                className="gm-qty-btn" 
                onClick={incrementQuantity} 
                disabled={selectedSize && parseInt(quantity) >= remaining}
                type="button"
              >
                <FaPlus size={10} />
              </button>
            </div>
            {selectedSize && (
              <span
                className="gm-stock-badge"
                style={{
                  color: getStockColor(remaining),
                  borderColor: `${getStockColor(remaining)}44`,
                  backgroundColor: `${getStockColor(remaining)}11`
                }}
              >
                {remaining} RESTANTES
              </span>
            )}
          </div>

          {/* 7. Add to Cart (full width) */}
          <button
            className={`gm-btn-add-cart ${Number(product.stock) === 0 ? "gm-btn-disabled-agotado" : ""} ${showSizeError ? "gm-btn-error" : ""}`}
            onClick={handleAddToCart}
            disabled={Number(product.stock) === 0 || parseInt(quantity) === 0 || (selectedSize && parseInt(quantity) > remaining)}
          >
            {Number(product.stock) === 0 ? (
              <><FaBan size={18} /> AGOTADO</>
            ) : (
              <><FaShoppingCart size={18} /> Añadir al Carrito</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
