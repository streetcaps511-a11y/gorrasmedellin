import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearch, useAuth, useCart } from "../contexts";
import api from '../services/api'; // Asegúrate de que la ruta sea correcta

/**
 * Custom hook to manage all Header component logic
 */
export const useHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: onLogout } = useAuth();
  const { 
    cartItems, 
    cartItemCount, 
    cartTotal, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Contexto global de búsqueda
  const { setSearchTerm: setGlobalSearch } = useSearch();

  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);
  const cartRef = useRef(null);
  const cartScrollRef = useRef(null);

  // Cargar productos para búsqueda en tiempo real
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/productos');
        // El interceptor ya maneja el 401 limpiando la sesión, 
        // aquí solo manejamos la data exitosa
        const projects = response.data?.data?.products || [];
        setAllProducts(Array.isArray(projects) ? projects : []);
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error('Error cargando productos:', error);
        }
        setAllProducts([]);
      }
    };
    fetchProducts();
  }, []);

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const closeMenu = (e) => {
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target) &&
        !userButtonRef.current.contains(e.target)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, [isUserMenuOpen]);

  // Cerrar carrito al hacer clic fuera
  useEffect(() => {
    const closeCart = (e) => {
      if (isCartOpen && cartRef.current && !cartRef.current.contains(e.target)) {
        setIsCartOpen(false);
        setShowClearCartConfirm(false);
      }
    };
    if (isCartOpen) document.addEventListener("mousedown", closeCart);
    return () => document.removeEventListener("mousedown", closeCart);
  }, [isCartOpen]);

  // Cerrar menú móvil al hacer clic en un link
  useEffect(() => {
    if (isMenuOpen) {
      const closeMobileMenu = () => setIsMenuOpen(false);
      const links = document.querySelectorAll('.mobile-menu-link');
      links.forEach(link => link.addEventListener('click', closeMobileMenu));
      return () => {
        links.forEach(link => link.removeEventListener('click', closeMobileMenu));
      };
    }
  }, [isMenuOpen]);

  // Manejar overflow del body cuando hay modales/menús abiertos
  useEffect(() => {
    if (isMenuOpen || isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen, isCartOpen]);

  const increaseQuantity = (id, talla) => {
    const item = cartItems.find(i => i.id === id && i.talla === talla);
    if (item) updateQuantity(id, talla, (item.quantity || 1) + 1);
  };

  const decreaseQuantity = (id, talla) => {
    const item = cartItems.find(i => i.id === id && i.talla === talla);
    if (item) {
      const newQty = (item.quantity || 1) - 1;
      if (newQty <= 0) {
        removeFromCart(id, talla);
      } else {
        updateQuantity(id, talla, newQty);
      }
    }
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearCartConfirm(false);
  };

  const handleClearCartClick = () => {
    if (cartItems.length === 0) return;
    setShowClearCartConfirm(true);
  };

  const cancelClearCart = () => {
    setShowClearCartConfirm(false);
  };

  const getItemPrice = (item) => {
    return Number(item.precio ?? item.price ?? item.originalPrice ?? 0);
  };

  const getItemImage = (item) => {
    if (item.imagen && item.imagen.trim() !== '') return item.imagen;
    if (item.imagenes && item.imagenes.length > 0) return item.imagenes[0];
    if (item.image && item.image.trim() !== '') return item.image;
    return 'https://via.placeholder.com/50x50/1E293B/FFC107?text=GM';
  };

  const getItemName = (item) => {
    return item.nombre?.trim() || item.name?.trim() || 'Producto sin nombre';
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setGlobalSearch(value);

    if (value.trim().length >= 1) {
      // Normalizar: quitar tildes y pasar a minúsculas para búsqueda insensible a acentos/mayúsculas
      const normalize = (str) =>
        (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const query = normalize(value);
      const filtered = allProducts.filter(product => {
        const name = normalize(product.nombre || product.name || '');
        const cat  = normalize(product.categoria_nombre || product.categoria || '');
        return name.includes(query) || cat.includes(query);
      });
      setSearchResults(filtered.slice(0, 6));
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query.length > 0) {
      setShowSearchDropdown(false);
      setIsMenuOpen(false);
      setSearchResults([]);

      const path = location.pathname;
      const isCatalogView = path.startsWith('/productos') || 
                            path.startsWith('/ofertas') || 
                            path.startsWith('/categorias');

      if (!isCatalogView) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setGlobalSearch('');
    setShowSearchDropdown(false);
    setSearchResults([]);
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/50x50/1E293B/FFC107?text=GM';
  };

  return {
    user,
    onLogout,
    cartItems,
    cartItemCount,
    cartTotal,
    removeFromCart,
    isMenuOpen,
    setIsMenuOpen,
    isCartOpen,
    setIsCartOpen,
    searchTerm,
    showClearCartConfirm,
    setShowClearCartConfirm,
    isUserMenuOpen,
    setIsUserMenuOpen,
    searchResults,
    showSearchDropdown,
    setShowSearchDropdown,
    userMenuRef,
    userButtonRef,
    cartRef,
    cartScrollRef,
    increaseQuantity,
    decreaseQuantity,
    handleClearCart,
    handleClearCartClick,
    cancelClearCart,
    getItemPrice,
    getItemImage,
    getItemName,
    handleSearchChange,
    handleSearchSubmit,
    handleClearSearch,
    handleImageError,
    handleLogoutClick,
    showLogoutConfirm,
    confirmLogout,
    cancelLogout,
    navigate
  };
};

export default useHeader;
