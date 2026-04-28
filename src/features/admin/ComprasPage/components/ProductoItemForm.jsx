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
    fontSize: '11px',
    color: '#8F9DB1', // Azul vibrante
    marginBottom: '5px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const capStyle = { 
    fontSize: '10px', 
    color: '#8F9DB1', // Azul para etiquetas secundarias
    textTransform: 'uppercase', 
    letterSpacing: '0.4px', 
    marginBottom: '4px', // Ahora va arriba
    display: 'block',
    fontWeight: '700'
  };
  const readStyle = { backgroundColor: 'transparent', border: '1px solid #ffffff20', borderRadius: '4px', color: '#ffffff', fontSize: '11px', padding: '2px 6px', width: '100%', height: '28px', display: 'flex', alignItems: 'center', boxSizing: 'border-box', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

  // ===== MODO VISTA: misma fila que registrar pero solo lectura =====
  if (isViewMode) {
    return (
      <div style={{ backgroundColor: 'transparent', borderBottom: '1px solid #ffffff10', padding: '8px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '22px 2fr 90px 62px 1fr 1fr 90px 90px', gap: '6px', alignItems: 'start' }}>
          <div style={{ ...readStyle, border: 'none', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#F5C81B', height: '28px' }}>
            {index + 1}.
          </div>
          <div>
            <div style={{ ...readStyle, fontWeight: '600' }}>{producto.nombre || '-'}</div>
          </div>
          <div>
            <div style={{ ...readStyle, color: '#F5C81B', justifyContent: 'center' }}>{producto.talla || 'N/A'}</div>
          </div>
          <div>
            <div style={{ ...readStyle, justifyContent: 'center', color: '#94a3b8' }}>{producto.cantidad || 0}</div>
          </div>
          <div>
            <div style={{ ...readStyle, color: '#10B981', fontWeight: '700' }}>${formatNumber(producto.precioCompra)}</div>
          </div>
          <div>
            <div style={{ ...readStyle, color: '#F5C81B', fontWeight: '700' }}>${formatNumber(producto.precioVenta)}</div>
          </div>
          <div>
            <div style={{ ...readStyle, color: '#cbd5e1' }}>${formatNumber(producto.precioMayorista6)}</div>
          </div>
          <div>
            <div style={{ ...readStyle, color: '#cbd5e1' }}>${formatNumber(producto.precioMayorista80)}</div>
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
      <div style={{ display: 'grid', gridTemplateColumns: '22px 2fr 90px 62px 1fr 1fr 90px 90px 30px', gap: '6px', alignItems: 'center' }}>
        {/* Numeración */}
        <div style={{ ...readStyle, border: 'none', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#F5C81B', height: '28px', padding: 0 }}>
          {index + 1}.
        </div>
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
                // ⚡ No poner 0 si no hay precio para evitar tener que borrarlo
                onChange(index, 'precioCompra', selected.precioCompra > 0 ? selected.precioCompra : '');
                onChange(index, 'precioVenta', selected.precioVenta > 0 ? selected.precioVenta : '');
              } else {
                // ❌ Limpiar campos si se borra la selección
                onChange(index, 'id', '');
                onChange(index, 'nombre', '');
                onChange(index, 'talla', '');
                onChange(index, 'precioCompra', '');
                onChange(index, 'precioVenta', '');
              }
            }}
            placeholder="Buscar producto..."
            noResultsText="Producto no encontrado"
            loadingText={isLoadingProducts ? "Cargando..." : null}
            error={errors[`prod_${index}`]}
            filterFn={(p, term) => {
              const t = term.toLowerCase();
              return (p.nombre || p.Nombre || '').toLowerCase().includes(t);
            }}
            renderOption={(p, i) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
                <span style={{ color: '#F5C81B', fontWeight: '800', fontSize: '12px' }}>{i + 1}.</span>
                <img 
                  src={(Array.isArray(p.imagenes) && p.imagenes[0]) || (Array.isArray(p.Imagenes) && p.Imagenes[0]) || '/images/placeholder-product.png'} 
                  alt={p.nombre || p.Nombre} 
                  style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #ffffff20' }}
                  onError={(e) => { e.target.src = '/images/placeholder-product.png'; }}
                />
                <span style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>{p.nombre || p.Nombre}</span>
              </div>
            )}
            height="28px"
          />
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
        </div>
        {/* Eliminar / Limpiar */}
        <div style={{ display: 'flex', alignItems: 'center', paddingTop: '0px' }}>
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
            title={isFirst && producto.id === '' ? "Limpiar fila" : "Eliminar fila"}
          >
            <FaTrash size={13} />
          </button>
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
