import '../style/index.css';
import React, { useState } from 'react';
import { 
  FaArrowLeft, 
  FaArrowRight,
  FaUser, 
  FaExchangeAlt, 
  FaCamera, 
  FaTrash, 
  FaImage, 
  FaCheckCircle, 
  FaTimesCircle 
} from 'react-icons/fa';
import { EntityTable, Alert, SearchInput, CustomPagination, StatusPill, SearchSelect } from '../../../shared/services';
import { useDevolucionesLogic } from '../hooks/useDevolucionesLogic';
import StatusFilter from '../components/StatusFilter';

const DevolucionesPage = () => {
  const {
    modoVista,
    availableStatuses,
    clientes, productos,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    currentPage, setCurrentPage,
    itemsPerPage,
    alert, setAlert,
    errors,
    devolucionViendo, setDevolucionViendo,
    isRejecting, setIsRejecting,
    rejectionReason, setRejectionReason,
    formData, setFormData,
    loadingVentas,
    ventasCliente,
    productosVenta,
    productosMismoPrecio,
    showAlert,
    mostrarLista,
    mostrarFormulario,
    mostrarDetalle,
    handleImageUpload,
    handleSubmit,
    updateStatus,
    filtered
  } = useDevolucionesLogic();

  // Estados locales para acciones desde la tabla
  const [devParaAprobar, setDevParaAprobar] = React.useState(null);
  const [devParaRechazar, setDevParaRechazar] = React.useState(null);
  const [motivoRechazoTabla, setMotivoRechazoTabla] = React.useState('');

  const columns = [
    { header: 'N° de devolución', field: 'id', render: (item) => <span className="dev-id-text">{item.id}</span> },
    { header: 'Cliente', field: 'cliente', render: (item) => <span className="dev-client-text">{item.cliente}</span> },
    { header: 'Producto Original', field: 'productoOriginal', render: (item) => <span className="dev-product-text">{item.productoOriginal}</span> },
    { header: 'Valor', field: 'precio', render: (item) => <span className="dev-price-text">${item.precio.toLocaleString()}</span> },
    { header: 'Estado', field: 'estado', render: (item) => <StatusPill status={item.estado} /> }
  ];

  return (
    <>
      {alert.show && (
        <Alert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert({ show: false, message: '', type: 'success' })} 
        />
      )}
      
      <div className="devoluciones-container no-scrollbar">
        {/* HEADER */}
        <div className="devoluciones-header">
          <div className="devoluciones-header-top">
            <div className="devoluciones-header-left">
              {(modoVista === "formulario" || modoVista === "detalle") && (
                <button onClick={mostrarLista} className="devoluciones-btn-back">
                  <FaArrowLeft size={16} />
                </button>
              )}
              <div>
                <h1 className="devoluciones-title">
                  {modoVista === "lista" && "Devoluciones"}
                  {modoVista === "formulario" && "Registrar Devolución"}
                  {modoVista === "detalle" && "Detalle de Devolución"}
                </h1>
                <p className="devoluciones-subtitle">
                   {modoVista === "lista" && "Gestión de garantías y cambios de producto"}
                   {modoVista === "formulario" && "Ingrese los datos del producto y la evidencia necesaria"}
                   {modoVista === "detalle" && "Revisión de solicitud de devolución"}
                </p>
              </div>
            </div>

            {modoVista === "lista" && (
              <button onClick={mostrarFormulario} className="devoluciones-btn-register">
                Registrar Devolución
              </button>
            )}

            {modoVista === "formulario" && (
              <button 
                onClick={handleSubmit} 
                className="devoluciones-btn-submit"
                id="btn-save-devolucion"
              >
                Guardar Solicitud
              </button>
            )}
          </div>
        </div>

        {modoVista === "lista" && (
          <div className="devoluciones-search-bar">
            <div className="devoluciones-search-wrapper">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por cliente, ID o producto..."
                onClear={() => setSearchTerm('')}
                fullWidth={true}
              />
            </div>
            <StatusFilter filterStatus={filterStatus} onFilterSelect={setFilterStatus} statuses={availableStatuses} />
          </div>
        )}

        {/* CONTENIDO PRINCIPAL */}
        {modoVista === "lista" ? (
          <div className="devoluciones-main-content no-scrollbar">
            <div className="devoluciones-table-wrapper">
              <EntityTable
                entities={filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
                columns={columns}
                onView={mostrarDetalle}
                onApprove={(row) => setDevParaAprobar(row)}
                onReject={(row) => setDevParaRechazar(row)}
                moduleType="devoluciones"
                style={{ border: 'none' }}
                headerStyle={{
                  padding: '6px 4px', textAlign: 'left', fontWeight: '600',
                  fontSize: '11px', color: '#F5C81B', borderBottom: '1px solid #F5C81B',
                  backgroundColor: '#151822',
                }}
                rowStyle={{
                  padding: '4px 0', border: 'none', borderBottom: 'none',
                  backgroundColor: '#000'
                }}
              />
            </div>
            <CustomPagination
              currentPage={currentPage}
              totalPages={Math.ceil(filtered.length / itemsPerPage) || 1}
              onPageChange={setCurrentPage}
              totalItems={filtered.length}
              showingStart={filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              endIndex={Math.min(currentPage * itemsPerPage, filtered.length)}
              itemsName="devoluciones"
            />
          </div>
        ) : modoVista === "formulario" ? (
          /* MODO REGISTRO: NUEVA ESTRUCTURA PREMIUM */
          <div className="devoluciones-premium-registration-grid no-scrollbar">
            {/* COLUMNA IZQUIERDA: DATOS Y PRODUCTOS */}
            <div className="devoluciones-registration-column">
              {/* CARD 1: DATOS GENERALES */}
              <div className="devoluciones-registration-card">
                <h3 className="devoluciones-card-title">
                  <FaUser className="card-icon" /> DATOS GENERALES
                </h3>
                <div className="dev-card-body">
                  <div className="dev-form-row">
                    <div className="dev-form-group client">
                      <label className="dev-field-label">CLIENTE <span className="required">*</span></label>
                      <SearchSelect
                        options={clientes}
                        selectedItem={clientes.find(c => String(c.id) === String(formData.idCliente))}
                        onSelect={(client) => {
                          const cid = client?.id || client?.IdCliente || '';
                          setFormData({ 
                            ...formData, 
                            idCliente: cid,
                            cliente: client?.Nombre || client?.nombreCompleto || '',
                            productoOriginalId: '', // Reset products when client changes
                            idVenta: '',
                            productoCambioId: ''
                          });
                        }}
                        placeholder="Buscar por nombre, documento o correo..."
                        error={errors.cliente}
                        filterFn={(c, term) => {
                          const t = term.toLowerCase();
                          return (
                            (c.nombreCompleto || c.Nombre || '').toLowerCase().includes(t) ||
                            (c.numeroDocumento || c.Documento || c.numDocumento || '').toLowerCase().includes(t) ||
                            (c.email || c.Email || '').toLowerCase().includes(t)
                          );
                        }}
                        renderOption={(c) => (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>{c.nombreCompleto || c.Nombre}</span>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#94a3b8' }}>
                              <span>Doc: {c.numeroDocumento || c.Documento || 'N/A'}</span>
                              <span>•</span>
                              <span>{c.email || c.Email || 'Sin Correo'}</span>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                    <div className="dev-form-group sale">
                      <label className="dev-field-label">VENTA RELACIONADA <span className="required">*</span></label>
                      <SearchSelect
                        options={ventasCliente}
                        selectedItem={ventasCliente.find(v => String(v.id || v.IdVenta) === String(formData.idVenta))}
                        onSelect={(sale) => {
                          setFormData({ 
                            ...formData, 
                            idVenta: sale?.id || sale?.IdVenta || '',
                            productoOriginalId: '', // Reset if sale changes
                            productoCambioId: ''
                          });
                        }}
                        placeholder={!formData.idCliente ? "Primero..." : (loadingVentas ? "Cargando..." : "Venta/Recibo...")}
                        disabled={!formData.idCliente || loadingVentas}
                        error={errors.idVenta}
                        renderOption={(v) => (
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontWeight: 700, color: '#F5C81B', fontSize: '13px' }}>ORDEN #{v.id || v.IdVenta}</span>
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                Fecha: {v.fecha || v.Fecha || v.FechaVenta || 'N/A'}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                                ${parseFloat(v.total || v.Total || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                        filterFn={(v, term) => String(v.id || v.IdVenta).includes(term)}
                      />
                    </div>
                  </div>

                  <div className="dev-form-group">
                    <label className="dev-field-label">MOTIVO DE DEVOLUCIÓN <span className="required">*</span></label>
                    <textarea
                      value={formData.motivo}
                      onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                      placeholder="Describa el motivo detallado..."
                      className={`dev-field-textarea ${errors.motivo ? 'has-error' : ''}`}
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: PRODUCTOS */}
              <div className="devoluciones-registration-card">
                <div className="devoluciones-card-header">
                  <h3 className="devoluciones-card-title" style={{ margin: 0 }}>
                    <FaExchangeAlt className="card-icon" /> PRODUCTOS EN PROCESO
                  </h3>
                  <label className="dev-checkbox-container">
                    <span>MISMO MODELO</span>
                    <input
                      type="checkbox"
                      checked={formData.mismoModelo}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          mismoModelo: e.target.checked,
                          productoCambioId: '' 
                        });
                      }}
                    />
                    <span className="dev-checkmark"></span>
                  </label>
                </div>
                
                <div className="dev-card-body products">
                  <div className="dev-form-row products">
                    <div className="dev-form-group product-main">
                      <label className="dev-field-label return">PRODUCTO A DEVOLVER <span className="required">*</span></label>
                      <SearchSelect
                        options={productosVenta}
                        selectedItem={productosVenta.find(p => String(p._tempId || p.id) === String(formData.productoOriginalId))}
                        onSelect={(prod) => {
                          setFormData({ 
                            ...formData, 
                            productoOriginalId: prod?._tempId || prod?.id || '',
                            idVenta: prod?.idVenta || formData.idVenta, 
                            productoCambioId: '' 
                          });
                        }}
                        placeholder={!formData.idCliente ? "Primero..." : (loadingVentas ? "Cargando..." : "Buscar producto...")}
                        disabled={!formData.idCliente || loadingVentas}
                        error={errors.prodOrig}
                        filterFn={(p, term) => {
                          const t = term.toLowerCase();
                          return (p.nombre || p.Nombre || '').toLowerCase().includes(t);
                        }}
                        renderOption={(p) => {
                          const imgPath = (p.imagenes && p.imagenes[0]) || (p.Imagenes && p.Imagenes[0]) || null;
                          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                          const imgSrc = imgPath 
                            ? (imgPath.startsWith('http') ? imgPath : `${baseUrl}${imgPath}`) 
                            : '/placeholder.png';
                          
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '38px', height: '38px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden' }}>
                                <img 
                                  src={imgSrc} 
                                  alt="" 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => { e.target.src = '/placeholder.png'; }}
                                />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>{p.nombre || p.Nombre}</span>
                                <span style={{ fontSize: '11px', color: '#10B981' }}>
                                  ${parseFloat(p.precio || 0).toLocaleString()} • Talla: {p.tallaComprada || 'N/A'}
                                </span>
                              </div>
                            </div>
                          );
                        }}
                      />
                    </div>

                    {!formData.mismoModelo ? (
                      <>
                        <div className="dev-product-separator horizontal">
                          <FaExchangeAlt />
                        </div>
                        <div className="dev-form-group product-main">
                          <label className="dev-field-label replace">PRODUCTO DE REEMPLAZO <span className="required">*</span></label>
                          <SearchSelect
                            options={productosMismoPrecio}
                            selectedItem={productosMismoPrecio.find(p => String(p.id || p.IdProducto) === String(formData.productoCambioId))}
                            onSelect={(prod) => {
                              setFormData({ ...formData, productoCambioId: prod?.id || prod?.IdProducto || '' });
                            }}
                            placeholder={!formData.productoOriginalId ? "Primero..." : "Buscar..."}
                            disabled={!formData.productoOriginalId}
                            error={errors.prodCambio || errors.price_mismatch}
                            filterFn={(p, term) => {
                              const t = term.toLowerCase();
                              return (p.nombre || p.Nombre || '').toLowerCase().includes(t);
                            }}
                            renderOption={(p) => {
                              const imgPath = (p.imagenes && p.imagenes[0]) || (p.Imagenes && p.Imagenes[0]) || null;
                              const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                              const imgSrc = imgPath 
                                ? (imgPath.startsWith('http') ? imgPath : `${baseUrl}${imgPath}`) 
                                : '/placeholder.png';
                              
                              return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '38px', height: '38px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden' }}>
                                    <img 
                                      src={imgSrc} 
                                      alt="" 
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      onError={(e) => { e.target.src = '/placeholder.png'; }}
                                    />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>{p.nombre || p.Nombre}</span>
                                    <span style={{ fontSize: '11px', color: '#F5C81B' }}>
                                      ${(parseFloat(p.precio || p.Precio || p.precioVenta || 0)).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              );
                            }}
                          />
                          {errors.price_mismatch && (
                            <p className="dev-price-error">⚠ Precios desiguales</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="dev-mismo-modelo-info standalone">
                        <FaCheckCircle className="info-icon" />
                        <p>Mismo producto.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: EVIDENCIA */}
            <div className="devoluciones-registration-column">
              <div className="devoluciones-registration-card full-height">
                <h3 className="devoluciones-card-title">
                  <FaCamera className="card-icon" /> EVIDENCIA FOTOGRÁFICA <span className="required">*</span>
                </h3>
                
                <div className={`dev-evidence-dropzone ${errors.evidencia ? 'has-error' : ''}`}>
                  <div className="dev-evidence-content">
                    {(formData.evidencia || formData.evidencia2) && (
                      <div className="dev-evidence-viewer">
                        {formData.viewingEvidencia === 1 ? (
                          formData.evidencia ? (
                            <div className="dev-preview-wrapper">
                              <img src={formData.evidencia} alt="Evidencia 1" />
                              <button onClick={() => setFormData({ ...formData, evidencia: null })} className="dev-btn-delete">
                                <FaTrash />
                              </button>
                            </div>
                          ) : (
                            <div className="dev-empty-preview" onClick={() => document.getElementById('file-1').click()}>
                              <FaImage className="empty-icon" />
                              <p>Vista Frontal del Producto</p>
                              <span className="dev-upload-link">SUBIR IMAGEN</span>
                            </div>
                          )
                        ) : (
                          formData.evidencia2 ? (
                            <div className="dev-preview-wrapper">
                              <img src={formData.evidencia2} alt="Evidencia 2" />
                              <button onClick={() => setFormData({ ...formData, evidencia2: null })} className="dev-btn-delete">
                                <FaTrash />
                              </button>
                            </div>
                          ) : (
                            <div className="dev-empty-preview" onClick={() => document.getElementById('file-2').click()}>
                              <FaImage className="empty-icon" />
                              <p>Vista Posterior o Extra</p>
                              <span className="dev-upload-link">SUBIR IMAGEN</span>
                            </div>
                          )
                        )}
                        
                        <div className="dev-viewer-controls">
                          <button 
                            className={`dev-dot ${formData.viewingEvidencia === 1 ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, viewingEvidencia: 1 })}
                          />
                          <button 
                            className={`dev-dot ${formData.viewingEvidencia === 2 ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, viewingEvidencia: 2 })}
                          />
                        </div>
                      </div>
                    )}

                    {!formData.evidencia && !formData.evidencia2 && (
                      <div className="dev-drag-drop-area">
                        <FaImage className="drag-icon" />
                        <p className="drag-text">Arrastra una imagen o selecciona un archivo</p>
                        <label className="dev-btn-upload-premium">
                          SUBIR IMAGEN
                          <input 
                            id="file-1"
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, 1)} 
                            style={{ display: 'none' }} 
                          />
                        </label>
                        <input 
                          id="file-2"
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload(e, 2)} 
                          style={{ display: 'none' }} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MODO VISTA: DETALLE (AESTHETIC UPGRADE) */
          <div className="devoluciones-premium-registration-grid no-scrollbar">
            {/* COLUMNA IZQUIERDA: DATOS Y PRODUCTOS */}
            <div className="devoluciones-registration-column">
              {/* CARD 1: DATOS GENERALES */}
              <div className="devoluciones-registration-card">
                <h3 className="devoluciones-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaUser className="card-icon" /> DATOS GENERALES DE LA SOLICITUD
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                    FECHA: {devolucionViendo?.fecha}
                  </span>
                </h3>
                <div className="dev-card-body">
                  <div className="dev-form-row">
                    <div className="dev-form-group client" style={{ flex: 1 }}>
                      <label className="dev-field-label">CLIENTE</label>
                      <div className="form-field-display">{devolucionViendo?.cliente}</div>
                    </div>
                    <div className="dev-form-group sale" style={{ flex: 1 }}>
                      <label className="dev-field-label">VENTA / RECIBO</label>
                      <div className="form-field-display id">ORDEN #{devolucionViendo?.idVenta || devolucionViendo?.id || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="dev-form-group">
                    <label className="dev-field-label">MOTIVO DE DEVOLUCIÓN</label>
                    <div className="dev-field-textarea readonly">
                      {devolucionViendo?.motivo || 'Sin motivo especificado.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: PRODUCTOS */}
              <div className="devoluciones-registration-card">
                <div className="devoluciones-card-header">
                  <h3 className="devoluciones-card-title" style={{ margin: 0 }}>
                    <FaExchangeAlt className="card-icon" /> {devolucionViendo?.isLot ? "PRODUCTOS EN EL PEDIDO" : "FLUJO DE MERCANCÍA"}
                  </h3>
                  {devolucionViendo?.mismoModelo && (
                    <div className="mismo-modelo-badge">MISMO MODELO</div>
                  )}
                </div>
                
                <div className="dev-card-body products">
                  {devolucionViendo?.isLot ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {devolucionViendo.items.map((it, idx) => (
                        <div key={idx} className="form-field-display product-readonly" style={{ marginBottom: '5px' }}>
                           <span className="product-name">{it.productoOriginal}</span>
                           <span className="product-price">${parseFloat(it.precio || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="dev-form-row products">
                      <div className="dev-form-group product-main">
                        <label className="dev-field-label return">PRODUCTO A DEVOLVER (SALIENTE)</label>
                        <div className="form-field-display product-readonly">
                           <span className="product-name">{devolucionViendo?.productoOriginal}</span>
                           <span className="product-price">${devolucionViendo?.precio?.toLocaleString()}</span>
                        </div>
                      </div>

                      {!devolucionViendo?.mismoModelo && devolucionViendo?.productoCambio ? (
                        <>
                          <div className="dev-product-separator horizontal">
                            <FaExchangeAlt />
                          </div>
                          <div className="dev-form-group product-main">
                            <label className="dev-field-label replace">PRODUCTO DE REEMPLAZO (ENTRANTE)</label>
                            <div className="form-field-display product-readonly replace">
                               <span className="product-name">{devolucionViendo?.productoCambio}</span>
                               <span className="product-price">${devolucionViendo?.precio?.toLocaleString()}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        devolucionViendo?.mismoModelo && (
                          <div className="dev-mismo-modelo-info standalone">
                            <FaCheckCircle className="info-icon" />
                            <p>Mismo modelo.</p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {devolucionViendo?.estado?.toLowerCase().includes('rechaz') && (
                <div className="dev-rejection-reason-box">
                  <div className="rejection-title">
                    <FaTimesCircle size={14} /> MOTIVO DEL RECHAZO
                  </div>
                  <div className="rejection-content">
                    {devolucionViendo?.motivoRechazo || 'No se especificó un motivo.'}
                  </div>
                </div>
              )}

              {/* ACCIONES REMOVIDAS: AHORA ESTÁN EN LA TABLA */}
            </div>

            {/* COLUMNA DERECHA: EVIDENCIA RECIBIDA */}
            <div className="devoluciones-registration-column">
              <div className="devoluciones-registration-card full-height">
                <h3 className="devoluciones-card-title">
                  <FaCamera className="card-icon" /> EVIDENCIA RECIBIDA
                </h3>
                
                <div className="dev-evidence-dropzone detail-mode">
                  <div className="dev-evidence-content">
                    <div className="dev-evidence-viewer">
                      <div className="dev-preview-wrapper detail-view">
                        <img 
                          src={(devolucionViendo?.viewingEvidencia === 2 ? devolucionViendo?.evidencia2 : devolucionViendo?.evidencia) || devolucionViendo?.evidencia} 
                          alt="Evidencia" 
                        />
                      </div>
                      
                      {devolucionViendo?.evidencia2 && (
                        <div className="dev-viewer-controls">
                          <button 
                            className={`dev-dot ${devolucionViendo?.viewingEvidencia === 1 ? 'active' : ''}`}
                            onClick={() => setDevolucionViendo({ ...devolucionViendo, viewingEvidencia: 1 })}
                          />
                          <button 
                            className={`dev-dot ${devolucionViendo?.viewingEvidencia === 2 ? 'active' : ''}`}
                            onClick={() => setDevolucionViendo({ ...devolucionViendo, viewingEvidencia: 2 })}
                          />
                        </div>
                      )}

                      <div className="dev-viewer-label">
                        {devolucionViendo?.evidencia2 ? `Vista ${devolucionViendo?.viewingEvidencia} de 2` : 'Vista única'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dev-detail-info-footer">
                   <p>Esta información es de solo lectura y representa el estado actual de la solicitud en el sistema.</p>
                </div>
              </div>
            </div>
          </div>
        )
      }
      </div>

      {/* MODAL DE CONFIRMACIÓN: APROBAR */}
      {devParaAprobar && (
        <div className="anular-modal-backdrop" onClick={() => setDevParaAprobar(null)}>
          <div className="anular-modal-container" onClick={e => e.stopPropagation()}>
            <h3 className="anular-modal-title">Confirmar Aprobación</h3>
            <div className="anular-modal-message-container">
              <p className="anular-modal-message">
                ¿Estás seguro de que deseas <span style={{color: '#F5C81B', fontWeight: 800}}>APROBAR</span> la devolución para <span className="anular-modal-highlight">{devParaAprobar.cliente}</span>?
              </p>
            </div>
            <div className="anular-modal-actions">
              <button className="anular-modal-btn anular-modal-btn-cancel" onClick={() => setDevParaAprobar(null)}>CANCELAR</button>
              <button 
                className="anular-modal-btn anular-modal-btn-confirm" 
                onClick={() => {
                  const status = availableStatuses.find(s => {
                    const str = String(s).toLowerCase();
                    return str.includes('aprob') || str.includes('complet');
                  }) || 'Completada';
                  updateStatus(devParaAprobar, status);
                  setDevParaAprobar(null);
                }}
              >
                APROBAR AHORA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RECHAZO: MOTIVO OBLIGATORIO */}
      {devParaRechazar && (
        <div className="anular-modal-backdrop" onClick={() => { setDevParaRechazar(null); setMotivoRechazoTabla(''); }}>
          <div className="anular-modal-container" style={{ maxWidth: '550px' }} onClick={e => e.stopPropagation()}>
            <h3 className="anular-modal-title">Rechazar Solicitud</h3>
            <div className="anular-modal-message-container">
              <p className="anular-modal-message">
                Indique el motivo del rechazo para la solicitud de <span className="anular-modal-highlight">{devParaRechazar.cliente}</span>:
              </p>
              <textarea 
                className="dev-field-textarea" 
                style={{ width: '100%', marginTop: '15px', height: '100px', backgroundColor: '#000', border: '1px solid #F5C81B4B' }}
                placeholder="Escriba aquí el motivo detallado (Obligatorio)..."
                value={motivoRechazoTabla}
                onChange={(e) => setMotivoRechazoTabla(e.target.value)}
                autoFocus
              />
            </div>
            <div className="anular-modal-actions">
              <button 
                className="anular-modal-btn anular-modal-btn-cancel" 
                onClick={() => { setDevParaRechazar(null); setMotivoRechazoTabla(''); }}
              >
                CANCELAR
              </button>
              <button 
                className="anular-modal-btn anular-modal-btn-confirm" 
                style={{ opacity: !motivoRechazoTabla.trim() ? 0.5 : 1 }}
                disabled={!motivoRechazoTabla.trim()}
                onClick={() => {
                  const status = availableStatuses.find(s => String(s).toLowerCase().includes('rechaz')) || 'Rechazada';
                  updateStatus(devParaRechazar, status, motivoRechazoTabla);
                  setDevParaRechazar(null);
                  setMotivoRechazoTabla('');
                }}
              >
                RECHAZAR SOLICITUD
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DevolucionesPage;
