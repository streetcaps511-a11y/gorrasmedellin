import '../styles/Cart.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaTimes, FaArrowLeft, FaWhatsapp } from 'react-icons/fa';

// Componentes importados
import InvoiceModal from '../components/InvoiceModal';
import ConfirmPurchaseModal from '../components/ConfirmPurchaseModal';
import CustomConfirm from '../components/CustomConfirm';
import CenterAlert from '../components/CenterAlert';
import CheckoutModal, { PAYMENT_METHODS } from '../components/CheckoutModal';



import { useCartPage } from '../hooks/useCartPage';

// ✨ COMPONENTE PRINCIPAL
const Cart = () => {
  const {
    user,
    cartItems,
    total,
    subtotal,
    centerAlert,
    isProcessing,
    showClearConfirm,
    showDeleteConfirm,
    productToDeleteName,
    showInvoice,
    showCheckout,
    invoiceData,
    selectedPaymentMethod,
    deliveryType,
    deliveryAddress,
    receiptFile,
    selectedDetailProduct,
    showFinalMessage,
    setShowClearConfirm,
    setShowDeleteConfirm,
    setSelectedDetailProduct,
    setSelectedPaymentMethod,
    setDeliveryType,
    setDeliveryAddress,
    setReceiptFile,
    setCenterAlert,
    handleRemoveFromCart,
    confirmRemoveFromCart,
    updateQuantity,
    handleManualQuantity,
    handleClearCart,
    confirmClearCart,
    getImageUrl,
    getProductName,
    getProductPrice,
    getPriceInfo,
    getProductCategory,
    getStockForSize,
    handleImageError,
    handleFinishPurchase,
    confirmPurchaseFromCheckout,
    cancelCheckout,
    closeInvoice,
    closeFinalMessage,
    getShippingText
  } = useCartPage();

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(cartItems.length / itemsPerPage);
  const currentItems = cartItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Asegurar que si borramos el último item de una página, regresemos a la anterior
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [cartItems.length, totalPages, currentPage]);

  // Renderizado: Carrito vacío
  if (cartItems.length === 0) {
    return (
      <div className="page-container" style={{ background: '#0f172a' }}>
        <section style={{
          background: "#1e293b",
          padding: "100px 20px 70px",
          textAlign: "center",
          borderBottomLeftRadius: "30px",
          borderBottomRightRadius: "30px",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: "-40px", left: 0, width: "100%", height: "80px", background: "#1e293b" }} />
          <h1 style={{ color: "white", fontSize: "3rem", fontWeight: "700", marginBottom: "20px" }}>🛒 Carrito de Compras</h1>
          <p style={{ color: "#cbd5e1", fontSize: "1.2rem", maxWidth: "900px", margin: "0 auto", lineHeight: "1.6" }}>
            Gestiona todos tus productos seleccionados en un solo lugar.
          </p>
          <div style={{ position: "absolute", bottom: "-40px", left: 0, width: "100%", height: "80px", background: "#0f172a", borderTopLeftRadius: "50% 80%", borderTopRightRadius: "50% 80%" }} />
        </section>

        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '40px 20px',
          backgroundColor: '#0f172a'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '30px 20px',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{
              fontSize: '40px',
              color: '#F5C81B',
              marginBottom: '20px'
            }}>
              🛒
            </div>
            <h2 style={{
              color: '#F5C81B',
              fontSize: '24px',
              marginBottom: '15px',
              fontWeight: 'bold'
            }}>
              Tu carrito está vacío
            </h2>
            <p style={{
              color: '#CBD5E1',
              fontSize: '16px',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              Agrega productos desde la tienda para verlos aquí
            </p>
            <Link 
              to="/" 
              style={{
                backgroundColor: '#F5C81B',
                padding: '12px 24px',
                color: '#000',
                fontWeight: 'bold',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '16px',
                border: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <FaShoppingCart /> Ir a la Tienda
            </Link>
          </div>
        </div>

      </div>
    );
  }

  // Renderizado: Carrito con productos
  return (
    <div className="page-container" style={{ background: '#0b0f1a', minHeight: '100vh' }}>
      <CustomConfirm 
        isOpen={showClearConfirm} 
        onConfirm={confirmClearCart} 
        onCancel={() => setShowClearConfirm(false)} 
        title="¿Vaciar carrito?" 
        message="¿Estás seguro que deseas eliminar todos los productos del carrito? Esta acción no se puede deshacer." 
        confirmText="Vaciar Carrito" 
        cancelText="Cancelar" 
        type="warning" 
      />
      
      <CustomConfirm 
        isOpen={showDeleteConfirm} 
        onConfirm={confirmRemoveFromCart} 
        onCancel={() => { 
          setShowDeleteConfirm(false); 
          setProductToDeleteName(''); 
        }} 
        title="¿Eliminar producto?" 
        message="¿Estás seguro que deseas eliminar este producto del carrito?" 
        productName={productToDeleteName} 
        confirmText="Eliminar" 
        cancelText="Cancelar" 
        type="warning" 
      />
      
      <CenterAlert 
        message={centerAlert.message} 
        isVisible={centerAlert.visible} 
        onClose={() => setCenterAlert({ visible: false, message: '' })} 
      />
      
      <CheckoutModal
        isOpen={showCheckout}
        onClose={cancelCheckout}
        onConfirm={confirmPurchaseFromCheckout}
        total={total}
        subtotal={subtotal}
        selectedMethod={selectedPaymentMethod}
        setSelectedMethod={setSelectedPaymentMethod}
        deliveryType={deliveryType}
        setDeliveryType={setDeliveryType}
        address={deliveryAddress}
        setAddress={setDeliveryAddress}
        receiptFile={receiptFile}
        setReceiptFile={setReceiptFile}
        isProcessing={isProcessing}
        cartItems={cartItems}
        getProductName={getProductName}
        getProductPrice={getProductPrice}
      />
      
      {showInvoice && invoiceData && (
        <InvoiceModal 
          isOpen={showInvoice} 
          onClose={closeInvoice} 
          invoiceData={invoiceData} 
        />
      )}

      {showFinalMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.88)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10001, padding: '15px' }}>
          <div style={{ background: '#1e293b', color: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px', border: '1px solid #F5C81B', padding: '30px', textAlign: 'center' }}>
            <div style={{ fontSize: '50px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ color: '#F5C81B', fontSize: '18px', fontWeight: 'bold', margin: '0 0 14px 0' }}>Pedido registrado</h3>
            <p style={{ color: '#CBD5E1', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
              Su pedido se encuentra en espera de su revisión. Puede consultar los detalles en su perfil.
            </p>
            <button onClick={closeFinalMessage} style={{ padding: '12px 40px', backgroundColor: '#F5C81B', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'all 0.3s ease' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {selectedDetailProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '15px' }} onClick={() => setSelectedDetailProduct(null)}>
          <div style={{ background: '#1e293b', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid #F5C81B', padding: '0', position: 'relative', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedDetailProduct(null)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#F5C81B', fontSize: '18px', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
              <FaTimes />
            </button>
            <img src={getImageUrl(selectedDetailProduct)} alt={getProductName(selectedDetailProduct)} style={{ width: '100%', height: '320px', objectFit: 'cover' }} onError={handleImageError} />
            <div style={{ padding: '24px' }}>
              <h2 style={{ color: '#F5C81B', fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0' }}>{getProductName(selectedDetailProduct)}</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#CBD5E1', backgroundColor: 'rgba(51, 65, 85, 0.7)', padding: '4px 10px', borderRadius: '8px' }}>{getProductCategory(selectedDetailProduct)}</span>
                {selectedDetailProduct.color && <span style={{ fontSize: '12px', color: '#CBD5E1', backgroundColor: 'rgba(51, 65, 85, 0.7)', padding: '4px 10px', borderRadius: '8px' }}>Color: {selectedDetailProduct.color}</span>}
                {selectedDetailProduct.talla && <span style={{ fontSize: '12px', color: '#CBD5E1', backgroundColor: 'rgba(51, 65, 85, 0.7)', padding: '4px 10px', borderRadius: '8px' }}>Talla: {selectedDetailProduct.talla}</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>Cantidad en carrito:</span>
                <span style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>{selectedDetailProduct.quantity || 1}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>Precio unitario:</span>
                <span style={{ color: '#F5C81B', fontSize: '20px', fontWeight: 'bold' }}>${getProductPrice(selectedDetailProduct).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TÍTULO DEL CARRITO */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '5px 20px 0', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '8px' }}>
          <FaShoppingCart style={{ color: '#F5C81B', fontSize: '32px' }} />
          <h1 style={{ color: '#FFFFFF', fontSize: '32px', fontWeight: '800', margin: 0 }}>Carrito de Compras</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '16px', margin: '0' }}>Administra tus productos y avanza en tu compra</p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
            
            {/* LISTA DE PRODUCTOS */}
            <div style={{ flex: 1, minWidth: '320px', maxWidth: '750px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#F5C81B', fontSize: '18px', fontWeight: '700', margin: 0 }}>
                  Productos seleccionados ({cartItems.length})
                </h2>
              </div>

              {currentItems.map((item, index) => {
                const precio = getProductPrice(item);
                const quantity = item.quantity || 1;
                const productName = getProductName(item);
                
                return (
                  <div 
                    key={`${index}-${item.id}`} 
                    style={{ 
                      backgroundColor: '#111827', 
                      padding: '12px', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '15px', 
                      marginBottom: '12px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                      border: '1px solid rgba(255,255,255,0.03)'
                    }}
                  >
                    <img 
                      src={getImageUrl(item)} 
                      alt={productName} 
                      style={{ 
                        width: '90px', 
                        height: '90px', 
                        borderRadius: '8px', 
                        objectFit: 'cover', 
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                      }} 
                      onError={handleImageError}
                      onClick={() => setSelectedDetailProduct(item)}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 
                        style={{ margin: '0 0 5px 0', color: '#F5C81B', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => setSelectedDetailProduct(item)}
                      >
                        {productName}
                      </h3>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', color: '#CBD5E1', backgroundColor: 'rgba(51, 65, 85, 0.8)', padding: '2px 6px', borderRadius: '6px' }}>
                          {getProductCategory(item)}
                        </span>
                        {item.talla && (
                          <span style={{ fontSize: '10px', color: '#CBD5E1', backgroundColor: 'rgba(51, 65, 85, 0.8)', padding: '2px 6px', borderRadius: '6px' }}>
                            Talla: {item.talla}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '3px' }}>
                            <button 
                              onClick={() => updateQuantity(item.id, item.talla, -1)} 
                              style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'transparent', border: 'none', color: '#F5C81B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <FaMinus size={10} />
                            </button>
                            <input 
                              type="number"
                              value={item.quantity || 1}
                              onChange={(e) => handleManualQuantity(item.id, item.talla, e.target.value)}
                              style={{ width: '35px', border: 'none', background: 'transparent', color: 'white', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', outline: 'none' }}
                            />
                            <button 
                              onClick={() => updateQuantity(item.id, item.talla, 1)} 
                              disabled={item.quantity >= getStockForSize(item)}
                              style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'transparent', border: 'none', color: item.quantity >= getStockForSize(item) ? '#444' : '#F5C81B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <FaPlus size={10} />
                            </button>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', color: '#F5C81B', fontWeight: 'bold' }}>
                            ${Math.round(getPriceInfo(item).currentPrice).toLocaleString()} c/u
                          </div>
                          <div style={{ fontSize: '18px', color: '#F5C81B', fontWeight: '800', marginTop: '1px' }}>
                            ${(Math.round(getPriceInfo(item).currentPrice) * (item.quantity || 1)).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveFromCart(item.id, item.talla, productName)} 
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '10px', borderRadius: '10px', transition: 'all 0.2s ease' }}
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                );
              })}

              {/* PAGINACIÓN */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px', marginBottom: '30px' }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: '8px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : '#111827', 
                      color: currentPage === 1 ? '#4b5563' : '#F5C81B',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Anterior
                  </button>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
                    Página <span style={{ color: '#F5C81B' }}>{currentPage}</span> de {totalPages}
                  </div>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: '8px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : '#111827', 
                      color: currentPage === totalPages ? '#4b5563' : '#F5C81B',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>

            {/* RESUMEN */}
            <div style={{ width: '350px', minWidth: '320px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '15px' }}>
                <Link to="/" style={{ flex: 1, background: '#111827', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', textDecoration: 'none' }}>
                  <FaArrowLeft size={12} /> Seguir
                </Link>
                <button onClick={handleClearCart} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                  <FaTrash size={12} /> Vaciar
                </button>
              </div>
              
              <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)', boxShadow: '0 4px 25px rgba(0,0,0,0.2)' }}>
                <h2 style={{ color: '#F5C81B', margin: '0 0 20px 0', textAlign: 'center', fontSize: '18px', fontWeight: '800' }}>
                  Resumen del Pedido
                </h2>
                
                <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Productos ({cartItems.length}):</span>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>${subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Envío:</span>
                    <span style={{ color: '#F5C81B', fontSize: '12px', fontStyle: 'italic' }}>{getShippingText()}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', marginBottom: '25px' }}>
                  <strong style={{ color: '#fff' }}>Total:</strong>
                  <strong style={{ color: '#F5C81B' }}>${total.toLocaleString()}</strong>
                </div>

                <button 
                  onClick={handleFinishPurchase}
                  style={{ width: '100%', padding: '16px', backgroundColor: '#F5C81B', border: 'none', borderRadius: '12px', color: '#000', fontWeight: '900', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.3s ease' }}
                >
                  <FaWhatsapp size={20} /> CONTINUAR
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
