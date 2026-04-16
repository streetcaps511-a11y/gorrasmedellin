import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAllProducts, getCategorias } from "../services/categoriaApi";
import { useCart } from "../../../shared/contexts";

export const BULK_MIN_QTY = 6;
export const BULK_DISCOUNT = 0.1;

/* =========================
   HELPERS
   ========================= */
export const clampRating = (r) => {
  const n = Number(r);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(5, n));
};

export const getRatingFromProduct = (p) =>
  clampRating(p?.rating) ??
  clampRating(p?.calificacion) ??
  clampRating(p?.stars) ??
  clampRating(p?.score) ??
  null;

export const normalizeSizes = (product) => {
  const t = product?.tallas;
  if (!t) return [];
  if (Array.isArray(t))
    return t.filter(Boolean).map((x) => String(x).trim()).filter(Boolean);
  if (typeof t === "string")
    return t.split(",").map((s) => s.trim()).filter(Boolean);
  if (typeof t === "object") return Object.keys(t);
  return [];
};

export const safeImg = (product) => {
  const first =
    product?.imagenes?.[0]?.trim?.() ||
    product?.imagen?.trim?.() ||
    "https://via.placeholder.com/800x800?text=Sin+Imagen";
  return first;
};

export const useCategoriaDetalle = () => {
  const { nombreCategoria } = useParams();
  const { addToCart } = useCart();
  const [productos, setProductos] = useState([]);
  const [descripcionCategoria, setDescripcionCategoria] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeError, setShowSizeError] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilter = async () => {
      setLoading(true);
      try {
        const categoria = decodeURIComponent(nombreCategoria).toLowerCase();

        // Obtener descripción de la categoría
        const catRes = await getCategorias();
        const allCats = catRes.data?.data || catRes.data || [];
        const currentCat = allCats.find(c => c.nombre?.toLowerCase() === categoria);
        if (currentCat) {
          setDescripcionCategoria(currentCat.descripcion || "");
        }

        const res = await getAllProducts();
        const allProducts = res.data?.data?.products || [];
        const filtrados = allProducts.filter(
          (p) => p.categoria_nombre?.toLowerCase() === categoria && p.is_active !== false
        ).map(p => ({
            id: p.id_producto,
            nombre: p.nombre,
            categoria: p.categoria_nombre || p.categoria || p.categoriaData?.nombre || 'Gorra',
            precio: p.precio_normal,
            precioOferta: p.precio_descuento,
            hasDiscount: p.has_discount || false,
            oferta: p.is_oferta || false,
            descripcion: p.descripcion || "",
            tallas: p.tallas || [],
            colores: p.colores || ["Negro"],
            imagenes: p.imagenes || [],
            isFeatured: p.is_featured || false,
            sales: p.sales_count || 0,
            isActive: p.is_active !== undefined ? p.is_active : true,
            stock: p.stock,
            tallasStock: p.tallasStock || [],
            precioMayorista6: p.precio_mayorista6 || 0,
            precioMayorista80: p.precio_mayor_80 || p.precio_mayorista80 || 0,
        }));
        setProductos(filtrados);
      } catch (err) {
        console.error("Error fetching products for category:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndFilter();
    window.scrollTo(0, 0);
  }, [nombreCategoria]);

  const sizesForModal = selectedProduct ? normalizeSizes(selectedProduct) : [];

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize(null);
    setQuantity(0);
    setShowSizeError(false);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedSize(null);
    setQuantity(0);
    setShowSizeError(false);
  };

  const handleSizeSelect = (talla) => {
    if (selectedSize === talla) {
      setSelectedSize(null);
      setQuantity(0);
    } else {
      setSelectedSize(talla);
      setShowSizeError(false);
      setQuantity(0);
    }
  };

  const getStockFor = (product, size) => {
    if (!product || !product.tallasStock || !size) return 0;
    try {
      const dbStock = typeof product.tallasStock === 'string' 
        ? JSON.parse(product.tallasStock) 
        : product.tallasStock;

      if (!dbStock || typeof dbStock !== 'object') return 0;

      if (Array.isArray(dbStock)) {
        const found = dbStock.find(item => String(item.talla || '').toLowerCase() === String(size).toLowerCase());
        return found ? Number(found.cantidad || 0) : 0;
      }

      return Number(dbStock[size] ?? 0);
    } catch {
      return 0;
    }
  };

  const incrementQuantity = () => {
    if (sizesForModal.length > 0 && !selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }
    const max = getStockFor(selectedProduct, selectedSize);
    if (quantity < max) setQuantity((parseInt(quantity) || 0) + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 0) setQuantity((parseInt(quantity) || 0) - 1);
  };

  const handleQuantityInput = (val) => {
    if (val === '' || val === null) {
      setQuantity('');
      return;
    }
    
    // Si empieza con 0 y hay más dígitos, quitamos el 0 a la izquierda
    let cleanVal = val.toString().replace(/^0+/, '');
    if (cleanVal === "") cleanVal = "0";

    const num = parseInt(cleanVal, 10);
    if (isNaN(num)) {
      setQuantity(0);
      return;
    }

    const available = selectedSize 
      ? getStockFor(selectedProduct, selectedSize)
      : 99;
    
    if (num < 0) setQuantity(0);
    else if (num > available) setQuantity(available);
    else setQuantity(num);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    if (sizesForModal.length > 0 && !selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }

    const size = selectedSize || (sizesForModal.length > 0 ? sizesForModal[0] : "Única");
    const q = parseInt(quantity) || 0;
    if (q <= 0) return;

    // Doble chequeo de stock
    const available = selectedSize ? getStockFor(selectedProduct, selectedSize) : 99;
    const finalQty = q > available ? available : q;
    
    if (finalQty <= 0) return;

    // Calcular el precio final según la cantidad
    let finalPrice = selectedProduct.precioOferta && (selectedProduct.hasDiscount || selectedProduct.oferta) 
                    ? Math.round(selectedProduct.precioOferta) 
                    : Math.round(selectedProduct.precio || 0);

    if (finalQty >= 80 && parseFloat(selectedProduct.precioMayorista80) > 0) {
      finalPrice = Math.round(selectedProduct.precioMayorista80);
    } else if (finalQty >= 6 && parseFloat(selectedProduct.precioMayorista6) > 0) {
      finalPrice = Math.round(selectedProduct.precioMayorista6);
    }

    const cartItem = {
      // Identificadores
      id: selectedProduct.id,
      id_producto: selectedProduct.id,
      
      // Info Básica
      nombre: selectedProduct.nombre,
      name: selectedProduct.nombre,
      imagen: safeImg(selectedProduct),
      image: safeImg(selectedProduct),
      categoria: selectedProduct.categoria,
      categoria_nombre: selectedProduct.categoria,
      
      // Precios (Asegurar que existan todos los nombres posibles)
      precio: Math.round(selectedProduct.precio || 0),
      precio_normal: Math.round(selectedProduct.precio || 0),
      precioNormal: Math.round(selectedProduct.precio || 0),
      precioOferta: selectedProduct.precioOferta ? Math.round(selectedProduct.precioOferta) : null,
      precio_descuento: selectedProduct.precioOferta ? Math.round(selectedProduct.precioOferta) : null,
      precioMayorista6: selectedProduct.precioMayorista6,
      precio_mayorista6: selectedProduct.precioMayorista6,
      precioMayorista80: selectedProduct.precioMayorista80,
      precio_mayorista80: selectedProduct.precioMayorista80,
      
      // Flags de Oferta
      enOfertaVenta: !!(selectedProduct.enOfertaVenta || selectedProduct.has_discount || selectedProduct.is_oferta),
      oferta: !!(selectedProduct.enOfertaVenta || selectedProduct.has_discount || selectedProduct.is_oferta),
      has_discount: !!(selectedProduct.enOfertaVenta || selectedProduct.has_discount || selectedProduct.is_oferta),
      
      // Selección actual
      quantity: finalQty,
      talla: size,
      
      // Stock para validación
      tallasStock: selectedProduct.tallasStock || [],
      stock: parseInt(selectedProduct.stock) || 0
    };

    addToCart(cartItem);

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
    closeModal();
  };

  return {
    nombreCategoria: decodeURIComponent(nombreCategoria),
    descripcionCategoria,
    productos,
    selectedProduct,
    selectedSize,
    quantity,
    showSizeError,
    showSuccessToast,
    loading,
    sizesForModal,
    handleOpenModal,
    closeModal,
    handleSizeSelect,
    incrementQuantity,
    decrementQuantity,
    handleQuantityInput,
    handleAddToCart,
    getRatingFromProduct,
    safeImg,
    BULK_MIN_QTY
  };
};
