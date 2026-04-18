// src/modules/purchases/pages/ComprasPage.jsx
import '../style/index.css';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Alert, EntityTable, SearchInput, CustomPagination, 
  AnularOperacionModal, StatusPill, DateInputWithCalendar 
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
  FaShoppingCart
} from 'react-icons/fa';
import { useComprasLogic } from '../hooks/useComprasLogic';

const ComprasPage = () => {
  const location = useLocation();
  const {
    modoVista, searchTerm, setSearchTerm, filterStatus, setFilterStatus, filterDate, setFilterDate,
    currentPage, setCurrentPage, itemsPerPage, alert, setAlert, errors,
    compraViendo, compraEditando, anularModal, setAnularModal, completarModal, setCompletarModal,
    nuevaCompra, setNuevaCompra, availableStatuses, availablePaymentMethods, availableSizes,
    proveedoresActivos, mostrarLista, mostrarFormulario, mostrarDetalle,
    agregarProducto, actualizarProducto, eliminarProducto, calcularTotal,
    handleSubmit, handleAnularCompra, handleCompletarCompra, confirmCompletarCompra,
    filtered, loading, actionLoading, actionLoadingText
  } = useComprasLogic(location);

  const columns = [
    { header: 'N° Compra', field: 'numCompra', render: (item) => <span>{item.numCompra}</span> },
    { header: 'Proveedor', field: 'proveedor', render: (item) => <span>{item.proveedor}</span> },
    { header: 'Fecha', field: 'fecha', render: (item) => <span>{item.fecha}</span> },
    { header: 'Total', field: 'total', render: (item) => <span>${Number(item.total).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> },
    { header: 'Estado', field: 'estado', render: (item) => <StatusPill status={item.estado} /> }
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
      
      <AnularOperacionModal
        isOpen={anularModal.isOpen}
        onClose={() => setAnularModal({ isOpen: false, compra: null })}
        onConfirm={handleAnularCompra}
        title="Anular Compra"
        operationType="compra"
        operationData={anularModal.compra}
        confirmButtonText="Anular"
        cancelButtonText="Conservar"
        loading={actionLoading}
        loadingText={actionLoadingText}
      />

      <AnularOperacionModal
        isOpen={completarModal.isOpen}
        onClose={() => setCompletarModal({ isOpen: false, compra: null })}
        onConfirm={confirmCompletarCompra}
        title="Confirmar Registro"
        operationType="compra"
        operationData={completarModal.compra}
        confirmButtonText="Completar"
        cancelButtonText="Cancelar"
        loading={actionLoading}
        loadingText={actionLoadingText}
      />

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
            <div className="compras-search-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
              <div className="compras-search-wrapper" style={{ flex: 1, maxWidth: '500px' }}>
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar por proveedor, factura o NIT..."
                  onClear={() => setSearchTerm('')}
                  fullWidth={true}
                />
              </div>
              <div className="compras-filters" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
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
          <div className="compras-main-content">
            <div className="compras-table-wrapper">
              <EntityTable
                entities={filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
                columns={columns}
                onView={mostrarDetalle}
                onAnular={(c) => setAnularModal({ isOpen: true, compra: c })}
                onComplete={handleCompletarCompra}
                showAnularButton={true}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflow: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* PANEL IZQUIERDO: Datos Generales */}
              <div style={{
                backgroundColor: '#111827',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '20px',
              }}>
                <h3 style={{ color: '#F5C81B', fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaTruck size={14} /> Datos del proveedor
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#F5C81B', marginBottom: '6px', display: 'block' }}>Proveedor <span style={{ color: '#ef4444' }}>*</span></label>
                    <select
                      value={nuevaCompra.proveedor}
                      onChange={(e) => setNuevaCompra(p => ({ ...p, proveedor: e.target.value }))}
                      style={{
                        backgroundColor: '#0f172a',
                        border: errors.proveedor ? '1px solid #ef4444' : '1px solid #334155',
                        borderRadius: '6px',
                        padding: '10px',
                        color: '#fff',
                        width: '100%',
                        outline: 'none',
                        height: '42px'
                      }}
                    >
                      <option value="">Seleccionar proveedor activo...</option>
                      {proveedoresActivos.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                    </select>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                     <div>
                        <label style={{ fontSize: '12px', color: '#F5C81B', marginBottom: '6px', display: 'block' }}>Método de pago</label>
                        <select
                          value={nuevaCompra.metodoPago}
                          onChange={(e) => setNuevaCompra(p => ({ ...p, metodoPago: e.target.value }))}
                          style={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            padding: '10px',
                            color: '#fff',
                            width: '100%',
                            outline: 'none',
                            height: '42px'
                          }}
                        >
                          {availablePaymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                     </div>
                     <div>
                        <label style={{ fontSize: '12px', color: '#F5C81B', marginBottom: '6px', display: 'block' }}>Estado</label>
                        <select
                          value={nuevaCompra.estado}
                          onChange={(e) => setNuevaCompra(p => ({ ...p, estado: e.target.value }))}
                          style={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            padding: '10px',
                            color: '#fff',
                            width: '100%',
                            outline: 'none',
                            height: '42px'
                          }}
                        >
                          <option value="Completada">Completada</option>
                          <option value="Pendiente">Pendiente</option>
                        </select>
                     </div>
                  </div>
                </div>
              </div>

              {/* PANEL DERECHO: Resumen de Totales */}
              <div style={{
                backgroundColor: '#111827',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <h3 style={{ color: '#F5C81B', fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaFileInvoiceDollar size={14} /> Resumen de compra
                </h3>

                <div style={{ backgroundColor: '#00000050', padding: '15px', borderRadius: '8px', border: '1px solid #2d3748' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#F5C81B', fontWeight: '700' }}>Total factura:</span>
                      <span style={{ color: '#10B981', fontWeight: '800', fontSize: '20px' }}>${calcularTotal().toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                   </div>
                </div>

                <div style={{ marginTop: '15px' }}>
                    <label style={{ fontSize: '12px', color: '#F5C81B', marginBottom: '6px', display: 'block' }}>Fecha de operación</label>
                    <DateInputWithCalendar
                      value={nuevaCompra.fecha}
                      onChange={(d) => setNuevaCompra(p => ({ ...p, fecha: d }))}
                      inputStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '10px',
                        color: '#fff',
                        width: '100%',
                        height: '42px',
                        boxSizing: 'border-box'
                      }}
                    />
                </div>
              </div>
            </div>

            {/* SECCIÓN ABAJO: Listado de Productos */}
            <div style={{
              backgroundColor: '#111827',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '20px',
              flex: 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#F5C81B', fontSize: '15px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaShoppingCart size={14} /> Productos adquiridos
                </h3>
                <button
                  type="button"
                  onClick={agregarProducto}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #F5C81B',
                    color: '#F5C81B',
                    padding: '6px 15px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FaPlus size={10} />
                  Añadir item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {nuevaCompra.productos.map((p, i) => (
                  <ProductoItemForm
                    key={p._tempKey || i}
                    producto={p}
                    index={i}
                    availableSizes={availableSizes}
                    onChange={actualizarProducto}
                    onRemove={eliminarProducto}
                    isFirst={i === 0}
                    errors={errors}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* MODO VISTA: DETALLE */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
               <div style={{ backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '8px', padding: '20px' }}>
                  <h3 style={{ color: '#F5C81B', fontSize: '14px', fontWeight: '700', marginBottom: '15px' }}>Información general</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Proveedor</span>
                      <div style={{ color: '#fff', fontSize: '15px', fontWeight: '600', marginTop: '4px' }}>{compraViendo?.proveedor}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Estado</span>
                      <div style={{ marginTop: '4px' }}><StatusPill status={compraViendo?.estado} /></div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Fecha</span>
                      <div style={{ color: '#fff', fontSize: '14px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaCalendarAlt size={12} color="#94a3b8" /> {compraViendo?.fecha}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Método</span>
                      <div style={{ color: '#fff', fontSize: '14px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaMoneyBillWave size={12} color="#94a3b8" /> {compraViendo?.metodo}
                      </div>
                    </div>
                  </div>
               </div>

               <div style={{ backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '8px' }}>Total de la operación</span>
                  <div style={{ color: '#10B981', fontSize: '42px', fontWeight: '900' }}>
                    ${Number(compraViendo?.total || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '10px' }}>
                    {compraViendo?.productos?.length || 0} items registrados
                  </div>
               </div>
            </div>

            <div style={{ backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '8px', padding: '20px', flex: 1, overflow: 'auto' }}>
               <h3 style={{ color: '#F5C81B', fontSize: '14px', fontWeight: '700', marginBottom: '15px' }}>Productos detallados</h3>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 {compraViendo?.productos?.map((p, i) => (
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