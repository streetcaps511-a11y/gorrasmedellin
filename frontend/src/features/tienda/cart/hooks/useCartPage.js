/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useCart } from '../../../shared/contexts';
import { PAYMENT_METHODS } from '../components/CheckoutModal';
import * as cartApi from '../services/cartApi';

export const useCartPage = () => {
  const { user } = useAuth();
  const { 
    cartItems, 
    addToCart,
    updateQuantity: updateCartQuantity, 
    removeFromCart: removeFromCartContext, 
    clearCart,
    cartTotal: total
  } = useCart();
  const subtotal = total;

  const [centerAlert, setCenterAlert] = useState({ visible: false, message: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ id: null, talla: null });
  const [productToDeleteName, setProductToDeleteName] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [deliveryType, setDeliveryType] = useState('envio');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  
  const navigate = useNavigate();

  // Texto dinámico de envío
  const getShippingText = () => {
    if (deliveryType === 'recoger') return 'no aplica (recogida)';
    if (!selectedPaymentMethod) return '';
    const method = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod);
    if (method?.group === 'upfront') return 'no incluido';
    if (method?.group === 'delivery') return 'al recibir (efectivo)';
    return '';
  };

  const handleRemoveFromCart = (productId, talla, productName) => {
    setItemToDelete({ id: productId, talla });
    setProductToDeleteName(`${productName}${talla ? ` (${talla})` : ''}`);
    setShowDeleteConfirm(true);
  };

  const confirmRemoveFromCart = () => {
    removeFromCartContext(itemToDelete.id, itemToDelete.talla);
    setShowDeleteConfirm(false);
    setItemToDelete({ id: null, talla: null });
    setProductToDeleteName('');
    setCenterAlert({ visible: true, message: 'Producto eliminado con éxito' });
  };

  const getStockForSize = (item) => {
    try {
      const rawStock = item.tallasStock || item.tallas_stock;
      const globalStock = parseInt(item.stock || 0);

      if (!rawStock) return globalStock;
      const stockArray = Array.isArray(rawStock) 
        ? rawStock 
        : (typeof rawStock === 'string' ? JSON.parse(rawStock) : []);
      
      if (!Array.isArray(stockArray) || stockArray.length === 0) return globalStock;

      const found = stockArray.find(s => 
        String(s.talla || '').trim().toLowerCase() === String(item.talla || '').trim().toLowerCase()
      );
      if (found) return parseInt(found.cantidad) || 0;
      return 0;
    } catch {
      return parseInt(item.stock) || 0;
    }
  };

  const updateQuantity = (productId, talla, change) => {
    const item = cartItems.find(i => String(i.id) === String(productId) && String(i.talla) === String(talla));
    if (item) {
      const stock = getStockForSize(item);
      const currentQty = parseInt(item.quantity) || 1;
      let newQty = currentQty + change;
      
      if (newQty > stock) {
        newQty = stock;
        setCenterAlert({ visible: true, message: `Solo hay ${stock} unidades disponibles de esta talla` });
      }
      
      if (newQty < 1) newQty = 1;
      updateCartQuantity(productId, talla, newQty);
    }
  };

  const handleManualQuantity = (productId, talla, val) => {
    const item = cartItems.find(i => String(i.id) === String(productId) && String(i.talla) === String(talla));
    const raw = parseInt(val, 10);
    let newQty = (Number.isNaN(raw) || raw < 1) ? 1 : raw;
    
    if (item) {
      const stock = getStockForSize(item);
      if (newQty > stock) {
        newQty = stock;
        setCenterAlert({ visible: true, message: `Solo hay ${stock} unidades disponibles de esta talla` });
      }
    }
    
    updateCartQuantity(productId, talla, newQty);
  };

  const handleClearCart = () => setShowClearConfirm(true);

  const confirmClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
    setCenterAlert({ visible: true, message: 'Carrito vaciado con éxito' });
  };

  const getImageUrl = (item) => {
    if (item.imagen && item.imagen.trim() !== '') return item.imagen;
    if (item.imagenes?.[0]) return item.imagenes[0];
    if (item.image && item.image.trim() !== '') return item.image;
    return 'https://via.placeholder.com/80x80/1E293B/FFC107?text=GM';
  };

  const getProductName = (item) => item.nombre?.trim() || item.name?.trim() || 'Producto sin nombre';
  const getProductPrice = (item) => getPriceInfo(item).currentPrice;

  const getPriceInfo = (item) => {
    const qty = parseInt(item.quantity) || 1;
    
    // Fallbacks para nombres de campos
    const basePrice = parseFloat(item.precioNormal || item.precio_normal || item.precio || 0);
    const offerPrice = (item.precioOferta !== undefined && item.precioOferta !== null) 
      ? parseFloat(item.precioOferta) 
      : (item.precio_descuento ? parseFloat(item.precio_descuento) : null);
    
    const isOfferActive = !!(item.enOfertaVenta || item.oferta || item.has_discount || item.is_oferta);
    const retailPrice = isOfferActive && offerPrice ? offerPrice : basePrice;

    // Precios Mayoristas
    const p6 = parseFloat(item.precio_mayorista6 || item.precioMayorista6 || 0);
    const p80 = parseFloat(item.precio_mayorista80 || item.precioMayorista80 || 0);

    if (qty >= 80 && p80 > 0) {
      return {
        currentPrice: p80,
        originalPrice: basePrice,
        isWholesale: true,
        wholesaleType: '80+'
      };
    }
    if (qty >= 6 && p6 > 0) {
      return {
        currentPrice: p6,
        originalPrice: basePrice,
        isWholesale: true,
        wholesaleType: '6+'
      };
    }
    
    return {
      currentPrice: retailPrice,
      originalPrice: basePrice,
      isWholesale: false,
      wholesaleType: null
    };
  };

  const getProductCategory = (item) => {
    const raw = item.categoria || item.categoria_nombre || item.category || item.categoriaData?.nombre || item.tipo;
    if (typeof raw === 'string' && raw.trim() && raw.toLowerCase() !== 'sin categoría') {
      return raw.trim();
    }
    
    // Deducir por nombre si falla lo anterior
    const name = (item.nombre || item.name || item.nombreCompleto || '').toLowerCase();
    if (name.includes('yankees') || name.includes('ny ') || name.includes(' ny') || name.includes('beisbolera')) return 'Beisbolera';
    if (name.includes('monastery')) return 'Monastery';
    if (name.includes('nike')) return 'Nike';
    if (name.includes('jordan')) return 'Jordan';
    if (name.includes('goorin') || name.includes('animal')) return 'Goorin Bros';
    if (name.includes('classic')) return 'Clásica';
    
    return 'Gorra';
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/80x80/1E293B/FFC107?text=GM';
    e.target.alt = 'Imagen no disponible';
  };

  const handleFinishPurchase = async () => {
    setIsProcessing(true); // Mostrar que estamos cargando datos desde el inicio
    // 🔥 AUTO-SINCRO: Antes de proceder, intentamos refrescar la data de los productos para asegurar stock actualizado
    try {
      if (cartItems.length > 0) {
        // Ejecutamos en paralelo para máxima velocidad
        await Promise.all(cartItems.map(async (item) => {
          try {
            const res = await cartApi.getProductoById(item.id);
            const p = res.data?.data;
            if (p) {
              const freshItem = {
                ...item,
                tallasStock: p.tallasStock || p.TallasStock || [],
                categoria: p.categoria || p.Categoria || p.categoria_nombre || 'Gorra'
              };
              addToCart({ ...freshItem, quantity: 0 }); // qty 0 solo actualiza metadata
            }
          } catch (e) {
            // Silencio intencional para un item individual
          }
        }));
      }
    } catch (e) {
      console.warn("No se pudo sincronizar el stock antes de pagar:", e);
    }

    // ⚠️ VALIDACIÓN DE STOCK REAL ANTES DE PASAR AL CHECKOUT
    const outOfStockItems = cartItems.filter(item => {
      const stockAvailable = getStockForSize(item);
      return item.quantity > stockAvailable;
    });

    if (outOfStockItems.length > 0) {
      setIsProcessing(false);
      const names = outOfStockItems.map(i => getProductName(i)).join(', ');
      setCenterAlert({ 
        visible: true, 
        message: `⚠️ Stock insuficiente para: ${names}. Hay productos que se han agotado o tienen menos unidades disponibles de las solicitadas. Por favor, revisa tu carrito.` 
      });
      return;
    }

    if (!user) {
      setIsProcessing(false); 
      navigate('/login');
      return;
    }
    
    // Ya está en true desde el inicio
    try {
      // 🔥 OBTENER DATOS DIRECTO DE LA BASE DE DATOS
      const response = await cartApi.getMiPerfil();
      const dbProfile = response.data?.data || {};

      // Lista de todas las variaciones posibles según la BD
      const possibleAddresses = [
        dbProfile.direccion,
        dbProfile.Direccion,
        dbProfile.address,
        dbProfile.address_line,
        user.direccion // Respaldo si algo falla
      ];

      // Buscar la primera que tenga contenido real
      const dbAddress = possibleAddresses.find(a => a && typeof a === 'string' && a.trim() !== '') || '';
      const dbPhone = dbProfile.telefono || dbProfile.Telefono || dbProfile.Teléfono || user.telefono || user.Telefono || user.Teléfono || '';

      console.log("📍 Datos recuperados DIRECTO de la BD:", { dbAddress, dbPhone });
      setDeliveryAddress(dbAddress);
      
      // Aseguramos que el teléfono se guarde en el objeto usuario para esta sesión
      user.telefono_db = dbPhone; 
      user.telefono = dbPhone; // También sobreescribimos el estándar por si acaso
    } catch (err) {
      console.warn("⚠️ No se pudo consultar los datos en vivo de la BD:", err);
      setDeliveryAddress(user.direccion || '');
    } finally {
      setIsProcessing(false);
      setSelectedPaymentMethod('');
      setReceiptFile(null);
      setShowCheckout(true);
    }
  };

  const confirmPurchaseFromCheckout = async () => {
    setIsProcessing(true);
    
    try {
      // 📸 CONVERTIR COMPROBANTE A BASE64 SI EXISTE
      let base64Receipt = null;
      if (receiptFile) {
        const fileToBase64 = (file) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
        base64Receipt = await fileToBase64(receiptFile);
      }

      // 1. Preparar datos para el backend
      const orderPayload = {
        idCliente: user.IdCliente || user.idCliente || user.id, // 🔥 USAR ID DE CLIENTE REAL
        metodoPago: selectedPaymentMethod || 'Efectivo',
        direccionEnvio: deliveryType === 'recoger' ? 'RECOGER EN LOCAL' : deliveryAddress,
        tipoEntrega: deliveryType,
        comprobante: base64Receipt, // 🔥 NUEVO: Enviamos la foto como base64
        productos: cartItems.map(item => ({
          idProducto: item.id || item.IdProducto,
          cantidad: item.quantity || 1,
          talla: item.talla || item.color,
          precio: getProductPrice(item)
        }))
      };

      // 2. Llamada real a la API
      const response = await cartApi.createPedido(orderPayload);
      const nuevaVenta = response.data?.data || response.data || {};

      // 3. Generar factura visual para el cliente
      const invoice = {
        invoiceNumber: nuevaVenta.id?.toString() || Date.now().toString(),
        date: new Date().toLocaleDateString('es-ES'),
        customerName: user.nombre || user.Nombre || 'Consumidor Final',
        customerEmail: user.Correo || user.email || 'cliente@anonimo.com',
        customerAddress: deliveryType === 'recoger' ? 'Recogida en local' : (deliveryAddress || 'No especificada'),
        customerPhone: user.telefono_db || user.telefono || user.Telefono || user.Teléfono || 'No especificado',
        items: cartItems.map(item => ({
          name: getProductName(item),
          quantity: item.quantity || 1,
          price: getProductPrice(item)
        })),
        subtotal: subtotal,
        shipping: getShippingText(),
        total: total
      };

      setInvoiceData(invoice);
      setShowCheckout(false);
      setShowInvoice(true);
    } catch (error) {
      console.error('Error al procesar compra:', error);
      const backendMsg = error.response?.data?.message;
      setCenterAlert({ 
        visible: true, 
        message: backendMsg || 'No se pudo procesar la compra. Revise su stock o conexión.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelCheckout = () => {
    setShowCheckout(false);
  };

  const closeInvoice = () => {
    setShowInvoice(false);
    setShowFinalMessage(true);
  };

  const closeFinalMessage = () => {
    setShowFinalMessage(false);
    clearCart();
  };

  return {
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
    setCenterAlert,
    setShowClearConfirm,
    setShowDeleteConfirm,
    setSelectedDetailProduct,
    setSelectedPaymentMethod,
    setDeliveryType,
    setDeliveryAddress,
    setReceiptFile,
    handleRemoveFromCart,
    confirmRemoveFromCart,
    updateQuantity,
    handleManualQuantity, // 🔥 NUEVO 
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
  };
};
