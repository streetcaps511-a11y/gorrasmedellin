import { useState, useEffect, useMemo, useCallback } from 'react';
import { categoriasApi } from '../services/categoriasApi';

export const ITEMS_PER_PAGE = 3;

export const INITIAL_CATEGORY_DATA = {
  nombre: '',
  descripcion: '',
  imagenUrl: '',
  isActive: true
};

const INITIAL_ALERT = { show: false, message: '', type: 'success' };
const INITIAL_MODAL = { isOpen: false, mode: 'view', category: null };
// 🧠 MEMORIA GLOBAL (Caché Nitro)
let categoriasCache = {
  categorias: [],
  availableStatuses: [],
  isInitialized: false
};

export const useCategoriasLogic = () => {
  // ────────────────────────────────────────────────────────────────────────
  // 📦 ESTADOS
  // ────────────────────────────────────────────────────────────────────────
  const [categorias, setCategorias] = useState(categoriasCache.categorias);
  const [availableStatuses, setAvailableStatuses] = useState(categoriasCache.availableStatuses);
  const [loading, setLoading] = useState(!categoriasCache.isInitialized);
  const [alert, setAlert] = useState(INITIAL_ALERT);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);

  const [modalState, setModalState] = useState(INITIAL_MODAL);
  const [deleteModalState, setDeleteModalState] = useState(INITIAL_MODAL);
  const [anularModalState, setAnularModalState] = useState({ isOpen: false, category: null });
  const [formData, setFormData] = useState(INITIAL_CATEGORY_DATA);
  const [errors, setErrors] = useState({});

  // ────────────────────────────────────────────────────────────────────────
  // 🔧 UTILIDADES
  // ────────────────────────────────────────────────────────────────────────
  const showAlert = useCallback((msg, type = 'success') => {
    setAlert({ show: true, message: msg, type });
    const timer = setTimeout(() => setAlert(INITIAL_ALERT), 3000);
    return () => clearTimeout(timer);
  }, []);

  const isValidUrl = useCallback((string) => {
    if (!string || string.trim() === '') return false;
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_CATEGORY_DATA);
    setErrors({});
  }, []);

  // ────────────────────────────────────────────────────────────────────────
  // 📥 CARGA DE DATOS DESDE API
  // ────────────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const [catData, statusData] = await Promise.all([
        categoriasApi.getAll(),
        categoriasApi.getStatuses()
      ]);
      
      const mappedCategories = Array.isArray(catData) ? catData.map(c => {
        const isActive = c.estado === true || c.Estado === true || c.isActive === true;
        return {
          id: c.id?.toString() || c.IdCategoria?.toString() || `cat-${Date.now()}`,
          nombre: c.nombre || c.Nombre || '',
          descripcion: c.descripcion || c.Descripcion || '',
          imagenUrl: c.imagenUrl || c.ImagenUrl || '',
          isActive: isActive,
          estado: isActive ? 'Activo' : 'Inactivo'
        };
      }) : [];

      setCategorias(mappedCategories);
      setAvailableStatuses(Array.isArray(statusData) ? statusData : []);
      
      // 💾 SINCRONIZAR CON MEMORIA GLOBAL
      categoriasCache = {
        categorias: mappedCategories,
        availableStatuses: Array.isArray(statusData) ? statusData : [],
        isInitialized: true
      };
    } catch (error) {
      console.error("❌ Error cargando categorías:", error);
      showAlert("Error cargando datos del servidor", "error");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchData(categorias.length === 0);
  }, [fetchData]);

  // ────────────────────────────────────────────────────────────────────────
  // 🔍 FILTRADO Y PAGINACIÓN
  // ────────────────────────────────────────────────────────────────────────
  const filteredCategories = useMemo(() => {
    return categorias.filter(cat => {
      if (filterStatus !== 'Todos' && filterStatus !== '') {
        // Normalizar comparación (Activos -> Activo, Inactivos -> Inactivo)
        const normalizedFilter = filterStatus.endsWith('s') ? filterStatus.slice(0, -1) : filterStatus;
        const catStatus = cat.isActive ? 'Activo' : 'Inactivo';
        
        if (cat.estado !== normalizedFilter && catStatus !== normalizedFilter) return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          cat.nombre?.toLowerCase().includes(term) ||
          cat.descripcion?.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [categorias, searchTerm, filterStatus]);
  
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCategories, currentPage]);


  // ────────────────────────────────────────────────────────────────────────
  // 🎮 HANDLERS: UI
  // ────────────────────────────────────────────────────────────────────────
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [totalPages]);

  const handleFilterSelect = useCallback((status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // ────────────────────────────────────────────────────────────────────────
  // 🪟 HANDLERS: MODALES
  // ────────────────────────────────────────────────────────────────────────
  const openModal = useCallback((mode = 'create', category = null) => {
    resetForm();
    if (category && (mode === 'edit' || mode === 'view')) {
      setFormData({
        nombre: category.nombre || '',
        descripcion: category.descripcion || '',
        imagenUrl: category.imagenUrl || '',
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    }
    setModalState({ isOpen: true, mode, category });
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setModalState(INITIAL_MODAL);
    resetForm();
  }, [resetForm]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error genérico al escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[field];
        return newErrs;
      });
    }

    // Validación en tiempo real para URL de imagen
    if (field === 'imagenUrl') {
      if (value.trim() !== '' && !isValidUrl(value)) {
        setErrors(prev => ({ ...prev, imagenUrl: 'URL inválida' }));
      } else {
        setErrors(prev => {
          const newErrs = { ...prev };
          delete newErrs.imagenUrl;
          return newErrs;
        });
      }
    }
  }, [errors, isValidUrl]);

  // ────────────────────────────────────────────────────────────────────────
  // 💾 HANDLERS: CRUD
  // ────────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const { nombre, descripcion, imagenUrl } = formData;
    const newErrors = {};

    if (!nombre?.trim()) newErrors.nombre = 'Nombre obligatorio';
    if (!descripcion?.trim()) newErrors.descripcion = 'Descripción obligatoria';
    if (!imagenUrl?.trim()) {
      newErrors.imagenUrl = 'URL de imagen obligatoria';
    } else if (!isValidUrl(imagenUrl)) {
      newErrors.imagenUrl = 'URL inválida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showAlert("Por favor complete todos los campos obligatorios", "error");
      return;
    }

    try {
      const payload = {
        nombre,
        descripcion,
        imagenUrl: imagenUrl || null,
        estado: formData.isActive
      };

      if (modalState.mode === 'edit' && modalState.category?.id) {
        // Actualización local inmediata
        setCategorias(prev => prev.map(c => 
          c.id === modalState.category.id ? { ...c, ...payload, isActive: payload.estado } : c
        ));
        closeModal();
        await categoriasApi.update(modalState.category.id, payload);
        showAlert(`Categoría "${nombre}" actualizada ✅`, 'success');
      } else {
        // Registro temporal para visualización instantánea
        const tempId = `temp-${Date.now()}`;
        setCategorias(prev => [{
            id: tempId,
            ...payload,
            isActive: payload.estado,
            estado: payload.estado ? 'Activo' : 'Inactivo'
        }, ...prev]);
        closeModal();
        
        await categoriasApi.create(payload);
        showAlert(`Categoría "${nombre}" registrada ✅`, 'success');
      }
      fetchData(); // Refrescar en segundo plano
    } catch (error) {
      console.error("❌ Error al guardar:", error);
      showAlert(error.response?.data?.message || "Error al guardar cambios", "error");
      fetchData(); // Re-sincronizar
    } finally {
      setLoading(false);
    }
  }, [formData, modalState, isValidUrl, showAlert, fetchData, closeModal]);

  const openDeleteModal = useCallback((category) => {
    if (category.isActive) {
      showAlert('⚠️ Desactive la categoría antes de eliminarla', 'error');
      return;
    }
    setDeleteModalState({ isOpen: true, category });
  }, [showAlert]);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalState(INITIAL_MODAL);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteModalState.category) return;
    
    setLoading(true);
    const categoryId = deleteModalState.category.id;
    setCategorias(prev => prev.filter(c => c.id !== categoryId));

    try {
      await categoriasApi.delete(categoryId);
      showAlert(`Categoría eliminada correctamente 🗑️`, 'success');
      
      setTimeout(() => {
        closeDeleteModal();
        setLoading(false);
        fetchData();
      }, 500);
    } catch (error) {
      console.error("❌ Error al eliminar:", error);
      showAlert(error.response?.data?.message || "Error al eliminar", "error");
      setLoading(false);
      fetchData();
    }
  }, [deleteModalState, showAlert, fetchData, closeDeleteModal]);

  const handleToggleStatus = useCallback((category) => {
    // Abrimos el modal tanto para activar como para desactivar
    setAnularModalState({ isOpen: true, category });
  }, []);

  const closeAnularModal = useCallback(() => {
    setAnularModalState({ isOpen: false, category: null });
  }, []);

  const handleConfirmToggle = useCallback(async (categoryInput = null, forceNewStatus = null) => {
    const category = categoryInput || anularModalState.category;
    if (!category) return;

    setLoading(true);
    const newStatus = forceNewStatus !== null ? forceNewStatus : !category.isActive;
    
    // 🚀 Actualización local inmediata (Optimistic UI)
    setCategorias(prev => prev.map(c => 
      c.id === category.id ? { ...c, isActive: newStatus, estado: newStatus ? 'Activo' : 'Inactivo' } : c
    ));
    
    try {
      const payload = {
        nombre: category.nombre,
        descripcion: category.descripcion,
        imagenUrl: category.imagenUrl || null,
        estado: newStatus
      };
      await categoriasApi.update(category.id, payload);
      showAlert(`Categoría ${newStatus ? 'activada ✅' : 'desactivada ⏸️'}`, newStatus ? 'success' : 'warning');
      
      setTimeout(() => {
        if (anularModalState.isOpen) closeAnularModal();
        setLoading(false);
        fetchData(); // Sincronizar
      }, 500);
    } catch (error) {
      console.error("❌ Error al cambiar estado:", error);
      // Revertir en caso de fallo
      setCategorias(prev => prev.map(c => 
        c.id === category.id ? { ...c, isActive: !newStatus, estado: !newStatus ? 'Activo' : 'Inactivo' } : c
      ));
      if (anularModalState.isOpen) closeAnularModal();
      showAlert(error.response?.data?.message || "Error al cambiar estado", "error");
      setLoading(false);
      fetchData();
    }
  }, [anularModalState, showAlert, fetchData, closeAnularModal]);


  // ────────────────────────────────────────────────────────────────────────
  // 📤 RETURN
  // ────────────────────────────────────────────────────────────────────────
  return {
    categorias,
    availableStatuses,
    loading,
    alert,
    searchTerm,
    setSearchTerm,
    filterStatus,
    currentPage,
    totalItems,
    totalPages,
    startItem,
    endItem,
    paginatedCategories,
    modalState,
    deleteModalState,
    anularModalState,
    formData,
    errors,
    handlePageChange,
    handleFilterSelect,
    clearSearch,
    openModal,
    closeModal,
    handleInputChange,
    handleSave,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    handleToggleStatus,
    handleConfirmToggle,
    closeAnularModal,
    refetch: fetchData
  };
};