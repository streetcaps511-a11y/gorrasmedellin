import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaShoppingCart,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaMinus,
  FaPlus,
  FaCheckCircle,
} from "react-icons/fa";
import "../styles/Home.css";
import "../styles/HomeHero.css";
import "../styles/ProductCard.css";
import { useCart, useSearch } from "../../../shared/contexts";

const BANNER_URL =
  "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1764642176/WhatsApp_Image_2025-12-01_at_9.07.34_PM_a3k3ob.jpg";

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

const RatingStars = ({ value }) => {
  if (value == null) return null;
  const full = Math.floor(value);
  const half = value - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span className="gm-rating" title={`Calificación: ${value}/5`}>
      {Array.from({ length: full }).map((_, i) => (
        <FaStar key={`f-${i}`} />
      ))}
      {half === 1 && <FaStarHalfAlt key="half" />}
      {Array.from({ length: empty }).map((_, i) => (
        <FaRegStar key={`e-${i}`} />
      ))}
    </span>
  );
};

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
  if (typeof t === "object") return Object.keys(t);
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
const buildInitialInventoryFromProducts = (products) => {
  const inv = {};
  for (const p of products) {
    const sizes = normalizeSizes(p);
    const pid = String(p.id);
    if (!sizes.length) continue;
    const total = Math.max(0, Number(p.stock ?? 0));
    const totalSafe = Number.isFinite(total) ? total : 0;
    
    // 🔥 PRIORIDAD 1: Usar tallasStock real de la DB si existe
    if (p.tallasStock) {
      try {
        const dbStock = typeof p.tallasStock === 'string' ? JSON.parse(p.tallasStock) : p.tallasStock;
        
        if (dbStock && typeof dbStock === 'object') {
          inv[pid] = {};
          if (Array.isArray(dbStock)) {
            // Caso Array: [{talla: 'Ajustable', cantidad: 10}]
            dbStock.forEach(item => {
              if (item.talla) inv[pid][item.talla] = Number(item.cantidad || 0);
            });
          } else {
            // Caso Objeto: {"Ajustable": 10}
            sizes.forEach(s => {
              inv[pid][s] = Number(dbStock[s] ?? 0);
            });
          }
          continue;
        }
      } catch (e) {
        console.warn("Error parseando tallasStock real en Home:", e);
      }
    }

    const baseTotal = totalSafe > 0 ? totalSafe : 0;
    const per = Math.floor(baseTotal / sizes.length);
    let rem = baseTotal - per * sizes.length;
    inv[pid] = {};
    for (const s of sizes) {
      const add = rem > 0 ? 1 : 0;
      inv[pid][s] = Math.max(0, per + add);
      if (rem > 0) rem -= 1;
    }
  }
  return inv;
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

/* =========================
COMPONENT
========================= */
import api, { API_BASE_URL } from "../../../shared/services/api";
import ProductModal from '../components/ProductModal';
import { NitroCache } from '../../../shared/utils/NitroCache';

const getCachedProducts = () => {
  const cached = NitroCache.get('home_productos');
  return cached?.data || [];
};

const Home = () => {
  const { addToCart } = useCart();
  const { searchTerm, setSearchTerm } = useSearch();
  const { pathname } = useLocation();
  // ⚡ SIMPLIFICADO: Cargar desde caché SIN delays
  const [initialProducts, setInitialProducts] = useState(() => getCachedProducts());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalImgIndex, setModalImgIndex] = useState(0);
  const [inventory, setInventory] = useState({});
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);
  const [hasFetchedRef] = useState({ current: false }); // Control para evitar double-fetch

  // FETCH A POSTGRESQL (RENDER) - Solo si no tenemos caché
  useEffect(() => {
    const fetchProductos = async () => {
      // Si ya hicimos fetch o tenemos datos, no hacer otra vez
      if (hasFetchedRef.current || initialProducts.length > 0) {
        return;
      }
      hasFetchedRef.current = true;

      try {
        const response = await api.get(`/api/productos`);
        const resData = response.data;
        if (resData.status === 'success' && resData.data.products) {
          const productosDatabase = resData.data.products.map((product) => ({
            id: product.id_producto,
            nombre: product.nombre,
            categoria: product.categoria_nombre || product.categoria || product.categoriaData?.nombre || 'Gorra',
            precio: product.precio_normal,
            precioOferta: product.precio_descuento,
            precioMayorista6: product.precio_mayorista6 || 0,
            precioMayorista80: product.precio_mayorista80 || 0,
            hasDiscount: product.has_discount || false,
            oferta: product.is_oferta || false,
            enOfertaVenta: product.is_oferta || product.has_discount || false,
            descripcion: product.descripcion || "",
            tallas: product.tallas || [],
            colores: product.colores || ["Negro"],
            imagenes: product.imagenes || [],
            isFeatured: product.is_featured || false,
            destacado: product.is_featured || false,
            sales: product.sales_count || 0,
            isActive: product.is_active !== undefined ? product.is_active : true,
            stock: product.stock,
            tallasStock: product.tallasStock || [],
          }));

          setInitialProducts(productosDatabase);
          NitroCache.set('home_productos', productosDatabase);
        }
      } catch (error) {
        console.warn("Error al cargar productos:", error.message);
      }
    };

    fetchProductos();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Cuando lleguen los productos de la BD, construimos el inventario siempre NUEVO
    if (initialProducts.length > 0) {
      const inv = buildInitialInventoryFromProducts(initialProducts);
      setInventory(inv);
    }
  }, [initialProducts]);

  const ofertas = useMemo(
    () =>
      initialProducts
        .filter((p) => (p.hasDiscount || p.oferta) && p.isActive !== false)
        .slice(0, 8),
    [initialProducts]
  );

  const destacados = useMemo(
    () =>
      initialProducts
        .filter((p) => (p.destacado || p.isFeatured) && p.isActive !== false)
        .slice(0, 8),
    [initialProducts]
  );

  const novedades = useMemo(
    () => [...initialProducts].reverse().filter(p => p.isActive !== false).slice(0, 8),
    [initialProducts]
  );

  const monastery = useMemo(
    () => initialProducts.filter(p => p.categoria?.toUpperCase().includes('MONASTERY') && p.isActive !== false).slice(0, 8),
    [initialProducts]
  );

  const nike = useMemo(
    () => initialProducts.filter(p => p.categoria?.toUpperCase().includes('NIKE') && p.isActive !== false).slice(0, 8),
    [initialProducts]
  );

  const masComprados = useMemo(
    () => [...initialProducts]
      .filter(p => p.isActive !== false && (p.sales_count || 0) >= 1)
      .sort((a,b) => (b.sales_count || 0) - (a.sales_count || 0))
      .slice(0, 8),
    [initialProducts]
  );
  
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const normalize = (str) =>
      (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const query = normalize(searchTerm);
    return initialProducts.filter((p) => {
      if (!p.isActive) return false;
      return (
        normalize(p.nombre).includes(query) ||
        normalize(p.categoria).includes(query) ||
        (p.descripcion && normalize(p.descripcion).includes(query))
      );
    });
  }, [searchTerm, initialProducts]);

  const [carouselScrollState, setCarouselScrollState] = useState({
    ofertas: { canScrollLeft: false, canScrollRight: true },
    destacados: { canScrollLeft: false, canScrollRight: true },
    novedades: { canScrollLeft: false, canScrollRight: true },
    monastery: { canScrollLeft: false, canScrollRight: true },
    nike: { canScrollLeft: false, canScrollRight: true },
    masComprados: { canScrollLeft: false, canScrollRight: true },
    allProducts: { canScrollLeft: false, canScrollRight: true },
  });

  const carouselRefs = {
    ofertas: useRef(null),
    destacados: useRef(null),
    novedades: useRef(null),
    monastery: useRef(null),
    nike: useRef(null),
    masComprados: useRef(null),
    allProducts: useRef(null),
  };

  const handleScroll = (id) => {
    const el = carouselRefs[id]?.current;
    if (!el) return;
    
    // Threshold de 10px para ocultar flechas en extremos
    const canScrollLeft = el.scrollLeft > 10;
    const canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 10;
    
    setCarouselScrollState(prev => {
      const current = prev[id] || {};
      if (current.canScrollLeft === canScrollLeft && current.canScrollRight === canScrollRight) {
        return prev;
      }
      return { ...prev, [id]: { canScrollLeft, canScrollRight } };
    });
  };

  useEffect(() => {
    const handleInitialScroll = () => {
      Object.keys(carouselRefs).forEach(id => {
        if (carouselRefs[id].current) handleScroll(id);
      });
    };

    if (initialProducts.length > 0) {
      setTimeout(handleInitialScroll, 500);
      window.addEventListener('resize', handleInitialScroll);
    }
    return () => window.removeEventListener('resize', handleInitialScroll);
  }, [initialProducts]);

  const handleCarouselScroll = (section, direction) => {
    const container = carouselRefs[section].current;
    if (!container) return;
    
    // Calcula el ancho de una card (incluyendo el gap)
    const slot = container.querySelector('.gm-slot');
    if (!slot) return;
    
    const scrollAmount = slot.offsetWidth;
    const currentScroll = container.scrollLeft;
    
    const targetScroll = 
      direction === "left"
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;
        
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
    
    // Forzar actualización de flechas después de un breve delay (aumentado para scroll más lento)
    setTimeout(() => handleScroll(section), 800);
  };

  const addQuickToCart = (product, size, qty) => {
    if (!size) return;
    
    // Calcular el precio final según la cantidad
    const q = parseInt(qty) || 0;
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
      
      // Precios (Estandarizado)
      precio: Math.round(product.precio || 0),
      precio_normal: Math.round(product.precio || 0),
      precioNormal: Math.round(product.precio || 0),
      precioOferta: product.precioOferta ? Math.round(product.precioOferta) : null,
      precio_descuento: product.precioOferta ? Math.round(product.precioOferta) : null,
      precioMayorista6: product.precioMayorista6,
      precio_mayorista6: product.precioOptions?.precioMayorista6 || product.precioMayorista6,
      precioMayorista80: product.precioMayorista80,
      precio_mayorista80: product.precioOptions?.precioMayorista80 || product.precioMayorista80,
      
      // Flags de Oferta
      enOfertaVenta: !!(product.enOfertaVenta || product.hasDiscount || product.oferta),
      oferta: !!(product.enOfertaVenta || product.hasDiscount || product.oferta),
      has_discount: !!(product.enOfertaVenta || product.hasDiscount || product.oferta),
      
      // Selección actual
      quantity: q,
      talla: size,
      
      // Stock para validación (CRITICAL)
      tallasStock: product.tallasStock || [],
      stock: parseInt(product.stock) || 0
    };

    addToCart(cartItem);

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);

    closeModal();
  };

  const ProductCard = ({ product, badge, badgeType }) => {
    const images =
      Array.isArray(product.imagenes) && product.imagenes.filter(Boolean).length
        ? product.imagenes
            .filter(Boolean)
            .map((x) => String(x).trim())
            .filter(Boolean)
            .slice(0, 4)
        : [safeImg(product)];
        
    const [imgIndex, setImgIndex] = useState(0);
    const scrollerRef = React.useRef(null);
    const rating = getRatingFromProduct(product);

    const handleScroll = (e) => {
      const scrollLeft = e.target.scrollLeft;
      const width = e.target.offsetWidth;
      if (width > 0) {
        const newIndex = Math.round(scrollLeft / width);
        if (newIndex !== imgIndex) setImgIndex(newIndex);
      }
    };

    const setIndex = (i) => {
      setImgIndex(i);
      if (scrollerRef.current) {
        const width = scrollerRef.current.offsetWidth;
        scrollerRef.current.scrollTo({ left: i * width, behavior: 'smooth' });
      }
    };

    const handleOpenDetail = () => {
      setSelectedProduct(product);
      setModalImgIndex(0);
      setSelectedSize(null);
      setQuantity(0);
      setShowSizeError(false);
    };

    const handleImgWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.currentTarget.scrollLeft += e.deltaX;
      }
    };

    const isAgotado = Number(product.stock) === 0;
    const isOffer = (product.hasDiscount || product.has_discount || product.oferta) && product.precioOferta;

    return (
      <div className="gm-card">
        <div className="gm-img-wrapper">
          {/* BADGES EN LAS ESQUINAS */}
          {isAgotado && (
            <div className="gm-img-badge-corner agotado">
              AGOTADO
            </div>
          )}
          
          {isOffer && (
            <div className="gm-img-badge-corner oferta">
              OFERTA
            </div>
          )}
          
          <div className="gm-img-scroller" onScroll={handleScroll} onWheel={handleImgWheel} ref={scrollerRef}>
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${product.nombre} - ${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  // Solo cambiar de ángulo/imagen
                  if (images.length > 1) {
                    setIndex((idx + 1) % images.length);
                  }
                }}
                loading="eager"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/800x800?text=Sin+Imagen";
                }}
              />
            ))}
          </div>
          {images.length > 1 && (
            <div className="gm-img-dots">
              {images.map((_, i) => (
                <div 
                  key={i} 
                  className={`gm-dot ${i === imgIndex ? "active" : ""}`} 
                  onMouseEnter={() => setIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="gm-info" onClick={handleOpenDetail} style={{ cursor: 'pointer' }}>
          <h3 className="gm-product-name">
            {product.nombre}
          </h3>
          
          <div className="gm-actions-row">
            <div className="gm-price-actions">
              {(product.hasDiscount || product.has_discount || product.oferta) && product.precioOferta ? (
                <div className="gm-price-main-row">
                  <span className="gm-current-price">
                    ${Math.round(product.precioOferta).toLocaleString()}
                  </span>
                  <span className="gm-old-price-simple">
                    ${Math.round(product.precio).toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="gm-current-price">
                  ${Math.round(product.precio || 0).toLocaleString()}
                </span>
              )}
            </div>
            
            <button
              className="gm-btn-cart"
              onClick={(e) => { e.stopPropagation(); handleOpenDetail(); }}
              type="button"
            >
              <FaShoppingCart size={15} color="#000" />
              {(product.hasDiscount || product.has_discount || product.oferta) && product.precioOferta && (
                <span className="gm-discount-tag-simple">
                  -{Math.round(((product.precio - product.precioOferta) / product.precio) * 100)}%
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const sizesForModal = selectedProduct ? normalizeSizes(selectedProduct) : [];
  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedSize(null);
    setQuantity(0);
    setShowSizeError(false);
  };

  const handleSizeSelect = (talla) => {
    if (selectedSize === talla) {
      setSelectedSize(null);
      setQuantity(1); // Reset a 1 al deseleccionar
    } else {
      setSelectedSize(talla);
      setQuantity(1); // Reset a 1 al cambiar de talla
      setShowSizeError(false);
    }
  };

  const handleQuantityChange = (val) => {
    if (val === "" || val === null) {
      setQuantity('');
      return;
    }
    
    // Quitar ceros a la izquierda
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

    // Clampear el valor entre 0 y el stock disponible
    if (num < 0) {
      setQuantity(0);
    } else if (num > available) {
      setQuantity(available);
    } else {
      setQuantity(num);
    }
  };

  const handleModalAddToCart = () => {
    if (!selectedProduct) return;
    if (sizesForModal.length > 0 && !selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }

    const size = selectedSize ? selectedSize : (sizesForModal[0] || "Única");
    const q = parseInt(quantity) || 0;
    if (q <= 0) return; // No añadir 0 unidades
    
    // Doble chequeo de stock
    const available = selectedSize ? getAvailableFor(inventory, selectedProduct?.id, selectedSize) : 99;
    const finalQty = q > available ? available : q;
    
    if (finalQty <= 0) return;

    addQuickToCart(selectedProduct, size, finalQty);
  };

  const incrementQuantity = () => {
    if (!selectedSize && sizesForModal.length > 0) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }
    const current = parseInt(quantity) || 0;
    const available = selectedSize
      ? getAvailableFor(inventory, selectedProduct?.id, selectedSize)
      : 99;
    if (current < available) {
      setQuantity(current + 1);
    }
  };

  const decrementQuantity = () => {
    const current = parseInt(quantity) || 0;
    if (current > 0) {
      setQuantity(current - 1);
    }
  };

  const sections = [
    {
      id: "ofertas",
      title: "Ofertas especiales",
      data: ofertas,
      link: "/ofertas",
      tag: "Oferta",
      badgeType: "oferta",
      showSeeAllCard: ofertas.length > 0,
    },
    {
      id: "destacados",
      title: "Gorras destacadas",
      data: destacados,
      link: "/productos?filter=destacados",
      tag: "Destacado",
      badgeType: "destacado",
      showSeeAllCard: destacados.length > 0,
    },
    {
      id: "novedades",
      title: "Novedades",
      data: novedades,
      link: "/productos?filter=novedades",
      tag: "Nuevo",
      badgeType: "destacado",
      showSeeAllCard: novedades.length > 0,
    },
    {
      id: "masComprados",
      title: "Productos más vendidos",
      data: masComprados,
      link: "/productos?filter=mas-vendidos",
      tag: "Más vendido",
      badgeType: "masvendido",
      showSeeAllCard: masComprados.length > 0,
    },
    {
      id: "monastery",
      title: "Colección Monastery",
      data: monastery,
      link: "/productos?filter=monastery",
      tag: "Premium",
      badgeType: "destacado",
      showSeeAllCard: monastery.length > 0,
    },
    {
      id: "allProducts",
      title: "Todos nuestros productos",
      data: initialProducts.filter((p) => p.isActive !== false),
      link: "/productos",
      showSeeAllCard: true,
    },
  ];

  const renderSection = (section) => {
    const {
      id,
      title,
      data = [],
      link,
      tag,
      badgeType,
      showSeeAllCard,
    } = section;

    const rawItems = Array.isArray(data) ? data : [];
    const items = rawItems.slice(0, showSeeAllCard ? 7 : 8);
    if (items.length === 0) return null;

    return (
      <div key={id} className="gm-home-section">
        <div className="gm-home-header">
          <h2 className="gm-home-title">{title}</h2>
          {link && (
            <Link to={link} className="gm-home-pill">
              <span>Ver todos</span> <FaArrowRight size={13} />
            </Link>
          )}
        </div>

        <div className="gm-carousel-wrapper">
          <button
            className={`gm-arrow gm-arrow-left ${!carouselScrollState[id]?.canScrollLeft ? 'disabled' : ''}`}
            onClick={() => handleCarouselScroll(id, 'left')}
            disabled={!carouselScrollState[id]?.canScrollLeft}
            aria-label="Anterior"
            type="button"
          >
            <FaChevronLeft size={18} />
          </button>

          <div className="gm-carousel" ref={carouselRefs[id]} onScroll={() => handleScroll(id)}>
            {items.map((product) => (
              <div key={product.id} className="gm-slot">
                <ProductCard product={product} badge={tag} badgeType={badgeType} />
              </div>
            ))}

            {showSeeAllCard && link && (
              <Link to={link} className="gm-slot gm-card-see-all" aria-label={`Ver todos ${title}`}>
                <div className="gm-see-all-content">
                  <div className="gm-see-all-icon">
                    <FaArrowRight size={18} />
                  </div>
                  <h3>Ver todos</h3>
                  <p>Ver toda la colección</p>
                </div>
              </Link>
            )}
          </div>

          <button
            className={`gm-arrow gm-arrow-right ${!carouselScrollState[id]?.canScrollRight ? 'disabled' : ''}`}
            onClick={() => handleCarouselScroll(id, 'right')}
            disabled={!carouselScrollState[id]?.canScrollRight}
            aria-label="Siguiente"
            type="button"
          >
            <FaChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="gm-home page-container">
      {/* HERO */}
      <section className="gm-hero">
        <div className="gm-hero-bg" />
        <div className="gm-hero-fade-top" />
        <div className="gm-hero-fade-bottom" />
        <div className="gm-hero-inner">
          <h1 className="gm-hero-title">Gorras medellín</h1>
          <p className="gm-hero-sub">
            Estilo premium a tu alcance.
          </p>
        </div>
      </section>

      <div className="gm-container">
        {searchTerm ? (
          <div className="gm-home-section" style={{ minHeight: '60vh' }}>
            <div className="gm-home-header">
              <h2 className="gm-home-title">Resultados para: "{searchTerm}"</h2>
              <button onClick={() => setSearchTerm("")} className="gm-home-pill">
                <span>Limpiar búsqueda</span> <FaTimes size={13} />
              </button>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="gm-search-grid">
                {filteredProducts.map(product => (
                  <div key={product.id} className="gm-slot-search">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="gm-no-results-home">
                <p>No se encontraron productos que coincidan con "{searchTerm}"</p>
              </div>
            )}
          </div>
        ) : (
          sections.map(renderSection)
        )}
      </div>

      {/* MODAL DE PRODUCTO */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          closeModal={closeModal}
          inventory={inventory}
          getAvailableFor={getAvailableFor}
          selectedSize={selectedSize}
          handleSizeSelect={handleSizeSelect}
          quantity={quantity}
          incrementQuantity={incrementQuantity}
          decrementQuantity={decrementQuantity}
          handleModalAddToCart={handleModalAddToCart}
          showSizeError={showSizeError}
          normalizeSizes={normalizeSizes}
          safeImg={safeImg}
          BULK_MIN_QTY={BULK_MIN_QTY}
          handleQuantityInput={handleQuantityChange}
        />
      )}

      {/* TOAST DE ÉXITO */}
      {showSuccessToast && (
        <div className="success-toast-container">
          <div className="success-toast-content">
            <FaCheckCircle size={24} color="#10B981" />
            <div className="toast-text">
              <h4>¡Agregado con éxito!</h4>
              <p>El producto está en tu carrito</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
