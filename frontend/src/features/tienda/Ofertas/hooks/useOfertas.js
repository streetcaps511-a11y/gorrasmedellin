import { useState, useEffect, useMemo } from 'react';
import { fetchOffers } from '../services/ofertasApi';
import { useSearch, useCart } from '../../../shared/contexts';
import { NitroCache } from '../../../shared/utils/NitroCache';

const OFERTAS_CACHE_KEY = 'tienda_ofertas';
const OFERTAS_TTL = 3 * 60 * 1000; // 3 minutos

const getCachedOfertas = () => {
  const cached = NitroCache.get(OFERTAS_CACHE_KEY);
  return cached?.data || [];
};

/* =========================
DESCUENTO POR MAYOR
========================= */
const BULK_MIN_QTY = 6;
const BULK_DISCOUNT = 0.1;

const applyBulkDiscount = (cart) => {
  const totalQty = cart.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
  if (totalQty < BULK_MIN_QTY) {
    return cart.map((it) => ({
      ...it,
      price: Number(it.originalPrice ?? it.price),
    }));
  }
  return cart.map((it) => {
    const base = Number(it.originalPrice ?? it.price) || 0;
    const discounted = Math.round(base * (1 - BULK_DISCOUNT));
    return { ...it, originalPrice: base, price: discounted };
  });
};

/* =========================
HELPERS
========================= */
const clampRating = (r) => {
  const n = Number(r);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(5, n));
};

const getRatingFromProduct = (p) =>
  clampRating(p?.rating) ??
  clampRating(p?.calificacion) ??
  clampRating(p?.stars) ??
  clampRating(p?.score) ??
  null;

const normalizeSizes = (product) => {
  const t = product?.tallas;
  if (!t) return [];
  if (Array.isArray(t))
    return t
      .filter(Boolean)
      .map((x) => String(x).trim())
      .filter(Boolean);
  if (typeof t === "string")
    return t
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  if (typeof t === "object") return Object.keys(t).filter((k) => Boolean(t[k]));
  return [];
};

const safeImg = (product) => {
  const first =
    product?.imagenes?.[0]?.trim?.() ||
    product?.imagen?.trim?.() ||
    "https://via.placeholder.com/800x800?text=Sin+Imagen";
  return first;
};

/* =========================
INVENTARIO
========================= */
const INV_KEY = "inv_by_variant_v1";

const readInventory = () => {
  try {
    return JSON.parse(sessionStorage.getItem(INV_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeInventory = (inv) => {
  sessionStorage.setItem(INV_KEY, JSON.stringify(inv));
};

const buildInitialInventoryFromProducts = (products) => {
  const inv = {};
  for (const p of products) {
    const sizes = normalizeSizes(p);
    const pid = String(p.id);
    if (!sizes.length) continue;
    inv[pid] = {};

    // 🔥 PRIORIDAD 1: Usar tallasStock real de la DB si existe
    if (p.tallasStock) {
      try {
        const dbStock = typeof p.tallasStock === 'string' ? JSON.parse(p.tallasStock) : p.tallasStock;
        if (dbStock && typeof dbStock === 'object' && !Array.isArray(dbStock)) {
          sizes.forEach(s => {
            inv[pid][s] = Number(dbStock[s] ?? 0);
          });
          continue; // Saltar a siguiente producto
        }
      } catch (e) {
        console.warn("Error parseando tallasStock real:", e);
      }
    }

    // PRIORIDAD 2: Reparto proporcional si no hay datos reales
    const total = Math.max(0, Number(p.stock ?? 0));
    const totalSafe = Number.isFinite(total) ? total : 0;
    const baseTotal = totalSafe > 0 ? totalSafe : 12;
    const per = Math.floor(baseTotal / sizes.length);
    let rem = baseTotal - per * sizes.length;
    for (const s of sizes) {
      const add = rem > 0 ? 1 : 0;
      inv[pid][s] = Math.max(0, per + add);
      if (rem > 0) rem -= 1;
    }
  }
  return inv;
};

const ensureInventory = (products) => {
  const current = readInventory();
  const built = buildInitialInventoryFromProducts(products);
  if (!Object.keys(current).length) {
    writeInventory(built);
    return built;
  }
  let changed = false;
  const merged = { ...current };
  for (const pid of Object.keys(built)) {
    if (!merged[pid]) {
      merged[pid] = built[pid];
      changed = true;
      continue;
    }
    for (const talla of Object.keys(built[pid])) {
      if (typeof merged[pid][talla] !== "number") {
        merged[pid][talla] = built[pid][talla];
        changed = true;
      }
    }
  }
  if (changed) writeInventory(merged);
  return merged;
};

const getAvailableFor = (inv, productId, talla) => {
  const pid = String(productId);
  return Math.max(0, Number(inv?.[pid]?.[talla] ?? 0));
};

const decreaseInventory = (inv, productId, talla, qty) => {
  const pid = String(productId);
  const next = { ...inv, [pid]: { ...(inv[pid] || {}) } };
  const current = getAvailableFor(inv, productId, talla);
  next[pid][talla] = Math.max(0, current - Math.max(0, qty));
  return next;
};

export const useOfertas = () => {
  const { addToCart } = useCart();
  const { searchTerm, setSearchTerm: setGlobalSearch } = useSearch();
  const [allProducts, setAllProducts] = useState(() => getCachedOfertas());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inventory, setInventory] = useState({});
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);
  // Solo muestra loading si no hay caché disponible
  const [loading, setLoading] = useState(() => getCachedOfertas().length === 0);

  // FILTROS
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Si hay caché fresco, no hacemos el fetch
    if (NitroCache.isFresh(OFERTAS_CACHE_KEY, OFERTAS_TTL)) {
      const cached = getCachedOfertas();
      if (cached.length > 0) {
        setAllProducts(cached);
        setInventory(ensureInventory(cached));
        setLoading(false);
        return;
      }
    }
    
    const loadOffers = async () => {
      try {
        setLoading(true);
        const products = await fetchOffers();
        const mapped = products.map(p => ({
          id: p.id_producto,
          nombre: p.nombre,
          categoria: p.categoria_nombre || p.categoria || p.categoriaData?.nombre || 'Oferta',
          precio: p.precio_normal,
          precioOferta: p.precio_descuento,
          hasDiscount: p.has_discount || false,
          oferta: p.is_oferta || false,
          descripcion: p.descripcion || "",
          tallas: p.tallas || [],
          colores: p.colores || ["Negro"],
          imagenes: p.imagenes || [],
          isFeatured: p.is_featured || false,
          destacado: p.is_featured || false,
          sales: p.sales_count || 0,
          isActive: p.is_active !== undefined ? p.is_active : true,
          stock: p.stock,
          tallasStock: p.tallasStock || [],
          precioMayorista6: p.precio_mayor_6 || p.precio_mayorista6 || 0,
          precioMayorista80: p.precio_mayor_80 || p.precio_mayorista80 || 0,
        }));
        setAllProducts(mapped);
        NitroCache.set(OFERTAS_CACHE_KEY, mapped); // 💾 Guardar en caché
        const inv = ensureInventory(mapped);
        setInventory(inv);
      } catch (err) {
        if (err.response?.status === 401) {
          // Token faltante o expirado, pero no lanzamos error ruidoso en consola para invitados
          setAllProducts([]);
        } else {
          console.error("Error fetching offers:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    loadOffers();
  }, []);

  const ofertas = useMemo(
    () => allProducts.filter((p) => (p.hasDiscount || p.oferta) && p.isActive !== false),
    [allProducts]
  );

  const searchFiltered = useMemo(() => {
    const hasSearch = searchTerm.trim().length > 0;
    const hasFilters = selectedColors.length > 0 || selectedSizes.length > 0 || selectedCategories.length > 0;
    
    if (!hasSearch && !hasFilters) return null;

    const normalize = (str) =>
      (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    const query = normalize(searchTerm);

    return ofertas.filter((p) => {
      // 1. Texto search
      const matchesSearch = !hasSearch || (
        normalize(p.nombre).includes(query) ||
        normalize(p.categoria).includes(query) ||
        normalize(p.descripcion).includes(query)
      );

      // 2. Colores
      const pColores = Array.isArray(p.colores) ? p.colores : [p.colores || 'Negro'];
      const matchesColor = selectedColors.length === 0 || 
        selectedColors.some(c => pColores.some(pc => String(pc).toLowerCase() === c.toLowerCase()));

      // 3. Tallas
      const pTallas = normalizeSizes(p);
      const matchesSize = selectedSizes.length === 0 || 
        selectedSizes.some(s => pTallas.some(pt => String(pt).toLowerCase() === s.toLowerCase()));

      // 4. Categorías
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.some(cat => String(p.categoria).toLowerCase() === cat.toLowerCase());

      return matchesSearch && matchesColor && matchesSize && matchesCategory;
    });
  }, [searchTerm, ofertas, selectedColors, selectedSizes, selectedCategories]);

  // VALORES ÚNICOS PARA FILTROS
  const allAvailableFilters = useMemo(() => {
    const categories = new Set();
    const colors = new Set();
    const sizes = new Set();

    ofertas.forEach(p => {
      if (p.categoria) categories.add(p.categoria);
      const pColores = Array.isArray(p.colores) ? p.colores : [p.colores || 'Negro'];
      pColores.forEach(c => colors.add(c));
      const pTallas = normalizeSizes(p);
      pTallas.forEach(s => sizes.add(s));
    });

    return {
      categories: Array.from(categories).sort(),
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort()
    };
  }, [ofertas]);

  const toggleFilter = (type, value) => {
    const setters = {
      color: [selectedColors, setSelectedColors],
      size: [selectedSizes, setSelectedSizes],
      category: [selectedCategories, setSelectedCategories]
    };
    if (!setters[type]) return;
    const [current, set] = setters[type];
    if (current.includes(value)) {
      set(current.filter(v => v !== value));
    } else {
      set([...current, value]);
    }
  };

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedCategories([]);
    setGlobalSearch("");
  };

  const addQuickToCart = (product, size, qty) => {
    if (!size) return;
    
    // Calcular el precio final según la cantidad
    const q = parseInt(qty) || 0;
    if (q <= 0) return;

    let finalPrice = product.precioOferta && (product.hasDiscount || product.oferta) 
                    ? Math.round(product.precioOferta) 
                    : Math.round(product.precio || 0);

    if (q >= 80 && parseFloat(product.precioMayorista80) > 0) {
      finalPrice = Math.round(product.precioMayorista80);
    } else if (q >= 6 && parseFloat(product.precioMayorista6) > 0) {
      finalPrice = Math.round(product.precioMayorista6);
    }

    const cartItem = {
      // Identificadores
      id: product.id,
      id_producto: product.id,
      
      // Info Básica
      nombre: product.nombre,
      name: product.nombre,
      imagen: safeImg(product),
      image: safeImg(product),
      categoria: product.categoria,
      categoria_nombre: product.categoria,
      
      // Precios (Asegurar que existan todos los nombres posibles)
      precio: Math.round(product.precioVenta || product.precio || 0),
      precio_normal: Math.round(product.precioVenta || product.precio || 0),
      precioNormal: Math.round(product.precioVenta || product.precio || 0),
      precioOferta: product.precioOferta ? Math.round(product.precioOferta) : null,
      precio_descuento: product.precioOferta ? Math.round(product.precioOferta) : null,
      precioMayorista6: product.precioMayorista6,
      precio_mayorista6: product.precioMayorista6,
      precioMayorista80: product.precioMayorista80,
      precio_mayorista80: product.precioMayorista80,
      
      // Flags de Oferta
      enOfertaVenta: !!(product.enOfertaVenta || product.has_discount || product.oferta),
      oferta: !!(product.enOfertaVenta || product.has_discount || product.oferta),
      has_discount: !!(product.enOfertaVenta || product.has_discount || product.oferta),
      
      // Selección actual
      quantity: q,
      talla: size,
      
      // Stock para validación
      tallasStock: product.tallasStock || [],
      stock: parseInt(product.stock) || 0
    };

    addToCart(cartItem);

    // Actualizar inventario local para feedback inmediato en el UI si es necesario
    const nextInv = decreaseInventory(inventory, product.id, size, q);
    setInventory(nextInv);
    writeInventory(nextInv);

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);

    closeModal();
  };

  const openModal = (product) => {
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
      ? getAvailableFor(inventory, selectedProduct?.id, selectedSize)
      : 99;
    
    if (num < 0) setQuantity(0);
    else if (num > available) setQuantity(available);
    else setQuantity(num);
  };

  const incrementQuantity = () => {
    const qty = parseInt(quantity) || 0;
    const available = selectedSize
      ? getAvailableFor(inventory, selectedProduct?.id, selectedSize)
      : 99;
    if (qty < available) {
      setQuantity(qty + 1);
    }
  };

  const decrementQuantity = () => {
    const qty = parseInt(quantity) || 0;
    if (qty > 0) {
      setQuantity(qty - 1);
    }
  };

  const handleModalAddToCart = () => {
    if (!selectedProduct) return;
    const sizes = normalizeSizes(selectedProduct);
    if (sizes.length > 0 && !selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }

    const size = selectedSize ? selectedSize : (sizes[0] || "Única");
    const q = parseInt(quantity) || 0;
    if (q <= 0) return;

    // Doble chequeo de stock
    const available = selectedSize ? getAvailableFor(inventory, selectedProduct?.id, selectedSize) : 99;
    const finalQty = q > available ? available : q;
    
    if (finalQty <= 0) return;

    addQuickToCart(selectedProduct, size, finalQty);
  };

  return {
    loading,
    ofertas,
    searchFiltered,
    searchTerm,
    setGlobalSearch,
    selectedProduct,
    inventory,
    getAvailableFor,
    selectedSize,
    quantity,
    showSuccessToast,
    showSizeError,
    openModal,
    closeModal,
    handleSizeSelect,
    incrementQuantity,
    decrementQuantity,
    handleModalAddToCart,
    handleQuantityInput,
    normalizeSizes,
    safeImg,
    getRatingFromProduct,
    BULK_MIN_QTY,
    // Filtros
    selectedColors,
    selectedSizes,
    selectedCategories,
    allAvailableFilters,
    toggleFilter,
    clearFilters
  };
};
