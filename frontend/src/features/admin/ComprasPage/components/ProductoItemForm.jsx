import { FaTrash } from 'react-icons/fa';

const ProductoItemForm = ({ producto, index, availableSizes = [], onChange, onRemove, isViewMode = false, isFirst = false, errors = {} }) => {
  const subtotal = (producto.cantidad || 0) * (parseFloat(producto.precioCompra || 0));
  
  const formatNumber = (num) => {
    if (num === null || num === undefined || num === '') return '';
    const str = num.toString().replace('.', ',');
    const parts = str.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.length > 1 ? parts[0] + ',' + parts[1] : parts[0];
  };

  const inputStyle = {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '13px',
    padding: '8px 10px',
    width: '100%',
    height: '38px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    color: '#9CA3AF',
    marginBottom: '4px',
    fontWeight: '500'
  };

  if (isViewMode) {
    return (
      <div style={{
        backgroundColor: '#111827',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', marginBottom: '10px' }}>
          <div>
            <span style={labelStyle}>Producto</span>
            <div style={{ color: '#fff', fontWeight: '600' }}>{producto.nombre || '-'}</div>
          </div>
          <div>
            <span style={labelStyle}>Talla</span>
            <div style={{ color: '#F5C81B', fontWeight: '500' }}>{producto.talla || 'N/A'}</div>
          </div>
          <div>
            <span style={labelStyle}>Cantidad</span>
            <div style={{ color: '#fff' }}>{producto.cantidad || 0} unid.</div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', borderTop: '1px solid #2d3748', paddingTop: '10px' }}>
          <div>
            <span style={labelStyle}>Compra</span>
            <div style={{ color: '#10B981', fontWeight: '600' }}>${formatNumber(producto.precioCompra)}</div>
          </div>
          <div>
            <span style={labelStyle}>Venta</span>
            <div style={{ color: '#F5C81B', fontWeight: '600' }}>${formatNumber(producto.precioVenta)}</div>
          </div>
          <div>
            <span style={labelStyle}>May. +6</span>
            <div style={{ color: '#fff', fontSize: '12px' }}>${formatNumber(producto.precioMayorista6)}</div>
          </div>
          <div>
            <span style={labelStyle}>May. +80</span>
            <div style={{ color: '#fff', fontSize: '12px' }}>${formatNumber(producto.precioMayorista80)}</div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#111827',
      border: '1px solid #334155',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      position: 'relative',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      {!isFirst && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <FaTrash size={14} />
        </button>
      )}

      {/* FILA 1: Selección de Producto, Talla, Cantidad */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Nombre del producto <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            type="text"
            value={producto.nombre || ''}
            onChange={(e) => onChange(index, 'nombre', e.target.value)}
            style={{ ...inputStyle, border: errors[`prod_${index}`] ? '1px solid #ef4444' : '1px solid #334155' }}
            placeholder="Ej: Gorra Yankees"
          />
        </div>
        <div>
          <label style={labelStyle}>Talla <span style={{ color: '#ef4444' }}>*</span></label>
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
        </div>
        <div>
          <label style={labelStyle}>Cantidad <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            type="number"
            min="1"
            value={producto.cantidad || ''}
            onChange={(e) => onChange(index, 'cantidad', parseInt(e.target.value) || 0)}
            style={{ ...inputStyle, border: errors[`qty_${index}`] ? '1px solid #ef4444' : '1px solid #334155' }}
            placeholder="0"
          />
        </div>
      </div>

      {/* FILA 2: Precios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', backgroundColor: '#00000020', padding: '12px', borderRadius: '6px', border: '1px dashed #475569' }}>
        <div>
          <label style={{ ...labelStyle, color: '#10B981' }}>Precio compra <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            type="text"
            value={formatNumber(producto.precioCompra)}
            onChange={(e) => {
              let val = e.target.value.replace(/\./g, '');
              val = val.replace(/,/g, '.');
              val = val.replace(/[^0-9.]/g, '');
              const parts = val.split('.');
              if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
              onChange(index, 'precioCompra', val);
            }}
            style={{ ...inputStyle, color: '#10B981', fontWeight: '700', border: errors[`price_${index}`] ? '1px solid #ef4444' : '1px solid #334155' }}
            placeholder="0"
          />
        </div>
        <div>
          <label style={{ ...labelStyle, color: '#F5C81B' }}>Precio venta <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            type="text"
            value={formatNumber(producto.precioVenta)}
            onChange={(e) => {
              let val = e.target.value.replace(/\./g, '');
              val = val.replace(/,/g, '.');
              val = val.replace(/[^0-9.]/g, '');
              const parts = val.split('.');
              if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
              onChange(index, 'precioVenta', val);
            }}
            style={{ ...inputStyle, color: '#F5C81B', fontWeight: '700', border: errors[`sell_${index}`] ? '1px solid #ef4444' : '1px solid #334155' }}
            placeholder="0"
          />
        </div>
        <div>
          <label style={labelStyle}>Precio +6</label>
          <input
            type="text"
            value={formatNumber(producto.precioMayorista6)}
            onChange={(e) => {
              let val = e.target.value.replace(/\./g, '');
              val = val.replace(/,/g, '.');
              val = val.replace(/[^0-9.]/g, '');
              const parts = val.split('.');
              if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
              onChange(index, 'precioMayorista6', val);
            }}
            style={inputStyle}
            placeholder="0"
          />
        </div>
        <div>
          <label style={labelStyle}>Precio +80</label>
          <input
            type="text"
            value={formatNumber(producto.precioMayorista80)}
            onChange={(e) => {
              let val = e.target.value.replace(/\./g, '');
              val = val.replace(/,/g, '.');
              val = val.replace(/[^0-9.]/g, '');
              const parts = val.split('.');
              if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
              onChange(index, 'precioMayorista80', val);
            }}
            style={inputStyle}
            placeholder="0"
          />
        </div>
      </div>
      
      <div style={{ marginTop: '10px', textAlign: 'right', fontSize: '13px', color: '#9CA3AF' }}>
        Subtotal item: <span style={{ color: '#F5C81B', fontWeight: '700' }}>${formatNumber(subtotal)}</span>
      </div>
    </div>
  );
};

export default ProductoItemForm;
