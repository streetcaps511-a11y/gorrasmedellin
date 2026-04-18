import { useState, useEffect, useMemo, useCallback } from 'react';
import { NitroCache } from '../../../shared/utils/NitroCache';
import * as productosService from "../services/productosApi";

const CACHE_KEY = 'admin_productos';
const CATS_RAW_KEY = 'admin_categorias_raw';

const getInitialCache = () => {
  const cached = NitroCache.get(CACHE_KEY);
  return Array.isArray(cached?.data) ? cached.data : [];
};

const getInitialCategories = () => {
  const cached = NitroCache.get(CATS_RAW_KEY);
  return Array.isArray(cached?.data) ? cached.data : [];
};

export const useProductosLogic = () => {
  const [modoVista, setModoVista] = useState("lista");
  const [productoEditando, setProductoEditando] = useState(null);
  const [productoViendo, setProductoViendo] = useState(null);
  const [productos, setProductos] = useState(() => getInitialCache());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, producto: null, customMessage: '' });
  const [toggleModal, setToggleModal] = useState({ isOpen: false, producto: null, targetStatus: true });

  const [formData, setFormData] = useState({
    nombre: "", idCategoria: "", precioCompra: "0", precioVenta: "0", precioOferta: "0",
    precioMayorista6: "0", precioMayorista80: "0", enOfertaVenta: false, enInventario: false,
    stock: 0, descripcion: "", isActive: true
  });
  const [tallasStock, setTallasStock] = useState([{ talla: "", cantidad: 0 }]);
  const [categoriasRaw, setCategoriasRaw] = useState(() => getInitialCategories());
  const [categoriasUnicas, setCategoriasUnicas] = useState(['Todas']);
  const [availableTallas, setAvailableTallas] = useState(['Ajustable', '7', '7/1/4', '7/1/8']);
  const [urlsImagenes, setUrlsImagenes] = useState(['']);
  const [coloresProducto, setColoresProducto] = useState(['']);
  const [loading, setLoading] = useState(getInitialCache().length === 0);

  const fetchInitialData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [dbProductos, dbCategorias] = await Promise.all([
        productosService.getProductos(),
        productosService.getCategorias()
      ]);
      
      const cats = ['Todas', ...new Set(dbCategorias.map(c => c.nombre || c.Nombre))];
      NitroCache.set(CACHE_KEY, dbProductos);
      NitroCache.set(CATS_RAW_KEY, dbCategorias);

      setProductos(dbProductos);
      setCategoriasRaw(dbCategorias);
      setCategoriasUnicas(cats);
    } catch (error) {
      console.error("Error loading products data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData(productos.length === 0);
  }, [fetchInitialData, productos.length]);

  const filteredProductos = useMemo(() => {
    let filtrados = productos;
    if (searchTerm) {
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoriaFiltro !== "Todas") filtrados = filtrados.filter(p => p.categoria === categoriaFiltro);
    if (filterStatus !== "Todos") {
      filtrados = filtrados.filter(p => {
        const estadoLabel = p.isActive ? 'Activo' : 'Inactivo';
        return estadoLabel === filterStatus;
      });
    }
    return filtrados;
  }, [searchTerm, categoriaFiltro, filterStatus, productos]);

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage) || 1;
  const paginatedProductos = filteredProductos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const notifySync = () => {
    const channel = new BroadcastChannel('app_sync');
    channel.postMessage('productos_updated');
    channel.close();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        showAlert(`Actualizado correctamente ✅`);
      } else {
        await productosService.createProducto(payload);
        showAlert(`Registrado correctamente ✅`);
      }
      notifySync();
      await fetchInitialData();
      setModoVista("lista");
    } catch (error) {
      showAlert("Error al guardar", "error");
    } finally { setLoading(false); }
  };

  const confirmToggleStatus = async () => {
    const { producto, targetStatus } = toggleModal;
    if (!producto) return;

    // Actualización instantánea de la UI
    setProductos(prev => prev.map(p => p.id === producto.id ? 
      { ...p, isActive: targetStatus, estado: targetStatus ? "Activo" : "Inactivo" } : p));
    
    setToggleModal({ isOpen: false, producto: null, targetStatus: true });

    // Sincronización instantánea entre pestañas
    const channel = new BroadcastChannel('app_sync');
    channel.postMessage('productos_updated');
    channel.close();

    try {
      showAlert(targetStatus ? 'Activado ✅' : 'Desactivado ⏸️'); // Alerta inmediata
      await productosService.updateProducto(producto.id, { ...producto, isActive: targetStatus });
      
      // Actualizar caché local
      const currentData = NitroCache.get(CACHE_KEY);
      if (currentData) {
        currentData.data = currentData.data.map(p => p.id === producto.id ? 
          { ...p, isActive: targetStatus, estado: targetStatus ? "Activo" : "Inactivo" } : p);
        NitroCache.set(CACHE_KEY, currentData.data);
      }
    } catch (error) {
      await fetchInitialData(); // Revertir solo si falla
      showAlert("Error al cambiar estado", "error");
    }
  };

  const handleDelete = async () => {
    const id = deleteModal.producto.id;
    setProductos(prev => prev.filter(p => p.id !== id));
    setDeleteModal({ isOpen: false, producto: null, customMessage: '' });

    // Notar de inmediato a otras pestañas
    const channel = new BroadcastChannel('app_sync');
    channel.postMessage('productos_updated');
    channel.close();

    try {
      showAlert('Eliminado permanentemente 🗑️');
      await productosService.deleteProducto(id);
      fetchInitialData();
    } catch (error) {
      fetchInitialData();
      showAlert("Error al eliminar", "error");
    }
  };

  return {
    modoVista, productoEditando, productoViendo, productos,
    searchTerm, setSearchTerm, categoriaFiltro,
    filterStatus, setFilterStatus,
    currentPage, setCurrentPage, alert, setAlert, deleteModal,
    formData, tallasStock, categoriasRaw, categoriasUnicas,
    availableTallas, urlsImagenes, coloresProducto, errors: {},
    loading, filteredProductos, paginatedProductos, totalPages,
    showingStart: filteredProductos.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0,
    endIndex: Math.min(currentPage * itemsPerPage, filteredProductos.length),
    handleFilterSelect: (c) => { setCategoriaFiltro(c); setCurrentPage(1); },
    handleStatusSelect: (s) => { setFilterStatus(s); setCurrentPage(1); },
    agregarTalla: () => setTallasStock(prev => [...prev, { talla: "", cantidad: 0 }]),
    eliminarTalla: (idx) => setTallasStock(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : [{ talla: "", cantidad: 0 }]),
    handleTallaChange: (idx, val) => { const n = [...tallasStock]; n[idx].talla = val; setTallasStock(n); },
    incrementarCantidad: (idx) => { const n = [...tallasStock]; n[idx].cantidad += 1; setTallasStock(n); },
    decrementarCantidad: (idx) => { const n = [...tallasStock]; if (n[idx].cantidad > 0) n[idx].cantidad -= 1; setTallasStock(n); },
    handleCantidadChange: (idx, val) => { const n = [...tallasStock]; n[idx].cantidad = parseInt(val) || 0; setTallasStock(n); },
    agregarUrlImagen: () => urlsImagenes.length < 4 && setUrlsImagenes(prev => [...prev, '']),
    eliminarUrlImagen: (idx) => urlsImagenes.length > 1 && setUrlsImagenes(prev => prev.filter((_, i) => i !== idx)),
    actualizarUrlImagen: (idx, val) => { const n = [...urlsImagenes]; n[idx] = val; setUrlsImagenes(n); },
    agregarColor: () => coloresProducto.length < 2 && setColoresProducto(prev => [...prev, '']),
    eliminarColor: (idx) => coloresProducto.length > 1 && setColoresProducto(prev => prev.filter((_, i) => i !== idx)),
    actualizarColor: (idx, val) => { const n = [...coloresProducto]; n[idx] = val; setColoresProducto(n); },
    mostrarLista: () => setModoVista("lista"),
    mostrarFormulario: (p = null) => {
      if (p) {
        setFormData({ ...p, idCategoria: p.idCategoria || "" });
        setTallasStock(p.tallasStock || [{ talla: "", cantidad: 0 }]);
        setUrlsImagenes(p.imagenes || ['']);
        setColoresProducto(p.colores || ['']);
        setProductoEditando(p);
      } else {
        setFormData({ nombre: "", idCategoria: "", precioCompra: "0", precioVenta: "0", precioOferta: "0", precioMayorista6: "0", precioMayorista80: "0", enOfertaVenta: false, enInventario: false, stock: 0, descripcion: "", isActive: true });
        setTallasStock([{ talla: "", cantidad: 0 }]);
        setUrlsImagenes(['']);
        setColoresProducto(['']);
        setProductoEditando(null);
      }
      setModoVista("formulario");
    },
    mostrarDetalle: (p) => { setProductoViendo(p); setModoVista("detalle"); },
    handleSubmit,
    handleDesactivar: (p) => setToggleModal({ isOpen: true, producto: p, targetStatus: false }),
    handleReactivar: (p) => setToggleModal({ isOpen: true, producto: p, targetStatus: true }),
    openDeleteModal: (p) => setDeleteModal({ isOpen: true, producto: p, customMessage: `¿Eliminar permanentemente "${p.nombre}"?` }),
    closeDeleteModal: () => setDeleteModal({ isOpen: false, producto: null, customMessage: '' }),
    handleDelete,
    toggleModal, confirmToggleStatus, closeToggleModal: () => setToggleModal({ isOpen: false, producto: null, targetStatus: true }),
    handleInputChange: (e) => { const { name, value, type, checked } = e.target; setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); },
    handleVerDetalle: (p) => { setProductoViendo(p); setModoVista("detalle"); },
    handleEditarProducto: (p) => { 
        setProductoEditando(p);
        setFormData({
            nombre: p.nombre, idCategoria: p.idCategoria || "", precioCompra: p.precioCompra || "0",
            precioVenta: p.precioVenta || "0", precioOferta: p.precioOferta || "0",
            precioMayorista6: p.precioMayorista6 || "0", precioMayorista80: p.precioMayorista80 || "0",
            enOfertaVenta: p.enOfertaVenta || false, descripcion: p.descripcion || "",
            enInventario: p.enInventario !== undefined ? p.enInventario : true,
            isActive: p.isActive !== undefined ? p.isActive : true
        });
        setTallasStock(p.tallasStock || [{ talla: "", cantidad: 0 }]);
        setUrlsImagenes(p.imagenes || ['']);
        setColoresProducto(p.colores || ['']);
        setModoVista("formulario");
    }
  };
};
