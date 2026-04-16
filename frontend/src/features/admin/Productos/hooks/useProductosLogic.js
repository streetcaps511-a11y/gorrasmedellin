import { useState, useEffect, useMemo, useCallback } from 'react';
import { NitroCache } from '../../../shared/utils/NitroCache';
import * as productosService from "../services/productosApi";

// 🧠 MEMORIA GLOBAL (Caché Nitro)
let productosCache = {
  productos: [],
  categorias: [],
  isInitialized: false
};

// 🧠 CONFIGURACIÓN INICIAL (Caché Nitro Persistente)
const getInitialCache = () => {
  const cached = NitroCache.get('productos');
  const data = Array.isArray(cached?.data) ? cached.data : [];
  productosCache.productos = data; // Sincronizar memoria interna
  return data;
};
const getInitialCategories = () => {
  const cached = NitroCache.get('categorias_raw');
  const data = Array.isArray(cached?.data) ? cached.data : [];
  productosCache.categorias = data; // Sincronizar memoria interna
  return data;
};

export const useProductosLogic = () => {
  // =========================
  // ESTADOS PARA CONTROL DE VISTA
  // =========================
  const [modoVista, setModoVista] = useState("lista");
  const [productoEditando, setProductoEditando] = useState(null);
  const [productoViendo, setProductoViendo] = useState(null);

  // =========================
  // ESTADOS PARA LA LISTA (Desde Caché Nitro)
  // =========================
  const initialData = getInitialCache();
  const [productos, setProductos] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // =========================
  // ESTADOS PARA MODALES Y ALERTAS
  // =========================
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, producto: null, customMessage: '' });
  const [toggleModal, setToggleModal] = useState({ isOpen: false, producto: null, targetStatus: true });

  // =========================
  // ESTADOS DEL FORMULARIO
  // =========================
  const [formData, setFormData] = useState({
    nombre: "",
    idCategoria: "",
    precioCompra: "0",
    precioVenta: "0",
    precioOferta: "0",
    precioMayorista6: "0",
    precioMayorista80: "0",
    enOfertaVenta: false,
    enInventario: false,
    stock: 0,
    descripcion: "",
    isActive: true
  });
  const [tallasStock, setTallasStock] = useState([{ talla: "", cantidad: 0 }]);
  const [categoriasRaw, setCategoriasRaw] = useState(getInitialCategories());
  const [categoriasUnicas, setCategoriasUnicas] = useState(['Todas']);
  const [availableTallas, setAvailableTallas] = useState(['Ajustable', '7', '7/1/4', '7/1/8']);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [urlsImagenes, setUrlsImagenes] = useState(['']);
  const [coloresProducto, setColoresProducto] = useState(['']);
  const [availableColores, setAvailableColores] = useState([]);
  const [errors, setErrors] = useState({});
  
  // ⚡ SOLO cargamos si no hay datos en memoria
  const [loading, setLoading] = useState(initialData.length === 0);

  // =========================
  // CARGAR DATOS INICIALES (Nitro Sync)
  // =========================
  const fetchInitialData = useCallback(async () => {
    // Si no hay datos, mostramos cargando
    const currentData = getInitialCache();
    if (currentData.length === 0) setLoading(true);

    try {
      const dbProductos = await productosService.getProductos();
      const dbCategorias = await productosService.getCategorias();
      const dbTallas = await productosService.getTallas();
      const dbColores = await productosService.getColores();
      
      const cats = ['Todas', ...new Set(dbCategorias.map(c => c.nombre || c.Nombre))];
      const finalTallas = ['Ajustable', '7', '7/1/4', '7/1/8'];
      
      // 💾 GUARDAR EN NITRO CACHE PERSISTENTE
      NitroCache.set('productos', dbProductos);
      NitroCache.set('categorias_raw', dbCategorias);
      NitroCache.set('ventas_tallas', dbTallas);
      NitroCache.set('ventas_colores', dbColores);

      setProductos(dbProductos);
      setCategoriasRaw(dbCategorias);
      setCategoriasUnicas(cats);
      setAvailableTallas(finalTallas);
      setAvailableColores(dbColores);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // =========================
  // FILTRADO Y PAGINACIÓN
  // =========================
  const filteredProductos = useMemo(() => {
    let filtrados = productos;
    if (searchTerm) {
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoriaFiltro !== "Todas") {
      filtrados = filtrados.filter(p => p.categoria === categoriaFiltro);
    }
    return filtrados;
  }, [searchTerm, categoriaFiltro, productos]);

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredProductos.length);
  const paginatedProductos = filteredProductos.slice(startIndex, endIndex);
  const showingStart = filteredProductos.length > 0 ? startIndex + 1 : 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoriaFiltro]);

  // =========================
  // FUNCIONES DE UTILIDAD
  // =========================
  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleFilterSelect = (categoria) => {
    setCategoriaFiltro(categoria);
  };

  const agregarTalla = () => {
    setTallasStock(prev => [...prev, { talla: "", cantidad: 0 }]);
  };

  const eliminarTalla = (index) => {
    if (tallasStock.length > 1) {
      setTallasStock(prev => prev.filter((_, i) => i !== index));
    } else {
      setTallasStock([{ talla: "", cantidad: 0 }]);
    }
  };

  const handleTallaChange = (index, value) => {
    const nuevasTallas = [...tallasStock];
    nuevasTallas[index].talla = value;
    setTallasStock(nuevasTallas);
  };

  const incrementarCantidad = (index) => {
    const nuevasTallas = [...tallasStock];
    nuevasTallas[index].cantidad += 1;
    setTallasStock(nuevasTallas);
  };

  const decrementarCantidad = (index) => {
    const nuevasTallas = [...tallasStock];
    if (nuevasTallas[index].cantidad > 0) {
      nuevasTallas[index].cantidad -= 1;
      setTallasStock(nuevasTallas);
    }
  };

  const handleCantidadChange = (index, value) => {
    const nuevasTallas = [...tallasStock];
    const rawValue = value.toString().replace(/[^0-9]/g, '');
    nuevasTallas[index].cantidad = rawValue === '' ? 0 : parseInt(rawValue);
    setTallasStock(nuevasTallas);
  };

  // =========================
  // FUNCIONES DE URLS DE IMÁGENES
  // =========================
  const agregarUrlImagen = () => {
    if (urlsImagenes.length < 4) {
      setUrlsImagenes(prev => [...prev, '']);
    }
  };

  const eliminarUrlImagen = (index) => {
    if (urlsImagenes.length > 1) {
      const nuevasUrls = urlsImagenes.filter((_, i) => i !== index);
      setUrlsImagenes(nuevasUrls);
      
      // Limpiar errores para que no queden mensajes de campos eliminados
      setErrors(prev => {
        const nuevosErrores = { ...prev };
        Object.keys(nuevosErrores).forEach(key => {
          if (key.startsWith('url_')) delete nuevosErrores[key];
        });
        return nuevosErrores;
      });
    }
  };

  const actualizarUrlImagen = (index, value) => {
    const nuevasUrls = [...urlsImagenes];
    nuevasUrls[index] = value;
    setUrlsImagenes(nuevasUrls);

    // Si es la primera imagen con contenido, mostrar alerta informativa
    const hasAnyContentTotal = nuevasUrls.some(u => u.trim() !== '');
    const hadAnyContentBefore = urlsImagenes.some(u => u.trim() !== '');
    
    if (hasAnyContentTotal && !hadAnyContentBefore && !alert.show) {
      showAlert("Las imágenes se verán abajo", "success");
    }

    // Regla de validación para URLs de imagen (optimizada y más permisiva) 
    // Permite caracteres especiales comunes en URLs de CDN (discord, aiven, firebase, etc.)
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .?=%&+\-#]*)*\/?$/i;
    const isValid = value.trim() === '' || urlPattern.test(value);
    
    // Validar duplicados en tiempo real
    const isDuplicate = value.trim() !== '' && nuevasUrls.filter(u => u === value).length > 1;
    
    setErrors(prev => ({
      ...prev,
      [`url_${index}`]: !isValid ? 'URL inválida' : (isDuplicate ? 'URL ya utilizada' : null)
    }));
  };

  // =========================
  // FUNCIONES DE COLORES
  // =========================
  const agregarColor = () => {
    if (coloresProducto.length < 2) {
      setColoresProducto(prev => [...prev, '']);
    }
  };

  const eliminarColor = (index) => {
    if (coloresProducto.length > 1) {
      setColoresProducto(prev => prev.filter((_, i) => i !== index));
    } else {
      setColoresProducto(['']);
    }
  };

  const actualizarColor = (index, value) => {
    const nuevosColores = [...coloresProducto];
    nuevosColores[index] = value;
    setColoresProducto(nuevosColores);
  };

  // =========================
  // FUNCIONES PARA CAMBIAR ENTRE VISTAS
  // =========================
  const mostrarLista = () => {
    setModoVista("lista");
    setProductoEditando(null);
    setProductoViendo(null);
    setFormData({
      nombre: "",
      categoria: "",
      precioCompra: "0",
      precioVenta: "0",
      precioOferta: "0",
      precioMayorista6: "0",
      precioMayorista80: "0",
      enOfertaVenta: false,
      descripcion: "",
      enInventario: false,
      isActive: true
    });
    setTallasStock([{ talla: "", cantidad: 0 }]);
    setUrlsImagenes(['']);
    setColoresProducto(['']);
    setErrors({});
  };

  const mostrarFormulario = (producto = null) => {
    if (producto) {
      setProductoEditando(producto);
      setFormData({
        nombre: producto.nombre,
        idCategoria: producto.idCategoria || "",
        precioCompra: producto.precioCompra || "0",
        precioVenta: producto.precioVenta || "0",
        precioOferta: producto.precioOferta || "0",
        precioMayorista6: producto.precioMayorista6 || "0",
        precioMayorista80: producto.precioMayorista80 || "0",
        enOfertaVenta: producto.enOfertaVenta || false,
        descripcion: producto.descripcion || "",
        enInventario: producto.enInventario !== undefined ? producto.enInventario : true,
        isActive: producto.isActive !== undefined ? producto.isActive : true
      });
      setTallasStock(producto.tallasStock?.length > 0 ? producto.tallasStock : [{ talla: "", cantidad: 0 }]);
      setUrlsImagenes(producto.imagenes?.length > 0 ? producto.imagenes : ['']);
      setColoresProducto(producto.colores?.length > 0 ? producto.colores : ['']);
    } else {
      setFormData({
        nombre: "",
        idCategoria: "",
        precioCompra: "0",
        precioVenta: "0",
        precioOferta: "0",
        precioMayorista6: "0",
        precioMayorista80: "0",
        enOfertaVenta: false,
        descripcion: "",
        enInventario: false,
        isActive: true
      });
      setTallasStock([{ talla: "", cantidad: 0 }]);
      setUrlsImagenes(['']);
      setColoresProducto(['']);
    }
    setErrors({});
    setModoVista("formulario");
  };

  const mostrarDetalle = (producto) => {
    setProductoViendo(producto);
    setModoVista("detalle");
  };

  // =========================
  // ACCIONES CRUD
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    // 1. Validaciones de Campos Básicos
    if (!formData.nombre?.trim()) newErrors.nombre = 'Obligatorio';
    if (!formData.idCategoria) newErrors.idCategoria = 'Obligatorio';
    if (!formData.descripcion?.trim()) newErrors.descripcion = 'Obligatorio';
    
    // 2. Validaciones de Precios
    const precioVentaVal = parseFloat(formData.precioVenta) || 0;
    const precioCompraVal = parseFloat(formData.precioCompra) || 0;
    const mayorista6Val = parseFloat(formData.precioMayorista6) || 0;
    const mayorista80Val = parseFloat(formData.precioMayorista80) || 0;

    if (precioVentaVal <= 0) newErrors.precioVenta = 'Obligatorio';
    if (mayorista6Val <= 0) newErrors.precioMayorista6 = 'Obligatorio';
    if (mayorista80Val <= 0) newErrors.precioMayorista80 = 'Obligatorio';
    if (formData.enInventario && precioCompraVal <= 0) newErrors.precioCompra = 'Obligatorio';

    // Precio Oferta solo si está activado
    if (formData.enOfertaVenta) {
      const precioOfertaVal = parseFloat(formData.precioOferta) || 0;
      if (precioOfertaVal <= 0) {
        newErrors.precioOferta = 'Obligatorio';
      } else if (precioOfertaVal >= precioVentaVal) {
        newErrors.precioOferta = 'Debe ser menor al normal';
      }
    }
    
    // 3. Validación de Tallas y Colores (OBLIGATORIO elegir al menos uno)
    const tieneTallasValidas = tallasStock.some(t => t.talla?.trim() !== '');
    if (!tieneTallasValidas) {
      newErrors.tallas = 'Debe agregar al menos una talla válida';
    }

    const tieneColoresValidos = coloresProducto.some(c => c?.trim() !== '');
    if (!tieneColoresValidos) {
      newErrors.colores = 'Debe agregar al menos un color';
    }

    // 4. Validación de Imágenes (OBLIGATORIO al menos una)
    const tieneImagenesValidas = urlsImagenes.some(url => url?.trim() !== '');
    if (!tieneImagenesValidas) {
      newErrors.imagenes = 'Debe agregar al menos una URL de imagen';
    }

    // 5. Validar Formato de URLs de imágenes
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .?=%&+\-#]*)*\/?$/i;
    const urlsLlenas = urlsImagenes.filter(url => url.trim() !== '');
    const invalidImageUrls = urlsLlenas.filter(url => !urlPattern.test(url));
    
    if (invalidImageUrls.length > 0) {
      showAlert("Una o más URLs de imagen son inválidas", "error");
      return;
    }

    // Validar URLs duplicadas
    const duplicateUrls = urlsLlenas.filter((url, index) => urlsLlenas.indexOf(url) !== index);
    if (duplicateUrls.length > 0) {
      showAlert("No puedes usar la misma URL de imagen más de una vez", "error");
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showAlert("Por favor complete todos los campos obligatorios", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        idCategoria: parseInt(formData.idCategoria),
        tallasStock: tallasStock.filter(t => t.talla?.trim() !== ''),
        colores: coloresProducto.filter(c => c.trim() !== ''),
        imagenes: urlsImagenes.filter(url => url.trim() !== '')
      };

      if (productoEditando) {
        await productosService.updateProducto(productoEditando.id, payload);
        showAlert(`Producto "${formData.nombre}" actualizado correctamente`, formData.isActive ? 'success' : 'error');
      } else {
        await productosService.createProducto(payload);
        showAlert(`Producto "${formData.nombre}" registrado correctamente`);
      }
      
      await fetchInitialData();
      
      // ✅ Sincronizar Caché Manualmente tras crear/editar
      const latestData = await productosService.getProductos();
      NitroCache.set('productos', latestData);
      
      setTimeout(mostrarLista, 1000);
    } catch (error) {
      let errorMsg = error.message;
      if (error.response?.data) {
        if (Array.isArray(error.response.data.errors)) {
          errorMsg = error.response.data.errors.join(" / ");
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else if (error.response.data.error) {
          errorMsg = error.response.data.error;
        }
      }
      showAlert("Error guardando el producto: " + errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDesactivar = (producto) => {
    if (!producto.isActive) return;
    setToggleModal({
      isOpen: true,
      producto,
      targetStatus: false
    });
  };

  const handleReactivar = (producto) => {
    if (producto.isActive) return;
    setToggleModal({
      isOpen: true,
      producto,
      targetStatus: true
    });
  };

  const confirmToggleStatus = async () => {
    const { producto, targetStatus } = toggleModal;
    if (!producto) return;

    setLoading(true); // 🚀 Iniciar carga visual

    // 🚀 Actualización Optimizada
    const originalProductos = [...productos];
    setProductos(prev => prev.map(p => 
      p.id === producto.id 
        ? { 
            ...p, 
            isActive: targetStatus,
            estado: targetStatus ? "Activo" : "Inactivo"
          } 
        : p
    ));
    
    try {
      await productosService.updateProducto(producto.id, { ...producto, isActive: targetStatus });
      showAlert(targetStatus ? 'Producto activado ✅' : 'Producto desactivado ⏸️', targetStatus ? 'success' : 'error');
      
      // 🛠️ ACTUALIZAR CACHÉ PERSISTENTE
      const current = NitroCache.get('productos')?.data || [];
      const updatedCache = current.map(p => 
        String(p.id) === String(producto.id) ? { ...p, isActive: targetStatus, estado: targetStatus ? "Activo" : "Inactivo" } : p
      );
      NitroCache.set('productos', updatedCache);
      
      setTimeout(() => {
        setToggleModal({ isOpen: false, producto: null, targetStatus: true });
        setLoading(false);
      }, 500);
      
    } catch (error) {
      setProductos(originalProductos);
      showAlert(`Error ${targetStatus ? 'reactivando' : 'desactivando'} el producto`, "error");
      setToggleModal({ isOpen: false, producto: null, targetStatus: true });
      setLoading(false);
    }
  };

  const closeToggleModal = () => setToggleModal({ isOpen: false, producto: null, targetStatus: true });

  const openDeleteModal = (producto) => {
    if (producto.isActive) {
      showAlert(`No se puede eliminar el producto "${producto.nombre}" porque está activo. Desactívelo primero.`, 'error');
      return;
    }
    setDeleteModal({
      isOpen: true,
      producto,
      customMessage: `¿Estás seguro que deseas eliminar permanentemente el producto "${producto.nombre}"?`
    });
  };

  const closeDeleteModal = () => setDeleteModal({ isOpen: false, producto: null, customMessage: '' });

  const handleDelete = async () => {
    if (!deleteModal.producto) return;
    setLoading(true); // 🚀 Iniciar carga visual
    
    try {
      await productosService.deleteProducto(deleteModal.producto.id);
      
      // 🛠️ ACTUALIZACIÓN OPTIMISTA (Eliminar de la tabla de inmediato)
      const productoIdABorrar = deleteModal.producto.id;
      setProductos(prev => prev.filter(p => String(p.id) !== String(productoIdABorrar)));
      
      // 🛠️ ACTUALIZAR CACHÉ GLOBAL
      productosCache.productos = productosCache.productos.filter(p => String(p.id) !== String(productoIdABorrar));
      
      showAlert('Producto eliminado permanentemente', 'success');
      
      // Pausa para visualizar "Eliminando..."
      setTimeout(() => {
        closeDeleteModal();
        setLoading(false);
      }, 500);
    } catch (error) {
      let errorMsg = error.message;
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      showAlert("Error eliminando el producto: " + errorMsg, "error");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      // Sincronizar isActive ya no es necesario desde el dropdown eliminado
      return newData;
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return {
    modoVista,
    productoEditando,
    productoViendo,
    productos,
    searchTerm, setSearchTerm,
    categoriaFiltro,
    currentPage, setCurrentPage,
    alert, setAlert,
    deleteModal,
    formData,
    tallasStock,
    categoriasRaw,
    categoriasUnicas,
    availableTallas,
    availableColores,
    availableStatuses,
    urlsImagenes,
    coloresProducto,
    errors,
    loading,
    filteredProductos,
    paginatedProductos,
    totalPages,
    startIndex,
    endIndex,
    showingStart,
    handleFilterSelect,
    agregarTalla,
    eliminarTalla,
    handleTallaChange,
    incrementarCantidad,
    decrementarCantidad,
    agregarUrlImagen,
    eliminarUrlImagen,
    actualizarUrlImagen,
    agregarColor,
    eliminarColor,
    actualizarColor,
    handleCantidadChange,
    mostrarLista,
    mostrarFormulario,
    mostrarDetalle,
    handleSubmit,
    handleDesactivar,
    handleReactivar,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    toggleModal,
    confirmToggleStatus,
    closeToggleModal,
    handleInputChange,
    handleVerDetalle: mostrarDetalle,
    handleEditarProducto: mostrarFormulario
  };
};
