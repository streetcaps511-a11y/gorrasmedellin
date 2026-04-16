import '../style/index.css';
import React, { useState, useEffect } from 'react';
import { 
  FaArrowLeft, 
  FaPlus, 
  FaTrash, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaTimes,
  FaImage, 
  FaUser, 
  FaBoxOpen,
  FaCamera,
  FaDollarSign,
  FaExclamationTriangle
} from "react-icons/fa";

// ===== COMPONENTES COMPARTIDOS =====
import { Alert, EntityTable, SearchInput, UniversalModal, AnularOperacionModal, DateInputWithCalendar, StatusPill, SearchSelect } from '../../../shared/services';
import CustomPagination from '../../../shared/components/admin/CustomPagination';

import StatusFilter from '../components/StatusFilter';
import ProductoForm from '../components/ProductoForm';


// ===== HOOKS & SERVICIOS =====
import { useVentasLogic } from '../hooks/useVentasLogic';
import * as productosService from '../../Productos/services/productosApi';
import * as clientesService from '../../ClientesPage/services/clientesApi';

// Se eliminan PAYMENT_METHODS y SIZES quemados

const columns = [
  { 
    header: 'No. Venta', 
    field: 'id', 
    render: (item) => <span className="sale-id-text">{item.id}</span> 
  },
  { 
    header: 'Cliente', 
    field: 'cliente', 
    render: (item) => <span className="client-name-text">{typeof item.cliente === 'object' ? item.cliente?.nombre : item.cliente}</span> 
  },
  { 
    header: 'Fecha', 
    field: 'fecha', 
    render: (item) => <span className="sale-date-text">{item.fecha}</span> 
  },
  { 
    header: 'Total', 
    field: 'total', 
    render: (item) => <span className="sale-total-text">${Number(item.total).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> 
  },
  { 
    header: 'Tipo', 
    field: 'tipoEntrega', 
    render: (item) => (
      <span className={`delivery-type-pill ${item.tipoEntrega}`}>
        {item.tipoEntrega === 'recoger' ? '🏪 Local' : '🚚 Envío'}
      </span>
    ) 
  },
  { 
    header: 'Dirección', 
    field: 'direccionEnvio', 
    render: (item) => <span className="address-text-table" title={item.direccionEnvio}>{item.direccionEnvio || 'N/A'}</span> 
  },
  { 
    header: 'Estado', 
    field: 'estado', 
    render: (item) => <StatusPill status={item.estado} /> 
  }
];

const VentasPage = () => {
  const {
    ventas,
    availableStatuses,
    availablePaymentMethods,
    availableSizes,
    availableCustomers,
    availableProducts,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    currentPage, setCurrentPage,
    loading,
    alert, setAlert,
    modoVista,
    ventaViendo,
    anularModal, setAnularModal,
    approveModal, setApproveModal,
    rejectModal, setRejectModal,
    partialPaymentModal, setPartialPaymentModal,
    isRejecting, setIsRejecting,
    rejectionReason, setRejectionReason,
    errors,
    nuevaVenta,
    filtered,
    paginatedVentas,
    totalPages,
    mostrarLista,
    mostrarFormulario,
    mostrarDetalle,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    calcularTotal,
    calcularTotalViendo,
    handleImageUpload,
    handleImage2Upload,
    handleCreateVenta,
    updateVentaStatus,
    handlePartialPayment,
    handleAnularVenta,
    requiresReceipt
  } = useVentasLogic();
  
  // local state for image expansion
  const [imgModal, setImgModal] = useState({ open: false, src: '' });
  const openImage = (src) => setImgModal({ open: true, src });

  return (
    <div className="ventas-page-wrapper">
      {alert.show && (
        <Alert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert(prev => ({ ...prev, show: false }))} 
        />
      )}

      <AnularOperacionModal 
        isOpen={anularModal.isOpen} 
        onClose={() => setAnularModal({ isOpen: false, venta: null })} 
        onConfirm={handleAnularVenta} 
        operationType="venta" 
        operationData={anularModal.venta}
        loading={loading}
      />

      <AnularOperacionModal 
        isOpen={approveModal.isOpen} 
        onClose={() => setApproveModal({ isOpen: false, venta: null })}
        onConfirm={() => updateVentaStatus(availableStatuses[1])}
        title="Confirmar Aprobación"
        operationType="venta"
        operationData={approveModal.venta}
        confirmButtonText="Aprobar"
        cancelButtonText="Cancelar"
        loading={loading}
      />

      <UniversalModal 
        isOpen={partialPaymentModal.isOpen} 
        onClose={() => setPartialPaymentModal({ isOpen: false, venta: null, montoRecibido: '', montoNuevo: '', evidencia2: null })}
        title="Informar Pago Incompleto"
        width="450px"
        loading={loading}
      >
        <div style={{ padding: '20px' }}>
          <p style={{ color: '#fff', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>
            La venta <strong>#{partialPaymentModal.venta?.id}</strong> es por un total de <strong>${Number(partialPaymentModal.venta?.total || 0).toLocaleString('es-CO')}</strong>.
            <br/>Ingrese cuánto dinero recibió realmente en el comprobante.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', color: '#f59e0b', fontSize: '11px', fontWeight: 'bold', marginBottom: '5px' }}>1RA CONSIGNACIÓN <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                type="number"
                step="0.01"
                value={partialPaymentModal.montoRecibido}
                onChange={(e) => setPartialPaymentModal(prev => ({ ...prev, montoRecibido: e.target.value }))}
                placeholder="Ej: 400.000,50"
                disabled={loading}
                style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#f59e0b', fontSize: '11px', fontWeight: 'bold', marginBottom: '5px' }}>2DA CONSIGNACIÓN</label>
              <input 
                type="number"
                step="0.01"
                value={partialPaymentModal.montoNuevo}
                onChange={(e) => setPartialPaymentModal(prev => ({ ...prev, montoNuevo: e.target.value }))}
                placeholder="Ej: 20.000,00"
                disabled={loading}
                style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px dashed #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Recibido:</span>
                <span style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>
                    ${(Number(partialPaymentModal.montoRecibido || 0) + Number(partialPaymentModal.montoNuevo || 0)).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Saldo Restante:</span>
                <span style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    color: (Number(partialPaymentModal.venta?.total || 0) - (Number(partialPaymentModal.montoRecibido || 0) + Number(partialPaymentModal.montoNuevo || 0))) <= 0 ? '#10b981' : '#ef4444' 
                }}>
                    ${Math.max(0, (Number(partialPaymentModal.venta?.total || 0) - (Number(partialPaymentModal.montoRecibido || 0) + Number(partialPaymentModal.montoNuevo || 0)))).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#f59e0b', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>SEGUNDO COMPROBANTE (OPCIONAL)</label>
            <div className="evidence-dropzone mini">
                {partialPaymentModal.evidencia2 ? (
                    <div style={{ position: 'relative' }}>
                        <img src={partialPaymentModal.evidencia2} alt="Comprobante 2" style={{ width: '100%', borderRadius: '8px', maxHeight: '100px', objectFit: 'cover' }} />
                        <button onClick={() => setPartialPaymentModal(p => ({ ...p, evidencia2: null }))} className="btn-remove-evidence mini"><FaTrash size={10} /></button>
                    </div>
                ) : (
                    <label className="btn-select-evidence mini">
                        SUBIR SEGUNDO PAGO
                        <input type="file" accept="image/*" onChange={handleImage2Upload} className="display-none" />
                    </label>
                )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={() => setPartialPaymentModal({ isOpen: false, venta: null, montoRecibido: '', evidencia2: null })}
              disabled={loading}
              className="view-btn-sec"
              style={{ padding: '10px 20px', borderRadius: '8px' }}
            >
              Cancelar
            </button>
            <button 
              onClick={() => handlePartialPayment(partialPaymentModal.montoRecibido, partialPaymentModal.montoNuevo)}
              disabled={loading || (Number(partialPaymentModal.montoRecibido || 0) + Number(partialPaymentModal.montoNuevo || 0) < Number(partialPaymentModal.venta?.total || 0))}
              className="ventas-btn-submit"
              style={{ 
                margin: 0, 
                padding: '10px 20px', 
                background: (Number(partialPaymentModal.montoRecibido || 0) + Number(partialPaymentModal.montoNuevo || 0) < Number(partialPaymentModal.venta?.total || 0)) ? '#334155' : '#10b981',
                cursor: (Number(partialPaymentModal.montoRecibido || 0) + Number(partialPaymentModal.montoNuevo || 0) < Number(partialPaymentModal.venta?.total || 0)) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Procesando...' : 'Completar Venta ✅'}
            </button>
          </div>
        </div>
      </UniversalModal>

      <UniversalModal 
        isOpen={rejectModal.isOpen} 
        onClose={() => { setRejectModal({ isOpen: false, venta: null }); setRejectionReason(''); }}
        title="Rechazar Venta"
        width="450px"
        loading={loading}
      >
        <div style={{ padding: '20px' }}>
          <p style={{ color: '#fff', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>
            ¿Desea rechazar la venta <strong>#{rejectModal.venta?.id}</strong>? Por favor, ingrese el motivo.
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#FFC107', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>MOTIVO DE RECHAZO <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ej: Comprobante de pago inválido, producto sin stock..."
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', minHeight: '100px', outline: 'none', fontSize: '13px', opacity: loading ? 0.6 : 1 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={() => { setRejectModal({ isOpen: false, venta: null }); setRejectionReason(''); }}
              disabled={loading}
              style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #444', color: '#ccc', borderRadius: '8px', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                if (!rejectionReason.trim()) {
                  setAlert({ show: true, message: "El motivo de rechazo es obligatorio", type: "error" });
                  return;
                }
                updateVentaStatus(availableStatuses[2], rejectionReason);
              }}
              disabled={loading}
              style={{ padding: '10px 20px', background: '#ef4444', border: 'none', color: '#fff', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Rechazando...' : 'Rechazar'}
            </button>
          </div>
        </div>
      </UniversalModal>

      {/* Visualador de Comprobante Premium */}
      {imgModal.open && (
        <div className="gm-zoom-overlay-admin" onClick={() => setImgModal({ open: false, src: '' })}>
          <div className="gm-zoom-container-admin" onClick={e => e.stopPropagation()}>
            <button className="gm-zoom-close-admin" onClick={() => setImgModal({ open: false, src: '' })}>
              <FaTimes size={24} />
            </button>
            <img src={imgModal.src} className="gm-zoom-img-admin" alt="zoom" />
          </div>
        </div>
      )}

      <div className="ventas-container">
        {/* HEADER */}
        <div className="ventas-header">
          <div className="ventas-header-top">
            <div className="header-title-block">
              {(modoVista === "formulario" || modoVista === "detalle") && (
                <button onClick={mostrarLista} className="view-btn-back">
                  <FaArrowLeft size={16} />
                </button>
              )}
              <div>
                <h1 className="ventas-title">
                  {modoVista === "lista" && "Ventas"}
                  {modoVista === "formulario" && "Registrar Venta"}
                  {modoVista === "detalle" && "Detalles Venta"}
                </h1>
                <p className="ventas-subtitle">
                   {modoVista === "lista" && "Gestión de ventas y compras de clientes"}
                   {modoVista === "formulario" && "Ingrese los datos de la venta y suba el comprobante de pago"}
                   {modoVista === "detalle" && "Revisión de venta y comprobante de pago"}
                </p>
              </div>
            </div>

            {modoVista === "lista" && (
              <button onClick={mostrarFormulario} className="ventas-btn-add">
                Registrar Venta
              </button>
            )}

            {modoVista === "formulario" && (
              <button 
                onClick={handleCreateVenta} 
                className="ventas-btn-submit" 
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Guardar Venta'}
              </button>
            )}
          </div>

          {modoVista === "lista" && (
            <div className="ventas-controls">
            <div className="search-control-container">
                <SearchInput
                  value={searchTerm} 
                  onChange={setSearchTerm} 
                  placeholder="Buscar por cliente o número de venta..."
                  onClear={() => setSearchTerm('')} 
                  fullWidth={true}
                />
              </div>
              <StatusFilter 
                filterStatus={filterStatus} 
                statuses={availableStatuses}
                onFilterSelect={(s) => {
                  setFilterStatus(s);
                  setCurrentPage(1);
                }} 
              />
            </div>
          )}
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {modoVista === "lista" ? (
          <div className="ventas-table-container">
            <div className="ventas-table-wrapper yellow-scrollbar">
              <EntityTable 
                entities={paginatedVentas} 
                columns={columns} 
                onView={mostrarDetalle} 
                onAnular={v => setAnularModal({ isOpen: true, venta: v })} 
                onApprove={v => setApproveModal({ isOpen: true, venta: v })} 
                onReject={v => setRejectModal({ isOpen: true, venta: v })}
                onPartialPago={(v) => {
                  setPartialPaymentModal({ 
                    isOpen: true, 
                    venta: v, 
                    montoRecibido: v.montoPagado || '', 
                    montoNuevo: '', 
                    evidencia2: v.evidencia2 || null 
                  });
                }}
                showAnularButton={true} 
                moduleType="ventas" 
              />
            </div>
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filtered.length}
              showingStart={filtered.length > 0 ? ((currentPage - 1) * 7) + 1 : 0}
              endIndex={Math.min(currentPage * 7, filtered.length)}
              itemsName="ventas"
            />
          </div>
        ) : modoVista === "formulario" ? (
          <div className="ventas-form-wrapper yellow-scrollbar">
            {/* PRIMERA FILA: DATOS Y COMPROBANTE */}
            <div className="sales-top-row">
              {/* CARD 1: DATOS DE VENTA */}
              <div className="venta-form-card">
                <div className="section-title"><FaUser size={14} /> DATOS DE VENTA</div>
                <div className="form-data-grid">
                  <div className="form-field-group full-width" style={{ marginBottom: '8px' }}>
                    <label className="form-label">CLIENTE <span className="required">*</span></label>
                    <SearchSelect 
                      options={availableCustomers}
                      selectedItem={availableCustomers.find(c => String(c.id) === String(nuevaVenta.idCliente))}
                      onSelect={(client) => {
                        const id = client?.id || '';
                        actualizarProducto(-1, 'idCliente', id);
                        if (client?.direccion) {
                          actualizarProducto(-1, 'direccionEnvio', client.direccion);
                        }
                      }}
                      placeholder="Buscar por nombre, documento o correo..."
                      error={errors.idCliente}
                      filterFn={(c, term) => {
                        const t = term.toLowerCase();
                        return (
                          (c.nombre || '').toLowerCase().includes(t) ||
                          (c.num_documento || '').toLowerCase().includes(t) ||
                          (c.correo || '').toLowerCase().includes(t)
                        );
                      }}
                      renderOption={(c) => (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{c.nombre || 'Sin nombre'}</span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Doc: {c.num_documento || 'N/A'} • {c.correo || 'S/C'}
                          </span>
                        </div>
                      )}
                    />
                  </div>

                  <div className="form-field-group">
                    <label className="form-label">MÉTODO DE PAGO <span className="required">*</span></label>
                    <select 
                      value={nuevaVenta.metodoPago || ''} 
                      onChange={(e) => actualizarProducto(-1, 'metodoPago', e.target.value)}
                      className={`form-input-main ${errors.metodoPago ? 'has-error' : ''}`}
                    >
                      <option value="" disabled hidden>Seleccionar...</option>
                      {['Efectivo', 'Bancolombia', 'Nequi', 'Bold'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label className="form-label">MÉTODO DE ENTREGA <span className="required">*</span></label>
                    <select 
                      value={nuevaVenta.tipoEntrega || ''} 
                      onChange={(e) => actualizarProducto(-1, 'tipoEntrega', e.target.value)}
                      className={`form-input-main ${errors.tipoEntrega ? 'has-error' : ''}`}
                    >
                      <option value="" disabled hidden>Seleccionar...</option>
                      <option value="envio">🚚 Envío a domicilio</option>
                      <option value="recoger">🏪 Recoger en local</option>
                    </select>
                  </div>

                  <div className={`form-field-group ${(nuevaVenta.tipoEntrega === 'recoger') ? 'full-width' : ''}`}>
                    <label className="form-label">FECHA <span className="required">*</span></label>
                    <DateInputWithCalendar 
                      value={nuevaVenta.fecha} 
                      onChange={(d) => actualizarProducto(-1, 'fecha', d)} 
                      className={`ventas-date-input ${errors.fecha ? 'has-error' : ''}`}
                    />
                  </div>
                  
                  {nuevaVenta.tipoEntrega === 'envio' && (
                    <div className="form-field-group">
                      <label className="form-label">DIRECCIÓN DE ENVÍO <span className="required">*</span></label>
                      <input 
                        type="text" 
                        value={nuevaVenta.direccionEnvio || ''} 
                        onChange={(e) => actualizarProducto(-1, 'direccionEnvio', e.target.value)}
                        placeholder="Calle 123 # 45-67..." 
                        className={`form-input-main ${errors.direccionEnvio ? 'has-error' : ''}`}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2: COMPROBANTE DE PAGO */}
              <div className="venta-form-card">
                <div className="section-title">
                  <FaCamera size={14} /> COMPROBANTE DE PAGO
                  {requiresReceipt(nuevaVenta.metodoPago) && <span className="required"> *</span>}
                </div>
                <div className={`evidence-dropzone ${errors.evidencia ? 'has-error' : ''}`}>
                  {nuevaVenta.evidencia ? (
                    <>
                      <img src={nuevaVenta.evidencia} alt="Comprobante" className="evidence-preview-img" />
                      <button onClick={() => actualizarProducto(-1, 'evidencia', null)} className="btn-remove-evidence"><FaTrash size={12} /></button>
                    </>
                  ) : (
                    <div className="evidence-empty-v">
                      <FaImage size={48} color="#334155" className="mb-10" />
                      <p className="evidence-desc" style={{ marginTop: '15px' }}>
                        {requiresReceipt(nuevaVenta.metodoPago) 
                          ? "Ingrese el formato de la imagen aquí" 
                          : "No se requiere comprobante para este método de pago"}
                      </p>
                      {requiresReceipt(nuevaVenta.metodoPago) && (
                        <label className="btn-select-evidence">
                          SELECCIONAR ARCHIVO
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="display-none" />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEGUNDA FILA: PRODUCTOS (FULL WIDTH) */}
            <div className="venta-form-card full-width-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div className="section-title" style={{ marginBottom: 0 }}><FaBoxOpen size={14} /> PRODUCTOS</div>
                <button onClick={agregarProducto} className="btn-add-row"><FaPlus size={10} /> AGREGAR</button>
              </div>
              
              <div className="products-table-header" style={{ gridTemplateColumns: '1.6fr 1.2fr 100px 140px 140px 40px' }}>
                <span className="header-label">PRODUCTO</span>
                <span className="header-label">TALLA</span>
                <span className="header-label center">CANT</span>
                <span className="header-label">PRECIO</span>
                <span className="header-label important">SUBTOTAL</span>
                <span></span>
              </div>

              <div className="products-list-scroll">
                {nuevaVenta.productos.map((p, i) => (
                  <ProductoForm 
                    key={p._tempKey} 
                    producto={p} 
                    index={i} 
                    onChange={actualizarProducto} 
                    onRemove={eliminarProducto} 
                    isFirst={i === 0} 
                    availableProducts={availableProducts}
                    availableSizes={availableSizes}
                    errors={errors}
                  />
                ))}
              </div>
              
              <div className="totals-separator">
                <div className="total-summary">
                  <span className="total-label">TOTAL A COBRAR:</span>
                  <span className="total-value">${calcularTotal().toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* DETALLE */
          <div className="ventas-detail-wrapper yellow-scrollbar">
            <div className="sales-top-row">
              {/* CARD 1: DATOS DE VENTA (Detalle) */}
              <div className="venta-form-card">
                <div className="section-title"><FaUser size={14} /> DATOS DE VENTA</div>
                <div className="form-data-grid">
                  <div className="form-field-group">
                    <label className="form-label">No. DE VENTA</label>
                    <div className="product-input disabled important">{ventaViendo?.id}</div>
                  </div>
                  <div className="form-field-group">
                    <label className="form-label">CLIENTE</label>
                    <div className="product-input disabled">
                      {typeof ventaViendo?.cliente === 'object' ? ventaViendo?.cliente?.nombre : ventaViendo?.cliente}
                    </div>
                  </div>
                  <div className="form-field-group">
                    <label className="form-label">MÉTODO DE PAGO</label>
                    <div className="product-input disabled">{ventaViendo?.metodoPago}</div>
                  </div>
                  <div className="form-field-group">
                    <label className="form-label">FECHA</label>
                    <div className="product-input disabled">{ventaViendo?.fecha}</div>
                  </div>
                  <div className="form-field-group">
                    <label className="form-label">MÉTODO DE ENTREGA</label>
                    <div className="product-input disabled">
                      {ventaViendo?.tipoEntrega === 'recoger' ? '🏪 Recogida en local' : '🚚 Envío a domicilio'}
                    </div>
                  </div>
                  <div className="form-field-group">
                    <label className="form-label">TOTAL</label>
                    <div className="product-input disabled success" style={{ fontWeight: 800 }}>
                      ${calcularTotalViendo().toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {ventaViendo?.monto1 > 0 && (
                    <div className="form-field-group">
                      <label className="form-label">1RA CONSIGNACIÓN</label>
                      <div className="product-input disabled" style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                        ${Number(ventaViendo.monto1).toLocaleString('es-CO')}
                      </div>
                    </div>
                  )}

                  {ventaViendo?.monto2 > 0 && (
                    <div className="form-field-group">
                      <label className="form-label">2DA CONSIGNACIÓN</label>
                      <div className="product-input disabled" style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                        ${Number(ventaViendo.monto2).toLocaleString('es-CO')}
                      </div>
                    </div>
                  )}
                  <div className="form-field-group full-width">
                    <label className="form-label">DIRECCIÓN DE ENVÍO</label>
                    <div className="product-input disabled address-highlight" style={{ textAlign: 'left', padding: '10px 16px' }}>
                      {ventaViendo?.direccionEnvio || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: COMPROBANTE DE PAGO (Detalle) */}
              <div className="venta-form-card">
                <div className="section-title"><FaCamera size={14} /> COMPROBANTE(S) DE PAGO</div>
                
                {ventaViendo?.estado === 'Pago Incompleto' && (
                    <div className="partial-balance-banner">
                        <FaExclamationTriangle />
                        <span>FALTAN ${(ventaViendo.total - ventaViendo.montoPagado).toLocaleString('es-CO')}</span>
                    </div>
                )}

                <div className="gm-receipt-container-premium-admin multiple">
                  {ventaViendo?.evidencia ? (
                    <div className="gm-receipt-wrapper-premium-admin" onClick={() => openImage(ventaViendo.evidencia)}>
                        <img src={ventaViendo.evidencia} alt="Comprobante 1" className="gm-receipt-img-premium-admin" />
                        <div className="gm-receipt-overlay-premium-admin">Pago 1</div>
                    </div>
                  ) : null}

                  {ventaViendo?.evidencia2 ? (
                    <div className="gm-receipt-wrapper-premium-admin" onClick={() => openImage(ventaViendo.evidencia2)}>
                        <img src={ventaViendo.evidencia2} alt="Comprobante 2" className="gm-receipt-img-premium-admin" />
                        <div className="gm-receipt-overlay-premium-admin">Pago 2</div>
                    </div>
                  ) : null}

                  {!ventaViendo?.evidencia && !ventaViendo?.evidencia2 && (
                    <div className="evidence-empty-v-admin">
                      <FaCamera size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
                      <span>Sin comprobantes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fila inferior: PRODUCTOS (Detalle) */}
            <div className="venta-form-card full-width-card">
              <div className="section-title"><FaBoxOpen size={14} /> PRODUCTOS ADQUIRIDOS</div>
              <div className="products-table-header products-table-header-view">
                <span className="header-label">PRODUCTO</span>
                <span className="header-label">TALLA</span>
                <span className="header-label center">CANTIDAD</span>
                <span className="header-label">PRECIO UNI.</span>
                <span className="header-label important">SUBTOTAL</span>
              </div>
              <div className="products-list-scroll">
                {ventaViendo?.productos?.map((p, i) => (
                  <ProductoForm key={i} producto={p} isViewMode={true} />
                ))}
              </div>

              <div className="detail-footer-actions">
                <div className={`status-block-header-v ${ventaViendo?.estado?.toLowerCase().includes('rechaz') ? 'rejected' : 'approved'}`}>
                  <span className="status-block-label">ESTADO DE LA VENTA:</span>
                  <span className="status-block-value">{ventaViendo?.estado?.toUpperCase()}</span>
                </div>

                {/* Motivo de Rechazo (si ya está rechazada) */}
                {(ventaViendo?.estado === availableStatuses[2] || ventaViendo?.estado?.toLowerCase().includes('rechaz')) && (
                  <div className="status-motivo-banner">
                    <span className="motivo-label">MOTIVO DE RECHAZO:</span>
                    <p className="motivo-text">{ventaViendo?.motivoRechazo || 'No especificado.'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VentasPage;
