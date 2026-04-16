import React from 'react';
import { FaTrash } from "react-icons/fa";
import { SearchSelect } from '../../../shared/services';

const ProductoForm = React.memo(function ProductoForm({ 
  producto, 
  onChange, 
  onRemove, 
  index, 
  isViewMode = false, 
  isFirst = false, 
  availableProducts = [], 
  availableSizes = [],
  errors = {} // ⬅️ Recibimos el objeto de errores
}) {
  const subtotal = (producto.cantidad || 0) * (parseFloat(producto.precio) || 0);

  // 🔥 FUNCIÓN DE CÁLCULO DE PRECIO MAYORISTA (Regla de Negocio)
  const calculateWholesalePrice = (prodData, cant) => {
    if (!prodData) return 0;
    
    const cantidad = parseInt(cant) || 1;
    
    // Regla 80+ unidades
    if (cantidad >= 80 && parseFloat(prodData.precioMayorista80) > 0) {
      return prodData.precioMayorista80;
    }
    
    // Regla 6+ unidades
    if (cantidad >= 6 && parseFloat(prodData.precioMayorista6) > 0) {
      return prodData.precioMayorista6;
    }
    
    // Regla Minorista / Oferta (1-5 unidades)
    return prodData.enOfertaVenta ? prodData.precioOferta : prodData.precioVenta;
  };

  const gridCols = isViewMode 
    ? '1.6fr 1.2fr 100px 140px 140px'
    : '1.6fr 1.2fr 100px 140px 140px 40px';

  if (isViewMode) {
    return (
      <div className="product-form-row view-mode" style={{ gridTemplateColumns: gridCols }}>
        <div className="product-input disabled">{producto.nombre || '-'}</div>
        <div className="product-input disabled">{producto.talla || '-'}</div>
        <div className="product-input disabled center">{producto.cantidad || 0}</div>
        <div className="product-input disabled price">${Number(producto.precio || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div className="product-input disabled subtotal">${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>
    );
  }

  return (
    <div className="product-form-row" style={{ gridTemplateColumns: gridCols }}>
      <SearchSelect 
        options={availableProducts}
        selectedItem={availableProducts.find(p => String(p.id) === String(producto.id))}
        height="42px"
        onSelect={(sel) => {
          if (!sel) {
            onChange(index, 'id', '');
            onChange(index, 'nombre', '');
            onChange(index, 'precio', '');
            onChange(index, 'talla', '');
            return;
          }
          onChange(index, 'id', sel.id); 
          onChange(index, 'nombre', sel.nombre); 
          
          // 🔥 Aplicar precio mayorista inicial basado en la cantidad actual
          const initialPrice = calculateWholesalePrice(sel, producto.cantidad);
          onChange(index, 'precio', initialPrice?.toString() || '0');
          
          onChange(index, 'talla', '');
        }}
        placeholder="Buscar producto..."
        error={errors[`producto_id_${index}`]}
        renderOption={(p) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
            <img 
              src={p.imagen || (p.imagenes && p.imagenes[0]) || 'https://via.placeholder.com/40'} 
              alt={p.nombre} 
              style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #ffffff10' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{p.nombre}</span>
              <span style={{ color: '#FFD700', fontWeight: 800, fontSize: '12px' }}>
                ${Number(p.enOfertaVenta ? p.precioOferta : p.precioVenta).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      />
      
      <select 
        value={producto.talla || ''} 
        onChange={(e) => onChange(index, 'talla', e.target.value)} 
        className={`product-input ${errors[`producto_talla_${index}`] ? 'has-error' : ''}`}
        disabled={!producto.id}
      >
        <option value="" disabled hidden>Seleccionar...</option>
        {(() => {
          if (!producto.id) return null;
          const sel = availableProducts.find(p => p.id === parseInt(producto.id));
          if (!sel) return null;
          
          const productSizes = sel.tallasStock?.map(ts => ts.talla) || sel.tallas || [];
          
          return productSizes.map(t => (
            <option key={t} value={t}>&nbsp;&nbsp;{t}</option>
          ));
        })()}
      </select>
      
      <div className="qty-input-container">
        <input 
          type="number" 
          min="1" 
          value={producto.cantidad || ''} 
          onChange={(e) => {
            const newCant = parseInt(e.target.value) || 0;
            onChange(index, 'cantidad', newCant);
            
            // 🔥 AUTO-RECALCULAR PRECIO AL CAMBIAR CANTIDAD
            if (producto.id) {
              const sel = availableProducts.find(p => p.id === parseInt(producto.id));
              if (sel) {
                const newPrice = calculateWholesalePrice(sel, newCant);
                onChange(index, 'precio', newPrice?.toString() || '0');
              }
            }
          }} 
          className={`product-input center ${errors[`producto_cantidad_${index}`] ? 'has-error' : ''}`} 
          placeholder="0"
        />
        {(() => {
          if (!producto.id || !producto.talla) return null;
          const sel = availableProducts.find(p => p.id === parseInt(producto.id));
          const sizeInfo = sel?.tallasStock?.find(ts => ts.talla === producto.talla);
          const stock = sizeInfo ? parseInt(sizeInfo.cantidad) : 0;
          
          return (
            <div className="stock-info-wrapper">
              <span className="stock-label">Disponibles: <span className="stock-number">{stock}</span></span>
              {errors[`producto_cantidad_${index}`] && (
                <span className="stock-error-msg">{errors[`producto_cantidad_${index}`].msg}</span>
              )}
            </div>
          );
        })()}
      </div>
      
      <input 
        value={producto.precio ? Number(producto.precio).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
        className={`product-input price readonly ${errors[`producto_precio_${index}`] ? 'has-error' : ''}`} 
        placeholder="Precio"
        readOnly
      />

      <div className="product-input subtotal">
        ${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      
      <div className="product-action">
        {!isFirst && (
          <button onClick={() => onRemove(index)} className="btn-delete-row">
            <FaTrash size={14} />
          </button>
        )}
      </div>
    </div>
  );
});

export default ProductoForm;
