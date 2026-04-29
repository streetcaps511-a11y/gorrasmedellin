/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { FaTimes } from 'react-icons/fa';
import jsPDF from 'jspdf';

// ✨ FACTURA MODAL MEJORADA — ESTRECHA, CON LOGO, IVA Y SCROLL
const InvoiceModal = ({ isOpen, onClose, invoiceData }) => {
  if (!isOpen || !invoiceData) return null;
  
  const {
    invoiceNumber = '',
    date = '',
    customerName = 'Consumidor Final',
    customerEmail = '',
    customerAddress = '',
    customerPhone = '',
    items = [],
    total = 0,
    subtotal = 0,
    shipping = ''
  } = invoiceData;

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Fondo blanco estándar para el PDF
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Título Principal
    doc.setTextColor(30, 41, 59); // Un gris muy oscuro (slate-800)
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("GORRAS MEDELLÍN", 105, 25, { align: 'center' });
    
    doc.setTextColor(100, 116, 139); // Gris medio
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`No. INV-${invoiceNumber || ''}`, 105, 33, { align: 'center' });
    doc.text(`Fecha: ${date || ''}`, 105, 38, { align: 'center' });

    // Datos del cliente
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("DATOS DEL CLIENTE:", 20, 55);
    
    const phoneValue = customerPhone && customerPhone !== 'No especificado' ? customerPhone : 'No especificado';
    
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${customerName}`, 20, 62);
    doc.text(`Email: ${customerEmail}`, 20, 67);
    doc.text(`Dirección: ${customerAddress}`, 20, 72);
    doc.text(`Teléfono: ${phoneValue}`, 20, 77);

    // Caja SOLO para productos
    const tableTop = 103;
    const boxHeight = (items.length * 7) + 15;
    doc.setDrawColor(203, 213, 225); // Borde gris claro
    doc.setLineWidth(0.5);
    doc.rect(15, tableTop, 180, boxHeight);

    let yPosHead = 110;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Producto", 20, yPosHead);
    doc.text("Cant.", 90, yPosHead);
    doc.text("Precio", 110, yPosHead);
    doc.text("Total", 140, yPosHead);
    
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.1);
    doc.line(15, 113, 195, 113);

    let yPosItems = 120;
    items.forEach(item => {
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.text(item.name.length > 30 ? item.name.substring(0, 30) + "..." : item.name, 20, yPosItems);
      doc.text(String(item.quantity), 90, yPosItems);
      doc.text(`$${item.price.toLocaleString()}`, 110, yPosItems);
      doc.text(`$${(item.price * item.quantity).toLocaleString()}`, 140, yPosItems);
      yPosItems += 7;
    });

    // Totales fuera de la caja
    let yPosTotals = yPosItems + 15;

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    doc.text("Envío:", 120, yPosTotals);
    doc.text(shipping || 'N/A', 150, yPosTotals);
    
    yPosTotals += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("TOTAL:", 120, yPosTotals);
    doc.setFontSize(16);
    doc.text(`$${total.toLocaleString()}`, 150, yPosTotals);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text("Gracias por elegir Gorras Medellín. Tu pedido está siendo procesador.", 20, yPosTotals + 20);

    doc.save(`Comprobante_GMCAPS_${invoiceNumber}.pdf`);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '15px'
    }}>
      <div style={{
        background: '#0f172a',
        color: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '450px',
        maxHeight: '90vh',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        border: '1px solid #FFC107',
        padding: '20px',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '6px' }}>
          <img
            src="/logo.png"
            alt="Logo GM CAPS"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '6px',
              border: '1px solid #FFC107',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/50x50/1E293B/FFC107?text=GM';
            }}
          />
          <h3 style={{
            color: '#FFC107',
            margin: '6px 0 0 0',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            ¡Compra Exitosa!
          </h3>
        </div>

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: '#FFC107',
            fontSize: '18px',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 193, 7, 0.1)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <FaTimes />
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '15px',
          paddingBottom: '10px',
          borderBottom: '1px solid rgba(255, 193, 7, 0.2)',
          fontSize: '11px'
        }}>
          <div>
            <div style={{ fontWeight: 'bold', color: '#FFC107', marginBottom: '4px', fontSize: '12px' }}>DATOS DEL CLIENTE</div>
            <div><strong>Nombre:</strong> {customerName}</div>
            <div><strong>Dirección:</strong> {customerAddress}</div>
            <div><strong>Teléfono:</strong> {customerPhone}</div>
            <div><strong>Email:</strong> {customerEmail}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', color: '#FFC107', fontSize: '12px' }}>COMPROBANTE</div>
            <div>No. INV-{invoiceNumber}</div>
            <div>{date}</div>
          </div>
        </div>

        <div style={{
          marginBottom: '15px',
          padding: '4px 0',
          fontSize: '13px',
          textAlign: 'center',
          color: '#FFC107',
          fontWeight: 'bold',
          letterSpacing: '1px'
        }}>
          GORRAS MEDELLÍN
        </div>

        {/* CUADRO SOLO PARA PRODUCTOS */}
        <div style={{
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          marginBottom: '10px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ color: '#FFC107' }}>
                <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 'bold' }}>Producto</th>
                <th style={{ textAlign: 'center', padding: '6px 0', fontWeight: 'bold' }}>Cant.</th>
                <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 'bold' }}>Precio</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255, 193, 7, 0.1)' }}>
                  <td style={{ padding: '7px 0' }}>{item.name}</td>
                  <td style={{ textAlign: 'center', padding: '7px 0' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', padding: '7px 0' }}>
                    ${(item.price * item.quantity).toLocaleString()}
                    {item.quantity > 1 && (
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                        c/u ${item.price.toLocaleString()}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALES FUERA DEL CUADRO */}
        <div style={{ marginTop: '10px', textAlign: 'right', fontSize: '13px', padding: '0 5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', color: 'rgba(255,255,255,0.7)' }}>
            <span>Envío:</span>
            <strong style={{ fontStyle: 'italic' }}>{shipping || 'N/A'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '16px', color: '#FFC107', fontWeight: 'bold', borderTop: '1px solid rgba(255,193,7,0.2)', paddingTop: '10px' }}>
            <span>TOTAL:</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '22px' }}>
          <button
            onClick={handleDownloadPDF}
            style={{
              flex: 1,
              padding: '9px',
              backgroundColor: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📥 Descargar PDF
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '9px',
              backgroundColor: '#FFC107',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Cerrar
          </button>
        </div>

        {/* Mensaje de envío */}
        <div style={{ margin: '16px 0 0 0', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: '#10B981', fontSize: '12px', fontWeight: '600', margin: '0', lineHeight: '1.5' }}>
            🚚 El costo del envío será asumido por el cliente y deberá pagarse directamente a la agencia de envío encargada del domicilio (Inter Rapidísimo, Envía, COONORTE o ZExpress).
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
