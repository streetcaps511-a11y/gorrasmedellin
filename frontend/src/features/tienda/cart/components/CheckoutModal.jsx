import React from 'react';
import { FaTimes } from 'react-icons/fa';

export const PAYMENT_METHODS = [
  { id: 'nequi', name: 'Nequi', img: 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1773077199/WhatsApp_Image_2026-03-05_at_2.23.11_PM_4_ez06y3.jpg', group: 'upfront', qr: 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1773337920/WhatsApp_Image_2026-03-12_at_12.49.25_PM_vryssw.jpg' },
  { id: 'bancolombia', name: 'Bancolombia', img: 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1773079418/WhatsApp_Image_2026-03-09_at_1.01.39_PM_lgtfn2.jpg', group: 'upfront', qr: 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1773337951/bancolombia_u4ipqc.jpg' },
  { id: 'bold', name: 'Bold', img: 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1773077199/WhatsApp_Image_2026-03-05_at_2.23.11_PM_2_bjynti.jpg', group: 'upfront', link: 'https://checkout.bold.co/payment/LNK_UT9BG4IVNG' }
];

// ✨ CHECKOUT MODAL (FLUJO EN 2 PASOS)
const CheckoutModal = ({ isOpen, onClose, onConfirm, total, subtotal, selectedMethod, setSelectedMethod, deliveryType, setDeliveryType, address, setAddress, receiptFile, setReceiptFile, isProcessing, cartItems = [], getProductName: gPN, getProductPrice: gPP }) => {
  const [step, setStep] = React.useState(1);
  const [addressError, setAddressError] = React.useState(false);
  
  // Reset step when modal opens/closes
  React.useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  if (!isOpen) return null;

  const upfrontMethods = PAYMENT_METHODS.filter(m => m.group === 'upfront');
  const otherMethods = PAYMENT_METHODS.filter(m => m.group !== 'upfront');
  const currentMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod);
  const isUpfront = currentMethod?.group === 'upfront';
  const isPickup = deliveryType === 'recoger';
  const isDelivery = deliveryType === 'envio';
  const isContraentrega = selectedMethod === 'contraentrega';
  const isNequi = selectedMethod === 'nequi';
  const isBancolombia = selectedMethod === 'bancolombia';
  const isBold = selectedMethod === 'bold';

  const shippingText = isPickup ? 'recoger en el local' : (isUpfront ? 'no incluido' : 'contraentrega');

  const handleContinue = () => {
    if (!selectedMethod) return;
    if (isDelivery && !address.trim()) {
      setAddressError(true);
      return;
    }
    setAddressError(false);
    // Si es Bold, abrir enlace en nueva pestaña
    if (isBold) {
      window.open(currentMethod.link, '_blank');
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.88)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '15px' }}>
      <div style={{ background: '#0f172a', color: 'white', borderRadius: '14px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', border: '1px solid #FFC107', padding: '16px', position: 'relative' }}>
        <button onClick={handleClose} style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#FFC107', fontSize: '18px', cursor: 'pointer', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaTimes />
        </button>

        {/* ========== PASO 1: SELECCIONAR MÉTODO ========== */}
        {step === 1 && (
          <>
            <h3 style={{ color: '#FFC107', textAlign: 'center', fontSize: '17px', margin: '0 0 12px 0' }}>Completa tu pedido</h3>

            {/* Selector de Entrega */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>¿Cómo quieres recibir tu pedido?</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => setDeliveryType('envio')} style={{ flex: 1, padding: '10px 8px', background: deliveryType === 'envio' ? 'rgba(255,193,7,0.15)' : '#1e293b', border: deliveryType === 'envio' ? '2px solid #FFC107' : '1px solid #334155', borderRadius: '10px', color: deliveryType === 'envio' ? '#FFC107' : '#94a3b8', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>🚚 Envío a domicilio</button>
                <button onClick={() => { setDeliveryType('recoger'); setAddressError(false); }} style={{ flex: 1, padding: '10px 8px', background: deliveryType === 'recoger' ? 'rgba(255,193,7,0.15)' : '#1e293b', border: deliveryType === 'recoger' ? '2px solid #FFC107' : '1px solid #334155', borderRadius: '10px', color: deliveryType === 'recoger' ? '#FFC107' : '#94a3b8', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>🏪 Recoger en local</button>
              </div>
            </div>

            {/* Métodos principales centrados */}
            <div style={{ marginBottom: '10px' }}>
              <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>Métodos de pago</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '8px' }}>
                {upfrontMethods.map(m => (
                  <button key={m.id} onClick={() => { setSelectedMethod(m.id); setAddressError(false); }} style={{ background: selectedMethod === m.id ? 'rgba(255,193,7,0.15)' : '#1e293b', border: selectedMethod === m.id ? '2px solid #FFC107' : '1px solid #334155', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                    <img src={m.img} alt={m.name} style={{ height: '28px', borderRadius: '6px', objectFit: 'contain' }} />
                    <span style={{ color: selectedMethod === m.id ? '#FFC107' : '#94a3b8', fontSize: '12px', fontWeight: '600' }}>{m.name}</span>
                  </button>
                ))}
              </div>

              {/* Mensaje de envío visible en verde */}
              {selectedMethod && isUpfront && !isPickup && (
                <div style={{ margin: '10px 0', padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ color: '#10B981', fontSize: '12px', fontWeight: '600', margin: 0, lineHeight: '1.5' }}>
                    📦 Le informamos que usted asumirá el costo del envío correspondiente a su pedido.
                  </p>
                </div>
              )}
            </div>

            {/* Dirección */}
            {selectedMethod && isDelivery && (
              <div style={{ marginBottom: '10px' }}>
                <label style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                  Dirección de envío <span style={{ color: '#ff4d4d', fontWeight: 'normal' }}>*</span>:
                </label>
                <input type="text" value={address} onChange={(e) => { setAddress(e.target.value); setAddressError(false); }} placeholder={'Ingresa tu dirección completa'} style={{ width: '100%', padding: '10px 12px', backgroundColor: '#1E293B', border: addressError ? '1px solid #ff4d4d' : '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                {addressError && <p style={{ color: '#ff4d4d', fontSize: '11px', margin: '4px 0 0 0' }}>Debes ingresar una dirección de envío</p>}
              </div>
            )}

            {/* Resumen */}
            <div style={{ backgroundColor: 'rgba(255,193,7,0.05)', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#ccc' }}>Subtotal:</span>
                <span style={{ color: '#fff' }}>${subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#ccc' }}>Envío:</span>
                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>{shippingText || 'selecciona método'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255,193,7,0.2)', fontSize: '14px' }}>
                <strong style={{ color: '#FFC107' }}>Total:</strong>
                <strong style={{ color: '#FFC107' }}>${total.toLocaleString()}</strong>
              </div>
            </div>

            {/* Botones Paso 1 */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleClose} style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', border: '1px solid #666', borderRadius: '8px', color: '#CBD5E1', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Cancelar</button>
              <button onClick={handleContinue} disabled={!selectedMethod} style={{ flex: 1, padding: '8px', backgroundColor: !selectedMethod ? '#555' : '#FFC107', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', cursor: !selectedMethod ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
                Continuar
              </button>
            </div>
          </>
        )}

        {/* ========== PASO 2: QR / COMPROBANTE ========== */}
        {step === 2 && (
          <>
            <h3 style={{ color: '#FFC107', textAlign: 'center', fontSize: '17px', margin: '0 0 12px 0' }}>
              {isBold ? 'Completa tu pago con Bold' : (isNequi || isBancolombia) ? `Paga con ${currentMethod?.name}` : 'Confirma tu pedido'}
            </h3>

            {/* QR Nequi */}
            {isNequi && (
              <div style={{ textAlign: 'center', margin: '0 0 12px 0', padding: '12px', backgroundColor: '#fff', borderRadius: '12px' }}>
                <p style={{ color: '#000', fontSize: '13px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Escanea el QR para pagar con Nequi</p>
                <img src={currentMethod.qr} alt="QR Nequi" style={{ width: '180px', height: '180px', objectFit: 'contain', borderRadius: '8px', display: 'block', margin: '0 auto' }} />
              </div>
            )}

            {/* QR Bancolombia */}
            {isBancolombia && (
              <div style={{ textAlign: 'center', margin: '0 0 12px 0', padding: '12px', backgroundColor: '#fff', borderRadius: '12px' }}>
                <p style={{ color: '#000', fontSize: '13px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Escanea el QR para pagar con Bancolombia</p>
                <img src={currentMethod.qr} alt="QR Bancolombia" style={{ width: '180px', height: '180px', objectFit: 'contain', borderRadius: '8px', display: 'block', margin: '0 auto' }} />
              </div>
            )}

            {/* Bold redirigido */}
            {isBold && (
              <div style={{ textAlign: 'center', margin: '0 0 16px 0', padding: '16px', backgroundColor: 'rgba(255,193,7,0.05)', borderRadius: '12px', border: '1px solid rgba(255,193,7,0.2)' }}>
                <p style={{ color: '#e2e8f0', fontSize: '13px', marginBottom: '8px' }}>Se ha abierto la pasarela de Bold en una nueva pestaña.</p>
                <p style={{ color: '#94a3b8', fontSize: '11px' }}>Completa tu pago allí y luego sube el comprobante aquí.</p>
                <a href={currentMethod.link} target="_blank" rel="noopener noreferrer" style={{ color: '#FFC107', fontWeight: 'bold', fontSize: '12px' }}>Abrir Bold nuevamente →</a>
              </div>
            )}

            {/* Mensaje para recoger / envio (contraentrega) */}
            {(isContraentrega || isPickup) && (
              <div style={{ textAlign: 'center', margin: '0 0 16px 0', padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <p style={{ color: '#10B981', fontSize: '13px', fontWeight: '600', margin: 0 }}>
                  {isPickup ? '🏪 Podrás recoger tu pedido en nuestro local y pagarlo al instante si así lo elegiste.' : '🚚 Pagarás al recibir tu pedido en la dirección indicada.'}
                </p>
              </div>
            )}

            {/* Comprobante de pago (OBLIGATORIO para métodos de pago adelantado) */}
            {isUpfront && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Comprobante de pago <span style={{ color: '#ff4d4d', fontWeight: 'normal' }}>*</span>:</label>
                <input type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files[0] || null)} style={{ width: '100%', padding: '8px', backgroundColor: '#1E293B', border: !receiptFile ? '1px solid #ff4d4d' : '1px solid #334155', borderRadius: '8px', color: '#94a3b8', fontSize: '12px' }} />
                {!receiptFile && <p style={{ color: '#ff4d4d', fontSize: '11px', margin: '4px 0 0 0' }}>Debes adjuntar el comprobante de pago para continuar</p>}
              </div>
            )}

            {/* Lista de productos del pedido */}
            <div style={{ backgroundColor: 'rgba(255,193,7,0.05)', borderRadius: '8px', padding: '12px', marginBottom: '12px', fontSize: '11px' }}>
              <p style={{ color: '#FFC107', fontSize: '12px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Tu pedido:</p>
              {cartItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', paddingBottom: '4px', borderBottom: '1px solid rgba(255,193,7,0.1)' }}>
                  <span style={{ color: '#CBD5E1', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>• {gPN ? gPN(item) : (item.nombre || item.name || 'Producto')} x{item.quantity || 1}</span>
                  <span style={{ color: '#FFC107', fontWeight: 'bold', whiteSpace: 'nowrap' }}>${((gPP ? gPP(item) : (item.precio || item.price || 0)) * (item.quantity || 1)).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Resumen final */}
            <div style={{ backgroundColor: 'rgba(255,193,7,0.05)', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#ccc' }}>Método:</span>
                <span style={{ color: '#FFC107', fontWeight: 'bold' }}>{currentMethod?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: '#ccc' }}>Envío:</span>
                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>{shippingText}</span>
              </div>
              {address && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: '#ccc' }}>Dirección:</span>
                  <span style={{ color: '#fff', fontSize: '11px', maxWidth: '200px', textAlign: 'right' }}>{address}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255,193,7,0.2)', fontSize: '14px' }}>
                <strong style={{ color: '#FFC107' }}>Total:</strong>
                <strong style={{ color: '#FFC107' }}>${total.toLocaleString()}</strong>
              </div>
            </div>

            {/* Botones Paso 2 */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleBack} style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', border: '1px solid #666', borderRadius: '8px', color: '#CBD5E1', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>← Volver</button>
              <button onClick={onConfirm} disabled={isProcessing || (isUpfront && !receiptFile)} style={{ flex: 1, padding: '8px', backgroundColor: (isProcessing || (isUpfront && !receiptFile)) ? '#555' : '#FFC107', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', cursor: (isProcessing || (isUpfront && !receiptFile)) ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: isProcessing ? 0.7 : 1 }}>
                {isProcessing ? 'Procesando...' : 'Confirmar Compra'}
              </button>
            </div>

          </>
        )}
      </div>
      
    </div>
  );
};

export default CheckoutModal;
