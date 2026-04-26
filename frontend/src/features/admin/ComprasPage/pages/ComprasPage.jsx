// src/modules/purchases/pages/ComprasPage.jsx
import '../style/index.css';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Alert, EntityTable, SearchInput, CustomPagination, 
  StatusPill, DateInputWithCalendar 
} from '../../../shared/services';
import StatusFilter from '../components/StatusFilter';
import ProductoItemForm from '../components/ProductoItemForm';
import { 
  FaArrowLeft, 
  FaPlus, 
  FaTrash, 
  FaSave, 
  FaEye, 
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaTruck,
  FaMoneyBillWave,
  FaShoppingCart,
  FaSearch
} from 'react-icons/fa';
import { useComprasLogic } from '../hooks/useComprasLogic';

const ComprasPage = () => {
  const location = useLocation();
  const [detalleSearch, setDetalleSearch] = useState('');
  const {
    modoVista, searchTerm, setSearchTerm, filterStatus, setFilterStatus, filterDate, setFilterDate,
    currentPage, setCurrentPage, itemsPerPage, alert, setAlert, errors,
    compraViendo, compraEditando, completarModal, setCompletarModal,
    nuevaCompra, setNuevaCompra, availableStatuses, availablePaymentMethods, availableSizes,
    proveedoresActivos, mostrarLista, mostrarFormulario, mostrarDetalle,
    agregarProducto, actualizarProducto, eliminarProducto, calcularTotal,
    handleSubmit, handleCompletarCompra, confirmCompletarCompra,
    filtered, loading, actionLoading, actionLoadingText, availableProducts, isLoadingProducts
  } = useComprasLogic(location);

  const columns = [
    { header: 'N°',       field: 'numCompra', width: '44px',  render: (item) => <span>{item.numCompra}</span> },
    { header: 'Proveedor',field: 'proveedor', width: '200px', render: (item) => <span style={{ fontWeight: '600' }}>{item.proveedor}</span> },
    { header: 'Fecha',    field: 'fecha',     width: '100px', render: (item) => <span>{item.fecha}</span> },
    { header: 'Total',    field: 'total',     width: '120px', render: (item) => <span style={{ color: '#10B981', fontWeight: '700', fontSize: '14px' }}>${Number(item.total).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> },
    { header: 'Estado',   field: 'estado',    width: '110px', render: (item) => <StatusPill status={item.estado} /> }
  ];

  const productosVisibles = (modoVista === "detalle" 
    ? compraViendo?.productos || [] 
    : nuevaCompra.productos);

  return (
    <>
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'success' })}
        />
      )}
      


      {/* MODAL DE CONFIRMACIÓN DE COMPLETAR */}
      {completarModal.isOpen && (
        <div className="gm-zoom-overlay-admin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#000', border: '1px solid #334155', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>Confirmar Registro</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
              ¿Estás seguro de que deseas completar el registro de la compra <strong>#{completarModal.compra?.numCompra}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setCompletarModal({ isOpen: false, compra: null })}
                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #334155', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmCompletarCompra}
                style={{ padding: '10px 20px', background: '#F5C81B', border: 'none', color: '#000', fontWeight: '800', borderRadius: '8px', cursor: 'pointer' }}
              >
                {actionLoading ? 'Completando...' : 'Completar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="compras-container">
        <div className="compras-header">
          <div className="compras-header-top">
            <div className="compras-header-left">
              {modoVista !== "lista" && (
                <button onClick={mostrarLista} className="compras-btn-back">
                  <FaArrowLeft size={16} />
                </button>
              )}
              <div>
                <h1 className="compras-title">
                  {modoVista === "formulario" && (compraEditando ? "Editar Compra" : "Registrar Compra")}
                  {modoVista === "detalle" && "Detalle de Compra"}
                  {modoVista === "lista" && "Compras"}
                </h1>
                <p className="compras-subtitle">Gestiona y haz seguimiento de tus órdenes</p>
              </div>
            </div>

            <div className="compras-actions">
              {modoVista === "lista" && (
                <button onClick={() => mostrarFormulario()} className="compras-btn-register">
                  Registrar Compra
                </button>
              )}
              {modoVista === "formulario" && (
                <button 
                  onClick={handleSubmit} 
                  className={`compras-btn-submit ${actionLoading ? 'loading' : ''}`}
                  disabled={actionLoading}
                >
                  {actionLoading ? actionLoadingText : (compraEditando ? 'Actualizar Compra' : 'Registrar Compra')}
                </button>
              )}
            </div>
          </div>

          {modoVista === "lista" && (
            <div className="compras-search-bar" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '10px', gap: '10px' }}>
              <div className="compras-search-wrapper" style={{ width: '400px' }}>
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar proveedor..."
                  onClear={() => setSearchTerm('')}
                  fullWidth={true}
                />
              </div>
              <div className="compras-filters" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  title="Filtrar por fecha"
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #ffffff30',
                    color: filterDate ? '#ffffff' : '#9CA3AF',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    height: '36px',
                    padding: '0 12px',
                    fontWeight: filterDate ? '600' : '400',
                    outline: 'none',
                    colorScheme: 'dark',
                    width: '140px',
                    flex: 'none'
                  }}
                />
                <StatusFilter 
                  filterStatus={filterStatus} 
                  onFilterSelect={setFilterStatus} 
                  statuses={availableStatuses}
                />
              </div>
            </div>
          )}
        </div>

        {modoVista === "lista" ? (
          <div className="compras-main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{ flex: '0 0 auto', overflowY: 'auto' }}>
              <EntityTable
                entities={filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
                columns={columns}
                onView={mostrarDetalle}
                onComplete={handleCompletarCompra}
                moduleType="compras"
                className="compras-entity-table"
              />
            </div>

            <CustomPagination
              currentPage={currentPage}
              totalPages={Math.ceil(filtered.length / itemsPerPage) || 1}
              onPageChange={setCurrentPage}
              totalItems={filtered.length}
              showingStart={filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              endIndex={Math.min(currentPage * itemsPerPage, filtered.length)}
              itemsName="compras"
            />
          </div>
        ) : modoVista === "formulario" ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
            <div className="compras-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* PANEL IZQUIERDO: Datos Generales */}
              <div style={{
                backgroundColor: '#000000',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '20px',
              }}>
                <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaTruck size={14} color="#F5C81B" /> Datos del proveedor
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#fff', marginBottom: '6px', display: 'block' }}>Proveedor <span style={{ color: '#ef4444' }}>*</span></label>
                    <select
                      value={nuevaCompra.proveedor}
                      onChange={(e) => {
                        const pvr = proveedoresActivos.find(p => p.nombre === e.target.value);
                        setNuevaCompra(p => ({ ...p, proveedor: e.target.value, idProveedor: pvr?.id || '' }));
                      }}
                      style={{
                        backgroundColor: '#000000',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#fff',
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    >
                      <option value="">Seleccionar proveedor activo...</option>
                      {proveedoresActivos.map(p => (
                        <option key={p.id} value={p.nombre}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                     <div>
                        <label style={{ fontSize: '12px', color: '#fff', marginBottom: '6px', display: 'block' }}>Método de pago</label>
                        <select
                          value={nuevaCompra.metodoPago}
                          onChange={(e) => setNuevaCompra(p => ({ ...p, metodoPago: e.target.value }))}
                          style={{
                            backgroundColor: '#000000',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#fff',
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '13px',
                            outline: 'none'
                          }}
                        >
                          {availablePaymentMethods.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                     </div>
                     <div>
                        <label style={{ fontSize: '12px', color: '#fff', marginBottom: '6px', display: 'block' }}>Estado</label>
                        <select
                          value={nuevaCompra.estado}
                          onChange={(e) => setNuevaCompra(p => ({ ...p, estado: e.target.value }))}
                          style={{
                            backgroundColor: '#000000',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#fff',
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '13px',
                            outline: 'none'
                          }}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Completada">Completada</option>
                        </select>
                     </div>
                  </div>
                </div>
              </div>

              {/* PANEL DERECHO: Resumen de Totales */}
              <div style={{
                backgroundColor: '#000',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaFileInvoiceDollar size={14} color="#F5C81B" /> Resumen de compra
                </h3>

                <div style={{ backgroundColor: '#00000050', padding: '15px', borderRadius: '8px', border: '1px solid #2d3748' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#fff', fontWeight: '700' }}>Total factura:</span>
                      <span style={{ color: '#10B981', fontWeight: '800', fontSize: '20px' }}>${calcularTotal().toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                   </div>
                </div>

                <div style={{ marginTop: '15px' }}>
                    <label style={{ fontSize: '12px', color: '#fff', marginBottom: '6px', display: 'block' }}>Fecha de operación</label>
                    <DateInputWithCalendar
                      value={nuevaCompra.fecha}
                      onChange={(d) => setNuevaCompra(p => ({ ...p, fecha: d }))}
                    />
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#000000',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaShoppingCart size={14} color="#F5C81B" /> Productos adquiridos
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ position: 'relative', width: '200px' }}>
                    <FaSearch size={11} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="text"
                      placeholder="Buscar en productos..."
                      value={detalleSearch}
                      onChange={(e) => setDetalleSearch(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#000', border: '1px solid #334155', borderRadius: '6px', color: '#fff', padding: '6px 10px 6px 30px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={agregarProducto}
                    className="btn-primary"
                    style={{ height: '34px' }}
                  >
                    + Añadir item
                  </button>
                </div>
              </div>

              <div>
                {nuevaCompra.productos.map((prod, idx) => (
                  <ProductoItemForm
                    key={prod._tempKey || idx}
                    index={idx}
                    producto={prod}
                    isFirst={idx === 0}
                    onRemove={() => eliminarProducto(idx)}
                    onChange={(i, campo, valor) => actualizarProducto(i, campo, valor)}
                    errors={errors}
                    availableProducts={availableProducts}
                    availableSizes={availableSizes}
                    isLoadingProducts={isLoadingProducts}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* MODO VISTA: DETALLE */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
               <div style={{ backgroundColor: '#000000', border: '1px solid #334155', borderRadius: '8px', padding: '20px' }}>
                  <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaTruck size={14} color="#F5C81B" /> Información general
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '6px', display: 'block' }}>Proveedor</label>
                      <div style={{ backgroundColor: '#000000', border: '1px solid #334155', borderRadius: '6px', color: '#fff', padding: '8px 12px', fontSize: '13px' }}>
                        {compraViendo?.proveedor || '-'}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '6px', display: 'block' }}>Método de pago</label>
                        <div style={{ backgroundColor: '#000000', border: '1px solid #334155', borderRadius: '6px', color: '#fff', padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FaMoneyBillWave size={12} color="#94a3b8" /> {compraViendo?.metodo || '-'}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '6px', display: 'block' }}>Estado</label>
                        <div style={{ backgroundColor: '#000000', border: '1px solid #334155', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }}>
                          <StatusPill status={compraViendo?.estado} />
                        </div>
                      </div>
                    </div>
                  </div>
               </div>

               <div style={{ backgroundColor: '#000000', border: '1px solid #334155', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaFileInvoiceDollar size={14} color="#F5C81B" /> Resumen de compra
                  </h3>
                  
                  <div style={{ backgroundColor: '#00000050', padding: '15px', borderRadius: '8px', border: '1px solid #2d3748' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ color: '#fff', fontWeight: '700' }}>Total factura:</span>
                       <span style={{ color: '#10B981', fontWeight: '800', fontSize: '20px' }}>
                         ${Number(compraViendo?.total || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '15px' }}>
                    <label style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '6px', display: 'block' }}>Fecha de operación</label>
                    <div style={{ backgroundColor: '#000000', border: '1px solid #334155', borderRadius: '6px', color: '#F5C81B', padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaCalendarAlt size={12} color="#F5C81B" /> {compraViendo?.fecha || '-'}
                    </div>
                  </div>
               </div>
            </div>

            <div style={{ backgroundColor: '#000000', border: '1px solid #334155', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                 <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <FaShoppingCart size={14} color="#F5C81B" /> Productos detallados
                 </h3>
                 <div style={{ position: 'relative', width: '220px' }}>
                   <FaSearch size={11} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                   <input
                     type="text"
                     placeholder="Buscar producto..."
                     value={detalleSearch}
                     onChange={(e) => setDetalleSearch(e.target.value)}
                     style={{ width: '100%', backgroundColor: '#000', border: '1px solid #334155', borderRadius: '6px', color: '#fff', padding: '6px 10px 6px 30px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                   />
                 </div>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 {(compraViendo?.productos || []).filter(p => {
                   if (!detalleSearch) return true;
                   return (p.nombre || '').toLowerCase().includes(detalleSearch.toLowerCase());
                 }).map((p, i) => (
                   <ProductoItemForm key={i} producto={p} isViewMode={true} />
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ComprasPage;