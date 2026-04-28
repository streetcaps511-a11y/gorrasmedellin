/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

// src/modules/purchases/hooks/useComprasLogic.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { NitroCache } from '../../../shared/utils/NitroCache';
import Swal from 'sweetalert2';
import { 
  fetchAllCompras, 
  createNewCompra, 
  fetchAllProveedores, 
  getStatuses, 
  getPaymentMethods, 
  getSizes,
  updateCompraStatus,
  fetchAllProductos
} from '../services/comprasApi';

// // 🧠 MEMORIA GLOBAL (Caché Nitro)
const getInitialCompras = () => {
    const cached = NitroCache.get('compras_v2');
    return Array.isArray(cached?.data) ? cached.data : [];
};
const getInitialProv = () => {
    const cached = NitroCache.get('compras_prov');
    return cached?.data || [];
};

let localCache = {
  isInitialized: false
};

export const useComprasLogic = (location) => {
  const [modoVista, setModoVista] = useState("lista");
  const [compras, setCompras] = useState(getInitialCompras());
  const [proveedores, setProveedores] = useState(getInitialProv());
  const [availableStatuses, setAvailableStatuses] = useState(['Todos', 'Pendiente', 'Completada', 'Anulada']);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState(['Efectivo', 'Transferencia']);
  const [availableSizes, setAvailableSizes] = useState([
    { value: 'Ajustable', label: 'Ajustable' },
    { value: '7', label: '7' },
    { value: '7/1/4', label: '7/1/4' },
    { value: '7/1/8', label: '7/1/8' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [productoPage, setProductoPage] = useState(1);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});
  const [compraViendo, setCompraViendo] = useState(null);
  const [compraEditando, setCompraEditando] = useState(null);
  const [completarModal, setCompletarModal] = useState({ isOpen: false, compra: null });
  const [productos, setProductos] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // ⚡ Solo mostramos cargando si NO tenemos nada en memoria
  const [loading, setLoading] = useState(getInitialCompras().length === 0);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionLoadingText, setActionLoadingText] = useState('Procesando...');

  const [nuevaCompra, setNuevaCompra] = useState({
    proveedor: '',
    idProveedor: '',
    metodoPago: 'Efectivo',
    fecha: new Date().toLocaleDateString('es-CO'),
    productos: [{
      id: '',
      nombre: '',
      talla: '',
      cantidad: 1,
      precioCompra: '',
      precioVenta: '',
      precioMayorista6: '',
      precioMayorista80: '',
      _tempKey: Math.random()
    }],
    estado: 'Pendiente'
  });

  const proveedoresActivos = useMemo(() => {
    // Si no hay proveedores, retornar vacío
    if (!Array.isArray(proveedores)) return [];

    return proveedores.filter(s => {
      // Tomamos el estado de cualquier campo posible
      const st = s.isActive ?? s.isActive ?? s.estado ?? s.Estado;
      
      // Si el estado no está definido, asumimos que está activo (para evitar ocultar datos por error)
      if (st === undefined || st === null) return true;
      
      // Si es booleano, devolvemos el valor
      if (typeof st === 'boolean') return st;
      
      // Si es string, verificamos que no sea inactivo
      const lower = st.toString().toLowerCase();
      return !lower.includes('inactiv'); 
    }).map(s => ({
      id: s.IdProveedor || s.id,
      nombre: s.Nombre || s.nombre || s.companyName || s.contactName || 'Sin Nombre'
    }));
  }, [proveedores]);

  // ✅ CARGA RÁPIDA (Nitro Sync)
  const fetchData = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
        const [cData, pData, methods] = await Promise.all([
            fetchAllCompras(),
            fetchAllProveedores(),
            getPaymentMethods()
        ]);

        const sorted = [...cData].sort((a, b) => (parseInt(b.numCompra) || 0) - (parseInt(a.numCompra) || 0));
        
        // 💾 PERSISTENCIA NITRO
        NitroCache.set('compras_v2', sorted);
        NitroCache.set('compras_prov', pData);
        
        setCompras(sorted);
        setProveedores(pData);
        if (Array.isArray(methods)) {
            setAvailablePaymentMethods(methods.map(m => typeof m === 'string' ? m : (m.Nombre || m.nombre)));
        }
        localCache.isInitialized = true;
    } catch (e) {
        console.error("Error fetchData Compras:", e);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const mostrarLista = useCallback(() => {
    setModoVista("lista");
    setCompraEditando(null);
    setCompraViendo(null);
    setProductoPage(1);
  }, []);

  const mostrarFormulario = useCallback(async (compra = null) => {
    setProductoPage(1);

    // ⚡ Refrescar productos y proveedores siempre para asegurar que salgan todos los nuevos
    setIsLoadingProducts(true);
    try {
      const [prData, pvData] = await Promise.all([
        fetchAllProductos(),
        fetchAllProveedores()
      ]);

      // Actualizar proveedores
      if (Array.isArray(pvData)) {
        setProveedores(pvData);
        NitroCache.set('compras_prov', pvData);
      }

      // Aseguramos que la data tenga los campos nombre/precio que espera el formulario
      const mapped = (Array.isArray(prData) ? prData : []).map(p => ({
        ...p,
        nombre: p.nombre || p.Nombre,
        id: p.id || p.IdProducto,
        precioCompra: p.precioCompra || p.PrecioCompra,
        precioVenta: p.precioVenta || p.PrecioVenta
      }));
      setProductos(mapped);
    } catch (e) {
      console.error('Error cargando datos del formulario:', e);
    } finally {
      setIsLoadingProducts(false);
    }

    if (compra) {
      if (compra.estado === 'Anulada') {
        showAlert('Las compras anuladas no se pueden editar', 'error');
        return;
      }
      setCompraEditando(compra);
      setNuevaCompra({
        proveedor: compra.proveedor,
        idProveedor: compra.idProveedor || '',
        metodoPago: compra.metodo,
        fecha: compra.fecha,
        productos: compra.productos.map(p => ({ ...p, _tempKey: Math.random() })),
        estado: compra.estado
      });
    } else {
      setCompraEditando(null);
      setNuevaCompra({
        proveedor: '',
        idProveedor: '',
        metodoPago: 'Efectivo',
        fecha: new Date().toLocaleDateString('es-CO'),
        productos: [{
          id: '',
          nombre: '',
          talla: '',
          cantidad: 1,
          precioCompra: '',
          precioVenta: '',
          precioMayorista6: '',
          precioMayorista80: '',
          _tempKey: Math.random()
        }],
        estado: 'Pendiente'
      });
    }
    setErrors({});
    setModoVista("formulario");
  }, [showAlert, productos.length]);

  const mostrarDetalle = useCallback((compra) => {
    setCompraViendo(compra);
    setModoVista("detalle");
    setProductoPage(1);
  }, []);

  // ✅ useEffect con dependencia estable
  useEffect(() => {
    if (location?.state?.openModal) {
      mostrarFormulario();
    }
  }, [location, mostrarFormulario]);

  const agregarProducto = useCallback(() => {
    setProductoPage(1);
    setNuevaCompra(p => ({
      ...p,
      productos: [...p.productos, {
        id: '',
        nombre: '',
        talla: '',
        cantidad: 1,
        precioCompra: '',
        precioVenta: '',
        precioMayorista6: '',
        precioMayorista80: '',
        _tempKey: Math.random()
      }]
    }));
  }, []);

  const actualizarProducto = useCallback((index, campo, valor) => {
    setNuevaCompra(p => {
      const n = [...p.productos];
      const prod = { ...n[index], [campo]: valor };
      
      n[index] = prod;
      return { ...p, productos: n };
    });
  }, []);

  const eliminarProducto = useCallback((index) => {
    if (nuevaCompra.productos.length > 1) {
      setNuevaCompra(p => ({
        ...p,
        productos: p.productos.filter((_, i) => i !== index)
      }));
    }
  }, [nuevaCompra.productos.length]);

  const calcularTotal = useCallback(() =>
    nuevaCompra.productos.reduce((t, p) => t + (p.cantidad * (parseFloat(p.precioCompra) || 0)), 0),
  [nuevaCompra.productos]);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    const e_fields = {};
    
    if (!nuevaCompra.proveedor) e_fields.proveedor = 'El proveedor es obligatorio';
    nuevaCompra.productos.forEach((p, i) => {
      if (!p.nombre) e_fields[`prod_${i}`] = true;
      if (!p.talla) e_fields[`talla_${i}`] = true;
      if (!p.cantidad || p.cantidad <= 0) e_fields[`qty_${i}`] = true;
      if (!p.precioCompra || p.precioCompra <= 0) e_fields[`price_${i}`] = true;
      if (!p.precioVenta || p.precioVenta <= 0) e_fields[`sell_${i}`] = true;
    });

    if (Object.keys(e_fields).length > 0) {
      setErrors(e_fields);
      showAlert("Por favor complete los campos obligatorios", "error");
      return;
    }

    const total = calcularTotal();
    const pvr = proveedoresActivos.find(p => p.nombre === nuevaCompra.proveedor);

    const payload = {
      ...nuevaCompra,
      idProveedor: pvr?.id || '',
      total
    };

    try {
      setActionLoadingText(compraEditando ? 'Actualizando...' : 'Guardando...');
      setActionLoading(true);
      if (compraEditando) {
        showAlert('Funcionalidad de edición conectando...');
      } else {
        await createNewCompra(payload);
        showAlert('Compra registrada correctamente');
      }
      fetchData();
      setTimeout(() => mostrarLista(), 1500);
    } catch (error) {
      const serverMsg = error.response?.data?.message;
      showAlert(serverMsg || 'Error al procesar la compra', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [nuevaCompra, compraEditando, proveedoresActivos, calcularTotal, fetchData, mostrarLista, showAlert]);



  const filtered = useMemo(() => {
    return compras.filter(c => {
      const search = (c.proveedor + c.id).toLowerCase().includes(searchTerm.toLowerCase());
      const status = filterStatus === 'Todos' || c.estado === filterStatus.slice(0, -1) || c.estado === filterStatus;
      
      let matchDate = true;
      if (filterDate) {
        const [, year, month, day] = filterDate.match(/(\d{4})-(\d{2})-(\d{2})/) || [];
        if (year && month && day) {
          const formattedFilter = new Date(`${year}-${month}-${day}T12:00:00`).toLocaleDateString('es-CO');
          matchDate = (c.fecha === formattedFilter);
        }
      }
      
      return search && status && matchDate;
    });
  }, [compras, searchTerm, filterStatus, filterDate]);

  const handleCompletarCompra = useCallback((compra) => {
    if (compra.estado !== 'Pendiente') return;
    setCompletarModal({ isOpen: true, compra });
  }, []);

  const confirmCompletarCompra = useCallback(async () => {
    if (!completarModal.compra) return;
    
    setActionLoadingText('Completando...');
    setActionLoading(true);
    try {
      await updateCompraStatus(completarModal.compra.numCompra, 'Completada');
      showAlert('Registro completado correctamente');
      setCompletarModal({ isOpen: false, compra: null });
      fetchData();
    } catch (error) {
      showAlert('Error al actualizar el estado', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [completarModal.compra, fetchData, showAlert]);

  return {
    modoVista, setModoVista,
    compras,
    availableStatuses,
    availablePaymentMethods,
    availableSizes,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    filterDate, setFilterDate,
    currentPage, setCurrentPage,
    itemsPerPage,
    productoPage, setProductoPage,
    alert, setAlert,
    errors, setErrors,
    compraViendo, setCompraViendo,
    compraEditando, setCompraEditando,
    completarModal, setCompletarModal,
    nuevaCompra, setNuevaCompra,
    proveedoresActivos,
    showAlert,
    mostrarLista,
    mostrarFormulario,
    mostrarDetalle,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    calcularTotal,
    handleSubmit,
    handleCompletarCompra,
    confirmCompletarCompra,
    filtered,
    actionLoading,
    actionLoadingText,
    availableProducts: productos,
    isLoadingProducts
  };
};