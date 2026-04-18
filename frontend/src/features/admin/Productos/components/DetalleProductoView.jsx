import React from 'react';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';

const DetalleProductoView = ({ producto }) => {
  if (!producto) return null;

  const formatCurrencyValue = (value) => {
    if (value === undefined || value === null || value === '') return '0';
    // Convertimos a número y tomamos la parte entera (para pesos colombianos no usamos decimales)
    const num = Math.floor(parseFloat(value));
    return isNaN(num) ? '0' : num.toLocaleString('es-CO');
  };

  // 🧮 CALCULAR PORCENTAJE DE OFERTA
  const calcularPorcentajeOferta = () => {
    const venta = parseFloat(producto.precioVenta) || 0;
    const oferta = parseFloat(producto.precioOferta) || 0;
    
    if (venta > 0 && oferta > 0 && oferta < venta) {
      const ahorro = venta - oferta;
      const porcentaje = (ahorro / venta) * 100;
      return Math.round(porcentaje);
    }
    return 0;
  };

  const porcentajeOferta = calcularPorcentajeOferta();

  return (
    <div className="product-form">
      <div className="product-form-body">
        <div className="product-form-top-row">
          {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
          <div className="product-form-section info-section">
            <h3 className="product-form-section-title">Información General</h3>
            <div className="product-form-group">
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Nombre:</label>
                  <div className="form-input disabled" style={{ width: '100%' }}>{producto.nombre}</div>
                </div>

                <div className="form-field">
                  <label className="form-label">Categoría:</label>
                  <div className="form-input disabled" style={{ width: '100%' }}>{producto.categoria || producto.idCategoria || 'N/A'}</div>
                </div>
              </div>

              <div className="form-field full-width">
                <label className="form-label">Descripción:</label>
                <div className="form-textarea disabled" style={{ height: '40px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                  {producto.descripcion || 'Sin descripción'}
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: PRECIOS */}
          <div className="product-form-section prices-section">
            <h4 className="product-form-section-title">Precios</h4>
            <div className="product-form-grid prices">
              <div className="form-field">
                <label className="form-label">Venta (Normal):</label>
                <div className="form-input price-input disabled">
                   $ {formatCurrencyValue(producto.precioVenta)}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Precio Oferta:</label>
                <div className="offer-input-wrapper">
                  <div className="price-with-discount">
                    <div className={`form-input price-input-offer disabled ${!producto.enOfertaVenta ? 'opacity-50' : ''}`}>
                      $ {formatCurrencyValue(producto.precioOferta)}
                    </div>
                    <div className="offer-toggle-wrapper">
                      <div className="offer-toggle">
                        <div className="switch-with-label">
                          <div className={`switch-slider ${producto.enOfertaVenta ? 'active' : ''}`} style={{ position: 'relative', width: '32px', height: '18px', borderRadius: '20px' }}>
                            <span className="switch-thumb" style={{ left: producto.enOfertaVenta ? '16px' : '2px' }} />
                          </div>
                          <label className="offer-label">OFERTA</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {producto.enOfertaVenta && porcentajeOferta > 0 && (
                <div className="total-discount-message">
                  El descuento total es de {porcentajeOferta}%
                </div>
              )}

              <div className="form-field">
                <label className="form-label">+6 Unidades:</label>
                <div className="form-input price-input disabled">
                  $ {formatCurrencyValue(producto.precioMayorista6)}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">+80 Unidades:</label>
                <div className="form-input price-input disabled">
                  $ {formatCurrencyValue(producto.precioMayorista80)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: DETALLE (Grid Row 2) */}
        <div className="product-form-bottom-row">
          <div className="product-form-section detailed no-frame">
            <div className="detailed-grid">
              {/* TALLAS */}
              <div className="form-card tallas">
                <div className="form-card-header">
                  <h3 className="form-card-title">Tallas y Stock</h3>
                </div>
                <div className="form-card-content">
                  {!producto.tallasStock || producto.tallasStock.length === 0 ? (
                    <div className="no-items-placeholder">No hay tallas</div>
                  ) : (
                    <div className="form-card-list">
                      {producto.tallasStock.map((item, index) => (
                        <div key={index} className="form-list-row talla-row" style={{ width: '100%' }}>
                          <div className="form-input disabled" style={{ flex: 1, height: '40px', display: 'flex', alignItems: 'center' }}>
                            {item.talla}
                          </div>
                          <div className="form-input disabled" style={{ width: '100px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5C81B', fontWeight: '800' }}>
                            {item.cantidad} uds
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* COLORES */}
              <div className="form-card colores">
                <div className="form-card-header">
                  <h3 className="form-card-title">Colores</h3>
                </div>
                <div className="form-card-content">
                  {!producto.colores || producto.colores.length === 0 ? (
                    <div className="no-items-placeholder">No hay colores añadidos</div>
                  ) : (
                    <div className="form-card-list">
                      {producto.colores.map((color, index) => (
                        <div key={index} className="form-list-row color-row" style={{ width: '100%' }}>
                           <div className="form-input disabled" style={{ flex: 1, height: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ 
                                width: '16px', 
                                height: '16px', 
                                borderRadius: '50%', 
                                border: '1px solid rgba(255,255,255,0.2)',
                                backgroundColor: color.toLowerCase() === 'blanco' ? '#fff' : color.toLowerCase() === 'negro' ? '#000' : color 
                              }} />
                              {color}
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* IMÁGENES */}
              <div className="form-card imagenes">
                <div className="form-card-header">
                  <h3 className="form-card-title">URLs de Imágenes</h3>
                </div>
                <div className="form-card-content">
                  {!producto.imagenes || producto.imagenes.length === 0 ? (
                    <div className="no-items-placeholder">Sin imágenes</div>
                  ) : (
                    <div className="form-card-list">
                      {producto.imagenes.filter(url => url.trim() !== '').map((url, index) => (
                        <div key={index} className="form-list-row image-row">
                          <div className="form-input disabled truncate" title={url} style={{ flex: 1, height: '40px', display: 'flex', alignItems: 'center' }}>
                            {url}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VISTA PREVIA */}
        {producto.imagenes && producto.imagenes.some(url => url.trim() !== '') && (
          <div className="external-previews-container">
            {producto.imagenes.filter(url => url.trim() !== '').map((url, i) => (
              <div key={i} className="external-preview-wrapper">
                <img 
                  src={url} 
                  alt={`Preview ${i+1}`} 
                  className="external-preview-item"
                  onError={(e) => { e.target.closest('.external-preview-wrapper').style.display = 'none'; }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleProductoView;
