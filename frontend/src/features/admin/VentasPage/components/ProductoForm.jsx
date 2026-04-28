import React from 'react';
import { FaTrash, FaEye } from "react-icons/fa";
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
  errors = {} 
}) {
  const subtotal = (producto.cantidad || 0) * (parseFloat(producto.precio) || 0);

  const calculateWholesalePrice = (prodData, cant) => {
    if (!prodData) return 0;
    const cantidad = parseInt(cant) || 1;
    if (cantidad >= 80 && parseFloat(prodData.precioMayorista80) > 0) return prodData.precioMayorista80;
    if (cantidad >= 6 && parseFloat(prodData.precioMayorista6) > 0) return prodData.precioMayorista6;
    return prodData.enOfertaVenta ? prodData.precioOferta : prodData.precioVenta;
  };

  const capStyle = { 
    fontSize: '10px', 
    color: '#8F9DB1', 
    textTransform: 'uppercase', 
    fontWeight: '700', 
    marginBottom: '4px',
    display: 'block'
  };

  const gridCols = isViewMode 
    ? '22px 1.6fr 1.2fr 100px 140px 140px'
    : '22px 1.6fr 1.2fr 100px 140px 140px 40px';

  if (isViewMode) {
    return (
      <div className="product-form-row view-mode" style={{ gridTemplateColumns: gridCols, gap: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#F5C81B', height: '34px' }}>
          {index + 1}.
        </div>
        <div>
          <div className="product-input disabled">{producto.nombre || '-'}</div>
        </div>
        <div>
          <div className="product-input disabled">{producto.talla || '-'}</div>
        </div>
        <div>
          <div className="product-input disabled center">{producto.cantidad || 0}</div>
        </div>
        <div>
          <div className="product-input disabled price">${Number(producto.precio || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div>
          <div className="product-input disabled subtotal" style={{ color: '#F5C81B' }}>${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-form-row" style={{ gridTemplateColumns: gridCols, paddingBottom: '15px', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#F5C81B', height: '34px', width: '22px' }}>
        {index + 1}.
      </div>
      
      <div>
        <SearchSelect 
          options={availableProducts}
          selectedItem={availableProducts.find(p => String(p.id) === String(producto.id))}
          height="34px"
          noResultsText="Producto no encontrado"
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
            const initialPrice = calculateWholesalePrice(sel, producto.cantidad);
            onChange(index, 'precio', initialPrice?.toString() || '0');
            onChange(index, 'talla', '');
          }}
          placeholder="Buscar producto..."
          error={errors[`producto_id_${index}`]}
          renderOption={(p, i) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
              <span style={{ color: '#F5C81B', fontWeight: '800', fontSize: '12px' }}>{i + 1}.</span>
              <img 
                src={p.imagen || (p.imagenes && p.imagenes[0]) || 'https://via.placeholder.com/40'} 
                alt={p.nombre} 
                style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #ffffff10' }} 
              />
              <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{p.nombre}</span>
            </div>
          )}
        />
      </div>
      
      <div>
        <select 
          value={producto.talla || ''} 
          onChange={(e) => onChange(index, 'talla', e.target.value)} 
          className={`ventas-field-select ${errors[`producto_talla_${index}`] ? 'has-error' : ''}`}
        >
          <option value="" disabled hidden>Seleccionar...</option>
          {(() => {
            const sel = producto.id ? availableProducts.find(p => String(p.id) === String(producto.id)) : null;
            const sizesToDisplay = (sel && sel.tallasStock && sel.tallasStock.length > 0)
              ? sel.tallasStock.map(ts => ts.talla)
              : (sel && sel.tallas && sel.tallas.length > 0 ? sel.tallas : availableSizes);
            
            return sizesToDisplay.map(t => (
              <option key={t} value={t}>{t}</option>
            ));
          })()}
        </select>
      </div>
      
      <div>
        <div className="qty-input-container">
          <input 
            type="number" 
            min="1" 
            value={producto.cantidad || ''} 
            onChange={(e) => {
              const newCant = parseInt(e.target.value) || 0;
              onChange(index, 'cantidad', newCant);
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
                <span className="stock-label">Stock: <span className="stock-number">{stock}</span></span>
                {errors[`producto_cantidad_${index}`] && (
                  <span className="stock-error-msg">{errors[`producto_cantidad_${index}`].msg}</span>
                )}
              </div>
            );
          })()}
        </div>
      </div>
      
      <div>
        <input 
          value={producto.precio ? Number(producto.precio).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
          className={`product-input price readonly ${errors[`producto_precio_${index}`] ? 'has-error' : ''}`} 
          placeholder="Precio"
          readOnly
        />
      </div>

      <div>
        <div className="product-input subtotal">
          ${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
      
      <div className="product-action">
        <button 
          onClick={() => {
            if (index === 0) {
              onChange(index, 'id', '');
              onChange(index, 'nombre', '');
              onChange(index, 'talla', '');
              onChange(index, 'cantidad', 1);
              onChange(index, 'precio', '');
            } else {
              onRemove(index);
            }
          }} 
          className="btn-delete-row"
        >
          <FaTrash size={14} />
        </button>
      </div>
    </div>
  );
});

export default ProductoForm;
