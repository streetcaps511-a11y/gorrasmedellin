import React from 'react';
import { FaTimes, FaMinus, FaPlus, FaShoppingCart, FaBan } from 'react-icons/fa';
import '../styles/ProductModal.css';

const isLightColor = (colorName) => {
  const lightColors = ['white', 'blanco', 'yellow', 'amarillo', 'beige', 'crema', 'cream', 'ivory', 'marfil', 'oro', 'gold', 'dorado', 'lime', 'cyan', 'aqua', 'silver', 'plata', 'celeste', 'lila', 'hueso', 'rosa', 'pink'];
  return lightColors.includes(colorName.toLowerCase());
};

const colorNameToHex = (name) => {
  const map = {
    'azul marino': '#000080', negro: '#000000', black: '#000000', blanco: '#ffffff', white: '#ffffff',
    rojo: '#ff0000', red: '#ff0000', azul: '#0000ff', blue: '#0000ff', verde: '#008000', green: '#008000',
    amarillo: '#ffff00', yellow: '#ffff00', morado: '#800080', purple: '#800080', gris: '#808080', gray: '#808080',
    naranja: '#ffa500', rosa: '#ffc0cb', pink: '#ffc0cb', cafe: '#6f4e37', café: '#6f4e37', beige: '#f5f5dc',
    crema: '#fffdd0', celeste: '#87ceeb', lila: '#e6e6fa', hueso: '#f5f5dc', dorado: '#d4ac0d', plata: '#c0c0c0',
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
  const [modalImgIndex, setModalImgIndex] = React.useState(0);

  React.useEffect(() => {
    if (product) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, [product]);

  if (!product) return null;
  const images = Array.isArray(product.imagenes) && product.imagenes.filter(Boolean).length
    ? product.imagenes.filter(Boolean).map(x => String(x).trim()).filter(Boolean)
    : [safeImg(product)];

  const getAvailableFor = (size) => {
    if (!product.tallasStock) return 0;
    try {
      const stockObj = typeof product.tallasStock === 'string' ? JSON.parse(product.tallasStock) : product.tallasStock;
      if (Array.isArray(stockObj)) {
        const found = stockObj.find(item => String(item.talla || '').toLowerCase() === String(size).toLowerCase());
        return found ? Number(found.cantidad || 0) : 0;
      }
      return Number(stockObj[size] ?? 0);
    } catch { return 0; }
  };

  const remaining = selectedSize ? getAvailableFor(selectedSize) : 0;
  const isAgotado = Number(product.stock) === 0;
  const isOffer = (product.hasDiscount || product.has_discount || product.oferta) && product.precioOferta;

  const getPrice = () => {
    const qty = parseInt(quantity) || 0;
    if (qty >= 80 && parseFloat(product.precioMayorista80) > 0) return product.precioMayorista80;
    if (qty >= 6 && parseFloat(product.precioMayorista6) > 0) return product.precioMayorista6;
    return isOffer ? product.precioOferta : product.precio;
  };

  return (
    <div className="gm-modal-overlay" onClick={closeModal}>
      <div className="gm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="gm-modal-close" onClick={closeModal} type="button"><FaTimes size={18} /></button>
        <div className="gm-modal-left">
          <div className="gm-modal-imgbox">
            {isAgotado && <div className="gm-img-badge-corner agotado">AGOTADO</div>}
            {isOffer && <div className="gm-img-badge-corner oferta">OFERTA</div>}
            <img src={images[modalImgIndex]} alt={product.nombre} className="gm-modal-img" />
            {images.length > 1 && (
              <div className="gm-modal-dots">
                {images.map((_, i) => (
                  <button key={i} className={`gm-modal-dot ${i === modalImgIndex ? 'active' : ''}`} onMouseEnter={() => setModalImgIndex(i)} />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="gm-modal-right">
          <div className="gm-modal-title-colors">
            <h2 className="gm-modal-title">{product.nombre}</h2>
            {product.colores?.length > 0 && (
              <div className="gm-modal-colors-inline">
                {product.colores.map((c, i) => {
                  const hex = colorNameToHex(c);
                  const displayColor = (c.toLowerCase() === 'negro' || hex === '#000000' || hex === '#000') ? '#555' : hex;
                  return (
                    <span 
                      key={i} 
                      className="gm-color-tag" 
                      style={{ 
                        color: displayColor,
                        borderColor: displayColor,
                        backgroundColor: 'transparent' 
                      }}
                    >
                      {c}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <div className="gm-price-row">
            <div className="gm-modal-price-main">${Math.round(getPrice() || 0).toLocaleString()}</div>
            {isOffer && (
              <div className="gm-original-price-row">
                <span className="gm-original-price">Antes: ${Math.round(product.precio).toLocaleString()}</span>
                <span className="gm-discount-badge">{Math.round(((product.precio - product.precioOferta) / product.precio) * 100)}% DCTO</span>
              </div>
            )}
            <div className="gm-bulk-discount-info">A partir de {BULK_MIN_QTY} unidades tienes descuento por mayor</div>
          </div>
          <div className="gm-modal-desc-box"><p className="gm-modal-description">{product.descripcion || "Sin descripción disponible."}</p></div>
          {sizesForModal?.length > 0 && (
            <div className="gm-sizes">
              <span className="gm-sizes-label">Talla:</span>
              <div className="gm-sizes-wrap">
                {sizesForModal.map((t) => (
                  <button key={t} type="button" className={`gm-size-chip ${getAvailableFor(t) <= 0 || isAgotado ? "is-disabled" : ""} ${selectedSize === t ? "is-selected" : ""}`} onClick={() => getAvailableFor(t) > 0 && !isAgotado && handleSizeSelect(t)}>{t}</button>
                ))}
              </div>
              {showSizeError && !isAgotado && <div className="gm-size-error-msg">⚠️ Debes seleccionar una talla primero</div>}
            </div>
          )}
          <div className="gm-quantity-selector">
            <span className="gm-quantity-label">Cantidad:</span>
            <div className="gm-quantity-controls">
              <button className="gm-qty-btn" onClick={decrementQuantity} disabled={isAgotado || parseInt(quantity) <= 0} type="button"><FaMinus size={10} /></button>
              <input type="text" className="gm-qty-input-manual" value={quantity} onChange={(e) => handleQuantityInput(e.target.value.replace(/\D/g, ''))} disabled={isAgotado} />
              <button className="gm-qty-btn" onClick={incrementQuantity} disabled={isAgotado} type="button"><FaPlus size={10} /></button>
            </div>
          </div>
          <button
            className={`gm-btn-add-cart ${isAgotado ? "gm-btn-disabled-agotado" : ""} ${showSizeError ? "gm-btn-error" : ""}`}
            onClick={handleAddToCart}
            disabled={(selectedSize && parseInt(quantity) > remaining)}
          >
            {isAgotado ? (
              <><FaBan size={18} /> <span className="gm-btn-label">AGOTADO</span></>
            ) : (
              <><FaShoppingCart size={18} /> <span className="gm-btn-label">Añadir al Carrito</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
