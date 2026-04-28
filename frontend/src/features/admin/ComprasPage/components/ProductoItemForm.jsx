/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import { FaTrash } from 'react-icons/fa';
import { SearchSelect } from '../../../shared/services';

const ProductoItemForm = ({ producto, index, availableProducts = [], availableSizes = [], onChange, onRemove, isViewMode = false, isFirst = false, errors = {}, isLoadingProducts = false }) => {
  const subtotal = (producto.cantidad || 0) * (parseFloat(producto.precioCompra || 0));
  
  const formatNumber = (num) => {
    if (num === null || num === undefined || num === '') return '';
    const str = num.toString().replace('.', ',');
    const parts = str.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.length > 1 ? parts[0] + ',' + parts[1] : parts[0];
  };

  const inputStyle = {
    backgroundColor: 'transparent',
    border: '1px solid #ffffff30',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '11px',
    padding: '2px 6px',
    width: '100%',
    height: '28px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '10px',
    color: '#FFFFFF',
    marginBottom: '2px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  };

  const capStyle = { fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '2px', display: 'block' };
  const readStyle = { backgroundColor: 'transparent', border: '1px solid #ffffff20', borderRadius: '4px', color: '#ffffff', fontSize: '11px', padding: '2px 6px', width: '100%', height: '28px', display: 'flex', alignItems: 'center', boxSizing: 'border-box', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

  // ===== MODO VISTA: misma fila que registrar pero solo lectura =====
  if (isViewMode) {
    return (
      <div style={{ backgroundColor: 'transparent', borderBottom: '1px solid #ffffff10', padding: '8px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 90px 62px 1fr 1fr 90px 90px', gap: '6px', alignItems: 'start' }}>
          <div>
            <div style={{ ...readStyle, fontWeight: '600' }}>{producto.nombre || '-'}</div>
            <span style={capStyle}>Producto</span>
          </div>
          <div>
            <div style={{ ...readStyle, color: '#F5C81B', justifyContent: 'center' }}>{producto.talla || 'N/A'}</div>
            <span style={capStyle}>Talla</span>
          </div>
          <div>
            <div style={{ ...readStyle, justifyContent: 'center', color: '#94a3b8' }}>{producto.cantidad || 0}</div>
            <span style={capStyle}>Cant.</span>
          </div>
          <div>
            <div style={{ ...readStyle, color: '#10B981', fontWeight: '700' }}>${formatNumber(producto.precioCompra)}</div>
            <span style={{ ...capStyle, color: '#10B981' }}>P. Compra</span>
          </div>
          <div>
            <div style={{ ...readStyle, color: '#F5C81B', fontWeight: '700' }}>${formatNumber(producto.precioVenta)}</div>
            <span style={{ ...capStyle, color: '#F5C81B' }}>P. Venta</span>
          </div>
          <div>
            <div style={{ ...readStyle, color: '#cbd5e1' }}>${formatNumber(producto.precioMayorista6)}</div>
            <span style={capStyle}>Mayor. +6</span>
          </div>
          <div>
            <div style={{ ...readStyle, color: '#cbd5e1' }}>${formatNumber(producto.precioMayorista80)}</div>
            <span style={capStyle}>Mayor. +80</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
          Subtotal: <span style={{ color: '#F5C81B', fontWeight: '700' }}>${formatNumber(subtotal)}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'transparent',
      borderBottom: '1px solid #ffffff10',
      padding: '8px 4px',
      position: 'relative',
    }}>
      {/* FILA ÚNICA */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 90px 62px 1fr 1fr 90px 90px 30px', gap: '6px', alignItems: 'start' }}>
        {/* Producto */}
        <div>
          <SearchSelect 
            options={availableProducts}
            selectedItem={availableProducts.find(p => p.nombre === producto.nombre || p.Nombre === producto.nombre)}
            onSelect={(selected) => {
              if (selected) {
                onChange(index, 'id', selected.id || selected.IdProducto);
                onChange(index, 'nombre', selected.nombre || selected.Nombre);
                onChange(index, 'talla', selected.talla || selected.Talla || '');
                onChange(index, 'precioCompra', selected.precioCompra || selected.PrecioCompra || '');
                onChange(index, 'precioVenta', selected.precioVenta || selected.PrecioVenta || '');
              }
            }}
            placeholder="Buscar producto..."
            loadingText={isLoadingProducts ? "Cargando..." : null}
            error={errors[`prod_${index}`]}
            filterFn={(p, term) => {
              const t = term.toLowerCase();
              return (p.nombre || p.Nombre || '').toLowerCase().includes(t);
            }}
            renderOption={(p) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>{p.nombre || p.Nombre}</span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Ref: {p.id || p.IdProducto} • Talla: {p.talla || p.Talla || 'N/A'}</span>
              </div>
            )}
            height="28px"
          />
          <span style={capStyle}>Producto *</span>
        </div>
        {/* Talla */}
        <div>
          <select
            value={producto.talla || ''}
            onChange={(e) => onChange(index, 'talla', e.target.value)}
            style={{ ...inputStyle, border: errors[`talla_${index}`] ? '1px solid #ef4444' : '1px solid #334155' }}
          >
            <option value="">Talla</option>
            {availableSizes.map(s => (
              <option key={s.value || s} value={s.value || s}>{s.label || s}</option>
            ))}
          </select>
          <span style={capStyle}>Talla *</span>
        </div>
        {/* Cantidad */}
        <div>
          <input
            type="number" min="1"
            value={producto.cantidad || ''}
            onChange={(e) => onChange(index, 'cantidad', parseInt(e.target.value) || 0)}
            style={{ ...inputStyle, border: errors[`qty_${index}`] ? '1px solid #ef4444' : '1px solid #334155', textAlign: 'center' }}
            placeholder="0"
          />
          <span style={capStyle}>Cant. *</span>
        </div>
        {/* Precio Compra */}
        <div>
          <input
            type="text"
            value={formatNumber(producto.precioCompra)}
            onChange={(e) => {
              let val = e.target.value.replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '');
              const parts = val.split('.');
              if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
              onChange(index, 'precioCompra', val);
            }}
            style={{ ...inputStyle, color: '#10B981', fontWeight: '700', border: errors[`price_${index}`] ? '1px solid #ef4444' : '1px solid #334155' }}
            placeholder="0"
          />
          <span style={{ ...capStyle, color: '#10B981' }}>P. Compra *</span>
        </div>
        {/* Precio Venta */}
        <div>
          <input
            type="text"
            value={formatNumber(producto.precioVenta)}
            onChange={(e) => {
              let val = e.target.value.replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '');
              const parts = val.split('.');
              if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
              onChange(index, 'precioVenta', val);
            }}
            style={{ ...inputStyle, color: '#F5C81B', fontWeight: '700', border: errors[`sell_${index}`] ? '1px solid #ef4444' : '1px solid #334155' }}
            placeholder="0"
          />
          <span style={{ ...capStyle, color: '#F5C81B' }}>P. Venta *</span>
        </div>
        {/* Precio +6 */}
        <div>
          <input
            type="text"
            value={formatNumber(producto.precioMayorista6)}
            onChange={(e) => {
              let val = e.target.value.replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '');
              const parts = val.split('.');
              if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
              onChange(index, 'precioMayorista6', val);
            }}
            style={inputStyle}
            placeholder="0"
          />
          <span style={capStyle}>Mayor. +6</span>
        </div>
        {/* Precio +80 */}
        <div>
          <input
            type="text"
            value={formatNumber(producto.precioMayorista80)}
            onChange={(e) => {
              let val = e.target.value.replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.]/g, '');
              const parts = val.split('.');
              if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
              onChange(index, 'precioMayorista80', val);
            }}
            style={inputStyle}
            placeholder="0"
          />
          <span style={capStyle}>Mayor. +80</span>
        </div>
        {/* Eliminar */}
        <div style={{ display: 'flex', alignItems: 'center', paddingTop: '0px' }}>
          {!isFirst && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                padding: '4px',
                height: '28px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FaTrash size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Subtotal */}
      <div style={{ textAlign: 'right', fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
        Subtotal: <span style={{ color: '#F5C81B', fontWeight: '700' }}>${formatNumber(subtotal)}</span>
      </div>
    </div>
  );

};

export default ProductoItemForm;
