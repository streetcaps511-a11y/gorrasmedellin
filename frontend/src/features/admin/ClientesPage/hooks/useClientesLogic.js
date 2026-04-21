import { useState, useEffect, useCallback, useRef } from 'react';
import { NitroCache } from '../../../shared/utils/NitroCache';
import { 
  fetchAllClientes,
  createNewCliente,
  updateExistingCliente,
  deleteExistingCliente
} from "../services/clientesApi";

// 🧠 MEMORIA GLOBAL (Caché Nitro)
let clientesCache = {
  clientes: [],
  isInitialized: false
};

// 🧠 CONFIGURACIÓN INICIAL (Caché Nitro Persistente)
const getInitialClientes = () => {
  const cached = NitroCache.get('clientes');
  return Array.isArray(cached?.data) ? cached.data : [];
};
const getInitialDepts = () => {
  const cached = NitroCache.get('departamentos');
  return cached?.data || [];
};

export const useClientesLogic = () => {
  const initialClientes = getInitialClientes();
  const [clientes, setClientes] = useState(initialClientes);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [departamentos, setDepartamentos] = useState(getInitialDepts());
  const [loading, setLoading] = useState(initialClientes.length === 0);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'view',
    cliente: null
  });
  const [ciudades, setCiudades] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [formData, setFormData] = useState({
    documentType: '',
    documentNumber: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    department: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, cliente: null, customMessage: '' });
  const [anularModal, setAnularModal] = useState({ isOpen: false, cliente: null, onReactivar: false });
  const firstInputRef = useRef(null);

  const filtered = clientes.filter(c => {
    const search = (
      (c.nombreCompleto || '') +
      (c.email || '') +
      (c.telefono || '') +
      (c.numeroDocumento || '') +
      (c.ciudad || '') +
      (c.departamento || '') +
      (c.tipoDocumento || '')
    ).toLowerCase().includes(searchTerm.toLowerCase());
    const status = filterStatus === 'Todos' || 
      (filterStatus === 'Activos' && c.isActive) || 
      (filterStatus === 'Inactivos' && !c.isActive);

    return search && status;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const paginatedClientes = filtered.slice(startIndex, endIndex);
  const showingStart = filtered.length > 0 ? startIndex + 1 : 0;

  const loadClientes = async () => {
    try {
      const current = getInitialClientes();
      if (current.length === 0) setLoading(true);
      
      const data = await fetchAllClientes();
      
      // 💾 GUARDAR EN NITRO CACHE PERSISTENTE
      NitroCache.set('clientes', data);
      setClientes(data);
    } catch (error) {
      console.error("Error loading clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        if (getInitialDepts().length > 0) return;
        
        const res = await fetch('https://api-colombia.com/api/v1/Department');
        const data = await res.json();
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
        
        NitroCache.set('departamentos', sorted);
        setDepartamentos(sorted);
      } catch {
        console.error("Error loading departments");
      }
    };
    fetchDepartamentos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (modalState.isOpen && (modalState.mode === 'create' || modalState.mode === 'edit')) {
      const timer = setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [modalState.isOpen, modalState.mode]);

  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const loadCitiesByDepartment = async (deptId) => {
    if (!deptId) {
      setCiudades([]);
      return;
    }
    setLoadingCities(true);
    try {
      const res = await fetch(`https://api-colombia.com/api/v1/City?departmentId=${deptId}`);
      const data = await res.json();
      setCiudades(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      showAlert('Error cargando ciudades', 'error');
    }
    setLoadingCities(false);
  };

  const openModal = (mode = 'create', cliente = null) => {
    setModalState({ isOpen: true, mode, cliente });
    setErrors({});
    
    if (cliente && (mode === 'edit' || mode === 'view')) {
      const dept = departamentos.find(d => d.name === cliente.departamento);
      if (dept) loadCitiesByDepartment(dept.id);

      setFormData({
        documentType: cliente.tipoDocumento,
        documentNumber: cliente.numeroDocumento,
        fullName: cliente.nombreCompleto,
        email: cliente.email,
        phone: cliente.telefono,
        address: cliente.direccion,
        city: cliente.ciudad,
        department: dept?.id || '',
        isActive: cliente.isActive
      });
    } else {
      setFormData({
        documentType: '',
        documentNumber: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        department: '',
        isActive: true
      });
      setCiudades([]);
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'view', cliente: null });
    setFormData({
      documentType: '',
      documentNumber: '',
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      department: '',
      isActive: true
    });
    setErrors({});
    setCiudades([]);
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      const newErr = { ...errors };
      delete newErr[field];
      setErrors(newErr);
    }
    
    if (field === 'department') {
      loadCitiesByDepartment(value);
      setFormData(prev => ({ ...prev, department: value, city: '' }));
    } else if (field === 'documentNumber') {
      const val = value.replace(/\D/g, '').slice(0, 12);
      setFormData(prev => ({ ...prev, [field]: val }));
    } else if (field === 'phone') {
      const val = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [field]: val }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    const required = [
      ['documentType', 'Tipo de documento'],
      ['documentNumber', 'Número de documento'],
      ['fullName', 'Nombre completo'],
      ['email', 'Email'],
      ['phone', 'Teléfono'],
      ['address', 'Dirección'],
      ['department', 'Departamento'],
      ['city', 'Ciudad'],
    ];
    
    const newErrors = {};
    required.forEach(([field, label]) => {
      if (!String(formData[field] || '').trim()) newErrors[field] = `${label} es obligatorio`;
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.documentNumber && (formData.documentNumber.length < 6 || formData.documentNumber.length > 12)) {
      newErrors.documentNumber = 'El documento debe tener entre 6 y 12 dígitos';
    }

    if (formData.phone && formData.phone.length !== 10) {
      newErrors.phone = 'El teléfono debe tener 10 dígitos';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      showAlert('Complete los campos obligatorios correctamente', 'error');
      return;
    }

    const deptObj = departamentos.find(d => d.id.toString() === formData.department);
    const cityObj = ciudades.find(c => c.id.toString() === formData.city);

    const apiClienteData = {
      tipoDocumento: formData.documentType,
      numeroDocumento: formData.documentNumber,
      nombreCompleto: formData.fullName,
      email: formData.email,
      telefono: formData.phone,
      direccion: formData.address,
      ciudad: cityObj?.name || formData.city,
      departamento: deptObj?.name || formData.department,
      saldoFavor: '0',
      isActive: formData.isActive
    };

    try {
      if (modalState.mode === 'edit') {
        const updatedId = modalState.cliente.id;
        
        // Optimistic UI
        setClientes(prev => {
            const next = prev.map(c => c.id === updatedId ? { ...c, ...apiClienteData } : c);
            clientesCache.clientes = next;
            return next;
        });
        closeModal();

        await updateExistingCliente(updatedId, apiClienteData);
        showAlert(`Cliente ${apiClienteData.nombreCompleto} actualizado correctamente ✅`);
      } else {
        // Optimistic UI (Temp ID)
        const tempId = `temp-${Date.now()}`;
        setClientes(prev => {
            const next = [{ id: tempId, ...apiClienteData }, ...prev];
            clientesCache.clientes = next;
            return next;
        });
        closeModal();

        await createNewCliente(apiClienteData);
        showAlert(`Cliente ${apiClienteData.nombreCompleto} registrado correctamente ✅`);
      }
      loadClientes(); // Refresh
    } catch (err) {
      showAlert('Error al guardar el cliente', 'error');
      loadClientes(); // Re-sync
    }
  };

  const openDeleteModal = (cliente) => {
    if (cliente.isActive) {
      showAlert(`No se puede eliminar el cliente "${cliente.nombreCompleto}" porque está activo. Desactívelo primero.`, 'error');
      return;
    }
    
    const mensaje = `¿Estás seguro que deseas eliminar permanentemente al cliente "${cliente.nombreCompleto}"?`;
    setDeleteModal({ 
      isOpen: true, 
      cliente,
      customMessage: mensaje
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, cliente: null, customMessage: '' });
  };

  const handleDelete = async () => {
    const cliente = deleteModal.cliente;
    if (!cliente) return;
    
    setLoading(true);
    try {
      await deleteExistingCliente(cliente.id);
      
      // Sincronizar estado local
      setClientes(prev => {
        const next = prev.filter(c => c.id !== cliente.id);
        clientesCache.clientes = next;
        return next;
      });
      
      // Notificar éxito y actualizar caché
      showAlert(cliente.nombreCompleto, 'delete');
      const updatedData = await fetchAllClientes();
      NitroCache.set('clientes', updatedData);

      closeDeleteModal();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al eliminar cliente';
      showAlert(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (cliente, newStatus) => {
    try {
      const apiClienteData = {
        ...cliente,
        isActive: newStatus
      };
      await updateExistingCliente(cliente.id, apiClienteData);
      showAlert(`Cliente "${cliente.nombreCompleto}" ${newStatus ? 'reactivado' : 'desactivado'}`, newStatus ? 'success' : 'error');
      loadClientes();
      
      if (modalState.isOpen && modalState.cliente && String(modalState.cliente.id) === String(cliente.id)) {
        setFormData(prev => ({ ...prev, isActive: newStatus }));
      }
    } catch (err) {
      showAlert('Error al cambiar estado del cliente', 'error');
    }
  };

  const handleReactivar = (cliente) => {
    setAnularModal({ isOpen: true, cliente, onReactivar: true });
  };
  
  const handleDesactivar = (cliente) => {
    setAnularModal({ isOpen: true, cliente, onReactivar: false });
  };

  const closeAnularModal = () => {
    setAnularModal({ isOpen: false, cliente: null, onReactivar: false });
  };

  const confirmToggleStatus = async () => {
    const { cliente, onReactivar } = anularModal;
    if (!cliente) return;
    
    const newStatus = onReactivar;
    
    // 🚀 Update UI immediately
    setClientes(prev => prev.map(c => c.id === cliente.id ? { ...c, isActive: newStatus } : c));
    closeAnularModal();

    try {
      const apiClienteData = {
        ...cliente,
        isActive: newStatus
      };
      await updateExistingCliente(cliente.id, apiClienteData);
      showAlert(`Cliente "${cliente.nombreCompleto}" ${newStatus ? 'reactivado' : 'desactivado'} ✅`, newStatus ? 'success' : 'error');
      loadClientes(); // Re-sync in background
    } catch (err) {
      loadClientes(); // Revert on failure
      showAlert('Error al cambiar estado del cliente', 'error');
    }
  };

  return {
    clientes, setClientes,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    currentPage, setCurrentPage,
    alert, setAlert,
    departamentos, setDepartamentos,
    ciudades, setCiudades,
    loadingCities, setLoadingCities,
    modalState, setModalState,
    formData, setFormData,
    errors, setErrors,
    loading,
    deleteModal, setDeleteModal,
    firstInputRef,
    filtered,
    totalPages,
    paginatedClientes,
    showingStart, endIndex,
    showAlert,
    handleFilterSelect,
    loadCitiesByDepartment,
    openModal,
    closeModal,
    handleInputChange,
    handleSave,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    handleReactivar,
    handleDesactivar,
    anularModal,
    confirmToggleStatus,
    closeAnularModal
  };
};
