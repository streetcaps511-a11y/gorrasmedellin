import React from 'react';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import CustomColorSelect from './CustomColorSelect';
import { COMMON_COLORS } from '../../../shared/constants/colores';

const Switch = ({ checked, onChange, id, disabled = false }) => (
  <label className={`switch-container ${disabled ? 'disabled' : ''}`}>
    <input
      type="checkbox"
      id={id}
      name={id}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="switch-input"
    />
    <span className={`switch-slider ${checked ? 'active' : ''}`}>
      <span className="switch-thumb" />
    </span>
  </label>
);

const ProductoForm = ({
  formData,
  errors,
  categoriasRaw = [],
  categoriasUnicas,
  tallasStock,
  availableTallas,
  coloresProducto,
  urlsImagenes,
  availableColores = [],
  handleInputChange,
  handleSubmit,
  agregarTalla,
  eliminarTalla,
  handleTallaChange,
  incrementarCantidad,
  decrementarCantidad,
  agregarUrlImagen,
  eliminarUrlImagen,
  actualizarUrlImagen,
  agregarColor,
  eliminarColor,
  actualizarColor,
  handleCantidadChange,
  setFormData // Occasionally needed for specific resets if required
}) => {
  const formatCurrencyValue = (value) => {
    if (value === undefined || value === null || value === '') return '0';
    // Convertimos a número y tomamos la parte entera (para pesos colombianos no usamos decimales)
    const num = Math.floor(parseFloat(value));
    return isNaN(num) ? '0' : num.toLocaleString('es-CO');
  };

  // 🧮 CALCULAR PORCENTAJE DE OFERTA
  const calcularPorcentajeOferta = () => {
    const venta = parseFloat(formData.precioVenta) || 0;
    const oferta = parseFloat(formData.precioOferta) || 0;
    
    if (venta > 0 && oferta > 0 && oferta < venta) {
      const ahorro = venta - oferta;
      const porcentaje = (ahorro / venta) * 100;
      return Math.round(porcentaje);
    }
    return 0;
  };

  const porcentajeOferta = calcularPorcentajeOferta();

  return (
    <form id="productoForm" onSubmit={handleSubmit} className="product-form">
      <div className="product-form-body">
        <div className="product-form-top-row">
          {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
          <div className="product-form-section info-section">
            <h3 className="product-form-section-title">Información General</h3>
              <div className="product-form-group">
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Nombre: <span className="required">*</span></label>
                    <input
                      autoFocus
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Ej: Gorra Yankees"
                      className={`form-input ${errors.nombre ? 'has-error' : ''}`}
                    />
                    {errors.nombre && <div className="field-error-text">{errors.nombre}</div>}
                  </div>

                  <div className="form-field">
                    <label className="form-label">Categoría: <span className="required">*</span></label>
                    <select
                      name="idCategoria"
                      value={formData.idCategoria || ""}
                      onChange={handleInputChange}
                      className={`form-select ${errors.idCategoria ? 'has-error' : ''}`}
                    >
                      <option value="">Seleccione categoría</option>
                      {categoriasRaw.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.idCategoria && <div className="field-error-text">{errors.idCategoria}</div>}
                  </div>
                </div>

                <div className="form-field full-width">
                  <label className="form-label">Descripción: <span className="required">*</span></label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Descripción obligatoria..."
                    className={`form-textarea ${errors.descripcion ? 'has-error' : ''}`}
                  />
                  {errors.descripcion && <div className="field-error-text">{errors.descripcion}</div>}
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: PRECIOS */}
            <div className="product-form-section prices-section">
              <h4 className="product-form-section-title">Precios</h4>
              <div className="product-form-grid prices">
                <div className="form-field">
                  <label className="form-label">Venta (Normal): <span className="required">*</span></label>
                  <input
                    type="text"
                    name="precioVenta"
                    value={formatCurrencyValue(formData.precioVenta)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      handleInputChange({ target: { name: 'precioVenta', value } });
                    }}
                    placeholder="0"
                    className={`form-input price-input ${errors.precioVenta ? 'has-error' : ''}`}
                  />
                  {errors.precioVenta && <div className="field-error-text">{errors.precioVenta}</div>}
                </div>

                <div className="form-field">
                  <label className="form-label">Precio Oferta: {formData.enOfertaVenta && <span className="required">*</span>}</label>
                  <div className="offer-input-wrapper">
                    <div className="price-with-discount">
                      <input
                        type="text"
                        name="precioOferta"
                        value={formatCurrencyValue(formData.precioOferta)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          handleInputChange({ target: { name: 'precioOferta', value } });
                        }}
                        placeholder="0"
                        disabled={!formData.enOfertaVenta}
                        className={`form-input price-input-offer ${!formData.enOfertaVenta ? 'disabled' : ''} ${errors.precioOferta ? 'has-error' : ''}`}
                      />
                      <div className="offer-toggle-wrapper">
                        <div className="offer-toggle">
                          <div className="switch-with-label">
                            <Switch
                              id="enOfertaVenta"
                              checked={formData.enOfertaVenta}
                              onChange={handleInputChange}
                            />
                            <label htmlFor="enOfertaVenta" className="offer-label">OFERTA</label>
                          </div>
                        </div>
                      </div>
                    </div>
                    {errors.precioOferta && <div className="field-error-text">{errors.precioOferta}</div>}
                  </div>
                </div>

                {formData.enOfertaVenta && porcentajeOferta > 0 && (
                  <div className="total-discount-message">
                    El descuento total es de {porcentajeOferta}%
                  </div>
                )}

                <div className="form-field">
                  <label className="form-label">+6 Unidades: <span className="required">*</span></label>
                  <input
                    type="text"
                    name="precioMayorista6"
                    value={formatCurrencyValue(formData.precioMayorista6)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      handleInputChange({ target: { name: 'precioMayorista6', value } });
                    }}
                    placeholder="0"
                    className={`form-input price-input ${errors.precioMayorista6 ? 'has-error' : ''}`}
                  />
                  {errors.precioMayorista6 && <div className="field-error-text">{errors.precioMayorista6}</div>}
                </div>

                <div className="form-field">
                  <label className="form-label">+80 Unidades: <span className="required">*</span></label>
                  <input
                    type="text"
                    name="precioMayorista80"
                    value={formatCurrencyValue(formData.precioMayorista80)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      handleInputChange({ target: { name: 'precioMayorista80', value } });
                    }}
                    placeholder="0"
                    className={`form-input price-input ${errors.precioMayorista80 ? 'has-error' : ''}`}
                  />
                  {errors.precioMayorista80 && <div className="field-error-text">{errors.precioMayorista80}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: DETALLE (Grid Row 2) */}
          <div className="product-form-bottom-row">
            <div className="product-form-section no-frame detailed">
              <div className="detailed-grid">
                {/* TALLAS */}
                <div className={`form-card tallas ${errors.tallas ? 'card-has-error' : ''}`}>
                  <div className="form-card-header">
                    <h3 className="form-card-title">Tallas y Stock <span className="required">*</span></h3>
                    <button type="button" onClick={agregarTalla} className="btn-add-circle">+ Agregar</button>
                  </div>
                  <div className="form-card-content">
                    {errors.tallas && <div className="card-error-msg">{errors.tallas}</div>}
                    {tallasStock.length === 0 ? (
                      <div className="no-items-placeholder">No hay tallas</div>
                    ) : (
                      <div className="form-card-list">
                        {tallasStock.map((item, index) => (
                          <div key={index} className="form-list-row talla-row">
                            <select
                              value={item?.talla || ''}
                              onChange={(e) => handleTallaChange(index, e.target.value)}
                              className="form-select-sm"
                            >
                              <option value="" disabled hidden>Talla</option>
                              {availableTallas.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <div className="quantity-controls">
                              <button type="button" onClick={() => decrementarCantidad(index)} className="btn-qty"><FaMinus size={8} /></button>
                              <input 
                                type="text"
                                value={item?.cantidad || 0}
                                onChange={(e) => handleCantidadChange(index, e.target.value)}
                                className="qty-input-manual"
                              />
                              <button type="button" onClick={() => incrementarCantidad(index)} className="btn-qty"><FaPlus size={8} /></button>
                            </div>
                            <button type="button" onClick={() => eliminarTalla(index)} className="btn-delete"><FaTrash size={12} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* COLORES */}
                <div className={`form-card colores ${errors.colores ? 'card-has-error' : ''}`}>
                  <div className="form-card-header">
                    <h3 className="form-card-title">Colores <span className="required">*</span></h3>
                    <button type="button" onClick={agregarColor} className="btn-add-circle">+ Agregar</button>
                  </div>
                  <div className="form-card-content">
                    {errors.colores && <div className="card-error-msg">{errors.colores}</div>}
                    {coloresProducto.length === 0 ? (
                      <div className="no-items-placeholder">No hay colores añadidos</div>
                    ) : (
                      <div className="form-card-list">
                        {coloresProducto.map((color, index) => (
                          <div key={index} className="form-list-row color-row">
                            <CustomColorSelect
                              value={color}
                              options={availableColores.length > 0 ? availableColores : COMMON_COLORS}
                              onChange={(value) => actualizarColor(index, value)}
                            />
                            <button type="button" onClick={() => eliminarColor(index)} className="btn-delete"><FaTrash size={12} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* IMÁGENES */}
                <div className={`form-card imagenes ${errors.imagenes ? 'card-has-error' : ''}`}>
                  <div className="form-card-header">
                    <h3 className="form-card-title">URLs de Imágenes <span className="required">*</span></h3>
                    <button type="button" onClick={agregarUrlImagen} className="btn-add-circle">+ Agregar</button>
                  </div>
                  <div className="form-card-content">
                    {errors.imagenes && <div className="card-error-msg">{errors.imagenes}</div>}
                    {urlsImagenes.length === 0 ? (
                      <div className="no-items-placeholder">Agrega URLs</div>
                    ) : (
                      <div className="form-card-list">
                        {urlsImagenes.map((url, index) => (
                          <div key={index} className="form-list-row image-row">
                            <input
                              type="url"
                              value={url}
                              onChange={(e) => actualizarUrlImagen(index, e.target.value)}
                              placeholder={`URL ${index + 1}`}
                              className={`form-input-sm ${errors[`url_${index}`] ? 'has-error' : ''}`}
                            />
                            <button type="button" onClick={() => eliminarUrlImagen(index)} className="btn-delete"><FaTrash size={12} /></button>
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
        {urlsImagenes.some(url => url.trim() !== '') && (
          <div className="external-previews-container">
            {urlsImagenes.filter(url => url.trim() !== '').map((url, i) => (
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
    </form>
  );
};

export default ProductoForm;
