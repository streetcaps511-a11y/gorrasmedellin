import React from 'react';
import { 
  FaShoppingBag, FaSearch, FaTimes, FaChevronLeft, 
  FaChevronRight, FaArrowLeft, FaExchangeAlt, FaDownload, FaUndo
} from "react-icons/fa";
import jsPDF from 'jspdf';
import { RotateCcw } from 'lucide-react';
import '../styles/OrdersSection.css';

const OrdersSection = ({ 
  orderView, setOrderView, orderStatus, setOrderStatus, 
  orderQuery, setOrderQuery, paginatedOrders, ordersPage, setOrdersPage,
  totalOrderPages, selectedOrder, setSelectedOrder, 
  openImage, handleReturnClick, setActiveTab, allReturns = [],
  user = {}, formData = {}, handleBulkReturnClick, isBulkReturn
}) => {
  const StatusBadge = ({ status, color }) => (
    <div className="gm-status-badge" style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` }}>
      <span className="gm-status-point" style={{ backgroundColor: color }} />
      {status}
    </div>
  );

  if (orderView === 'list') {
    return (
      <div className="gm-orders-section">
        <div className="gm-orders-header">
          <div className="gm-section-header">
            <div className="gm-section-title-wrapper">
              <FaShoppingBag color="#FFC107" size={20} />
              <h3 className="gm-section-title">Mis Pedidos</h3>
            </div>
          </div>
          
          <div className="gm-filter-bar">
            <div className="gm-status-filters">
              {[
                { label: 'Todos', color: '#3b82f6' },
                { label: 'Pendiente', color: '#FFC107' },
                { label: 'Completada', color: '#10b981' },
                { label: 'Rechazado', color: '#ef4444' }
              ].map(s => (
                <button 
                  key={s.label} 
                  onClick={() => setOrderStatus(s.label)} 
                  className={`gm-status-filter-btn ${orderStatus === s.label ? 'active' : ''}`}
                  style={{ 
                    '--active-color': s.color,
                    '--hover-color': s.color
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="gm-search-wrapper">
              <FaSearch className="gm-search-icon" size={14} />
              <input 
                value={orderQuery} 
                onChange={(e) => setOrderQuery(e.target.value)} 
                placeholder="Buscar pedido..." 
                className="gm-search-input"
              />
              {orderQuery && (
                <FaTimes 
                  onClick={() => setOrderQuery("")} 
                  className="gm-clear-icon"
                  size={12} 
                />
              )}
            </div>
          </div>
        </div>

        <div className="gm-orders-list">
          {paginatedOrders.length > 0 ? (
            <>
              {paginatedOrders.map(o => (
                <div key={o.id} onClick={() => { setSelectedOrder(o); setOrderView('detail'); }} className="gm-order-card">
                  <div className="gm-order-main-info">
                    <FaShoppingBag color="#FFC107" size={16} />
                    <div className="gm-order-id">{o.id}</div>
                  </div>
                  <div className="gm-order-meta">
                    <div className="gm-order-total">{o.total}</div>
                    <div className="gm-order-date">{o.date.toUpperCase()}</div>
                    <StatusBadge status={o.status} color={o.statusColor} />
                  </div>
                </div>
              ))}
              
              {totalOrderPages > 1 && (
                <div className="gm-pagination">
                  <button 
                    onClick={() => setOrdersPage(p => Math.max(1, p - 1))} 
                    disabled={ordersPage === 1}
                    className="gm-pagination-btn"
                  >
                    <FaChevronLeft size={12} />
                  </button>
                  {[...Array(totalOrderPages)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setOrdersPage(i + 1)} 
                      className={`gm-page-num-btn ${ordersPage === i + 1 ? 'active' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setOrdersPage(p => Math.min(totalOrderPages, p + 1))} 
                    disabled={ordersPage === totalOrderPages}
                    className="gm-pagination-btn"
                  >
                    <FaChevronRight size={12} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: "#64748b", textAlign: "center", padding: "60px" }}>No se encontraron pedidos.</div>
          )}
        </div>
      </div>
    );
  }

  // DETALLE DEL PEDIDO
  const [detailProdsPage, setDetailProdsPage] = React.useState(1);
  const PRODS_PER_PAGE = 3;
  
  React.useEffect(() => {
    setDetailProdsPage(1);
  }, [selectedOrder?.id]);

  const totalProdsPages = Math.ceil((selectedOrder?.items?.length || 0) / PRODS_PER_PAGE);
  const paginatedItems = (selectedOrder?.items || []).slice(
    (detailProdsPage - 1) * PRODS_PER_PAGE, 
    detailProdsPage * PRODS_PER_PAGE
  );

  const hasExistingReturn = allReturns?.some(r => {
     const rawOrderId = String(r.orderId || r.rawOrderId || '').replace('PED-', '');
     const currentOrderId = String(selectedOrder.id || '').replace('PED-', '');
     return rawOrderId === currentOrderId;
  });

  const customerName = formData?.name || user?.Nombre || user?.nombreCompleto || user?.name || user?.nombre || 'Consumidor Final';
  const customerEmail = formData?.email || user?.Correo || user?.email || user?.Email || '';
  const customerAddress = selectedOrder?.address || formData?.address || user?.Direccion || user?.direccion || user?.Dirección || '';
  
  const getCleanPhone = () => {
    const p1 = selectedOrder?.phone;
    const p2 = formData?.phone;
    const p3 = user?.Telefono || user?.telefono || user?.Teléfono || user?.phone || user?.celular;
    const p4 = formData?.Telefono || formData?.telefono;

    const val = p2 || p1 || p3 || p4 || "";
    if (!val || val === "No especificado" || val === "null" || val === "undefined") {
        return "No especificado";
    }
    return val;
  };
  const customerPhone = getCleanPhone();

  const handleDownloadPDF = () => {
    if (!selectedOrder) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const invoiceNumber = selectedOrder.id.replace('PED-', '');
    const date = selectedOrder.date;
    const items = (selectedOrder.items || []).map(i => ({
      name: i.name,
      quantity: i.qty,
      price: typeof i.price === 'string' ? parseInt(i.price.replace(/[^0-9]/g, '')) : i.price
    }));
    const total = typeof selectedOrder.total === 'string' ? parseInt(selectedOrder.total.replace(/[^0-9]/g, '')) : selectedOrder.total;
    const shipping = 'Consultar con el vendedor';

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(255, 193, 7);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("GORRAS MEDELLÍN", 105, 25, { align: 'center' });
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`No. INV-${invoiceNumber}`, 105, 33, { align: 'center' });
    doc.text(`Fecha: ${date}`, 105, 38, { align: 'center' });
    doc.setTextColor(255, 193, 7);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("DATOS DEL CLIENTE:", 20, 55);
    doc.setTextColor(230, 230, 230);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${customerName}`, 20, 62);
    doc.text(`Email: ${customerEmail}`, 20, 67);
    doc.text(`Dirección: ${customerAddress}`, 20, 72);
    doc.text(`Teléfono: ${customerPhone}`, 20, 77);
    const tableTop = 103;
    const boxHeight = (items.length * 7) + 15;
    doc.setDrawColor(255, 193, 7);
    doc.setLineWidth(0.5);
    doc.rect(15, tableTop, 180, boxHeight);
    let yPosHead = 110;
    doc.setTextColor(255, 193, 7);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Producto", 20, yPosHead);
    doc.text("Cant.", 90, yPosHead);
    doc.text("Precio", 110, yPosHead);
    doc.text("Total", 140, yPosHead);
    doc.setDrawColor(255, 193, 7);
    doc.setLineWidth(0.1);
    doc.line(15, 113, 195, 113);
    let yPosItems = 120;
    items.forEach(item => {
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.text(item.name.length > 30 ? item.name.substring(0, 30) + "..." : item.name, 20, yPosItems);
      doc.text(String(item.quantity), 90, yPosItems);
      doc.text(`$${item.price.toLocaleString()}`, 110, yPosItems);
      doc.text(`$${(item.price * item.quantity).toLocaleString()}`, 140, yPosItems);
      yPosItems += 7;
    });
    let yPosTotals = yPosItems + 15;
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text("Envío:", 120, yPosTotals);
    doc.text(shipping || 'N/A', 150, yPosTotals);
    yPosTotals += 10;
    doc.setTextColor(255, 193, 7);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("TOTAL:", 120, yPosTotals);
    doc.setFontSize(16);
    doc.text(`$${total.toLocaleString()}`, 150, yPosTotals);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text("Gracias por elegir Gorras Medellín. Comprobante histórico.", 20, yPosTotals + 20);
    doc.save(`Comprobante_GMCAPS_${invoiceNumber}.pdf`);
  };

  return (
    <div className="gm-order-detail">
      <div className="gm-detail-top-row">
        <button onClick={() => setOrderView('list')} className="gm-back-btn" style={{ padding: '6px 12px', fontSize: '0.7rem' }}><FaArrowLeft /> Volver</button>
        <div className="gm-header-right-group" style={{ gap: '15px', display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={handleDownloadPDF} 
            className="gm-download-btn-premium"
            style={{
              padding: '6px 12px',
              backgroundColor: '#0f172a',
              color: '#60A5FA',
              border: '1px solid #60A5FA',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <FaDownload /> PDF
          </button>
          <h3 className="gm-section-title" style={{ fontSize: '0.95rem', margin: 0 }}>Pedido {selectedOrder.id}</h3>
          <StatusBadge status={selectedOrder.status} color={selectedOrder.statusColor} />
        </div>
      </div>

      <div className="gm-detail-content">
        <div className="gm-detail-products-block">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h4 className="gm-detail-block-title" style={{ fontSize: '1rem', color: '#fff', fontWeight: 400, margin: 0, textTransform: 'none', fontFamily: '"Montserrat", sans-serif', letterSpacing: '0.5px' }}>Productos del pedido</h4>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {(String(selectedOrder.status).toUpperCase() === 'COMPLETADA' || selectedOrder.status === 'Entregado') && !hasExistingReturn && (
                <button 
                  onClick={() => handleBulkReturnClick(selectedOrder)}
                  className="gm-bulk-return-btn-premium"
                >
                  <RotateCcw size={14} style={{ marginRight: '8px' }} />
                  Solicitar Devolución del Pedido
                </button>
              )}

              {totalProdsPages > 1 && (
                <div className="gm-mini-pagination">
                  <button 
                    onClick={() => setDetailProdsPage(p => Math.max(1, p - 1))}
                    disabled={detailProdsPage === 1}
                    className="gm-mini-pagination-btn"
                  >
                    <FaChevronLeft size={10} />
                  </button>
                  <span className="gm-mini-pagination-info">{detailProdsPage} / {totalProdsPages}</span>
                  <button 
                    onClick={() => setDetailProdsPage(p => Math.min(totalProdsPages, p + 1))}
                    disabled={detailProdsPage === totalProdsPages}
                    className="gm-mini-pagination-btn"
                  >
                    <FaChevronRight size={10} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {paginatedItems.map(i => (
            <div key={i.id} className="gm-order-temu-item ultra-slim-row" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '5px 20px', marginBottom: '10px', overflow: 'hidden' }}>
              <div 
                className="gm-product-img-wrapper" 
                style={{ position: 'relative', width: '60px', height: '60px', minWidth: '60px', cursor: 'pointer' }}
                onClick={() => openImage(i.image)}
              >
                <img 
                  src={i.image} 
                  className="gm-order-item-img" 
                  alt={i.name} 
                  style={{ width: '100%', height: '100%', background: '#000' }} 
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.5rem', textAlign: 'center', padding: '2px 0' }}>Ver más</div>
              </div>
              
              <div className="gm-item-ultra-horizontal-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px', flex: 1 }}>
                  <span className="gm-item-name" style={{ fontSize: '0.9rem', color: '#fff', fontWeight: '400', whiteSpace: 'nowrap', fontFamily: '"Montserrat", sans-serif' }}>
                    {i.name.charAt(0).toUpperCase() + i.name.slice(1).toLowerCase()}
                  </span>
                  
                  <div className="gm-item-spec-info" style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap', fontFamily: '"Outfit", sans-serif' }}>
                    Talla: {i.size} <span style={{ margin: '0 10px', opacity: 0.15, color: 'rgba(255,255,255,0.3)' }}>|</span> Cantidad: {i.qty}
                  </div>
                </div>

                <div className="gm-item-action-price-group" style={{ display: 'flex', alignItems: 'center', gap: '25px', paddingRight: '5px' }}>
                  <span className="gm-item-price" style={{ fontSize: '1.2rem', fontWeight: '800', color: '#4ADE80', minWidth: '90px', textAlign: 'right', fontFamily: '"Outfit", sans-serif' }}>{i.price}</span>
                  {(selectedOrder.status === "Aprobado" || selectedOrder.status === "Completada") && (
                    !allReturns.some(r => 
                      Number(r.rawOrderId) === Number(selectedOrder.id.replace('PED-', '')) && 
                      Number(r.productId) === Number(i.id)
                    )
                  ) && (
                    <button 
                      onClick={() => { handleReturnClick(i, selectedOrder); setActiveTab('returns'); }} 
                      className="gm-item-change-btn"
                      style={{ margin: 0, padding: '4px 12px', fontSize: '0.6rem', textTransform: 'none', whiteSpace: 'nowrap' }}
                    >
                      Solicitar cambio
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="gm-detail-top-info-grid">
        <div className="gm-summary-info-box">
          <div className="gm-summary-field">
            <label className="gm-info-label-premium">Medio de pago:</label>
            <div className="gm-info-value-premium">{selectedOrder.paymentMethod}</div>
          </div>
          <div className="gm-summary-field">
            <label className="gm-info-label-premium">Fecha del pedido:</label>
            <div className="gm-info-value-premium">{selectedOrder.date}</div>
          </div>
          <div className="gm-summary-field">
            <label className="gm-info-label-premium">Dirección de entrega:</label>
            <div className="gm-info-value-premium">{selectedOrder.address}</div>
          </div>

          {selectedOrder.monto1 > 0 && (
            <div className="gm-summary-field">
              <label className="gm-info-label-premium">1ra Consignación:</label>
              <div className="gm-info-value-premium" style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                ${Number(selectedOrder.monto1).toLocaleString('es-CO')}
              </div>
            </div>
          )}

          {selectedOrder.monto2 > 0 && (
            <div className="gm-summary-field">
              <label className="gm-info-label-premium">2da Consignación:</label>
              <div className="gm-info-value-premium" style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                ${Number(selectedOrder.monto2).toLocaleString('es-CO')}
              </div>
            </div>
          )}

          <div className="gm-summary-field">
            <label className="gm-info-label-premium">Total del pedido:</label>
            <div className="gm-info-value-premium total">{selectedOrder.total}</div>
          </div>
        </div>

        <div className="gm-summary-receipt-box">
          <label className="gm-info-label-premium">Comprobante(s):</label>

          {(selectedOrder.status === 'Pago Incompleto' || (selectedOrder.monto1 > 0 && selectedOrder.monto2 === 0)) && (
             <div className="gm-partial-balance-banner-client">
                FALTAN ${(parseInt(selectedOrder.total.replace(/[^0-9]/g, '')) - (selectedOrder.monto1 || 0)).toLocaleString('es-CO')}
             </div>
          )}

          <div className={`gm-receipt-container-premium ${selectedOrder.receipt2 ? 'multiple' : ''}`}>
            {selectedOrder.receipt ? (
              <div onClick={() => openImage(selectedOrder.receipt)} className="gm-receipt-wrapper-premium">
                <img src={selectedOrder.receipt} alt="Comprobante 1" className="gm-receipt-img-premium" />
                <div className="gm-receipt-overlay-premium">{selectedOrder.receipt2 ? 'Pago 1' : 'Ver más'}</div>
              </div>
            ) : null}

            {selectedOrder.receipt2 ? (
              <div onClick={() => openImage(selectedOrder.receipt2)} className="gm-receipt-wrapper-premium">
                <img src={selectedOrder.receipt2} alt="Comprobante 2" className="gm-receipt-img-premium" />
                <div className="gm-receipt-overlay-premium">Pago 2</div>
              </div>
            ) : null}

            {!selectedOrder.receipt && !selectedOrder.receipt2 && (
              <div className="gm-no-receipt-box-premium">Sin comprobante disponible</div>
            )}
          </div>
        </div>
      </div>
      
      {String(selectedOrder.status || '').toLowerCase().includes('rechaz') && selectedOrder.rejectionReason && (
        <div className="gm-rejection-reason-banner">
          <div className="gm-rejection-header">
            MENSAJE DEL ADMINISTRADOR (PEDIDO RECHAZADO):
          </div>
          <div className="gm-rejection-content">
            {selectedOrder.rejectionReason}
          </div>
        </div>
      )}


    </div>
  );
};

export default OrdersSection;
