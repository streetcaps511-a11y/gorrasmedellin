import { useState, useEffect, useMemo, useCallback } from 'react';
import { categoriasApi } from '../services/categoriasApi';
import { NitroCache } from '../../../shared/utils/NitroCache';

export const ITEMS_PER_PAGE = 7;
const CACHE_KEY = 'admin_categorias';

const getInitialCache = () => {
  const cached = NitroCache.get(CACHE_KEY);
  return Array.isArray(cached?.data) ? cached.data : [];
};

export const useCategoriasLogic = () => {
  const [categorias, setCategorias] = useState(() => getInitialCache());
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [loading, setLoading] = useState(getInitialCache().length === 0);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'view', category: null });
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, category: null });
  const [anularModalState, setAnularModalState] = useState({ isOpen: false, category: null });
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', imagenUrl: '', isActive: true });
  const [errors, setErrors] = useState({});

  const showAlert = useCallback((msg, type = 'success') => {
    setAlert({ show: true, message: msg, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const fetchData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const [catData, statusData] = await Promise.all([
        categoriasApi.getAll(),
        categoriasApi.getStatuses()
      ]);
      
      const mappedCategories = Array.isArray(catData) ? catData.map(c => ({
          id: c.id?.toString() || c.IdCategoria?.toString() || `cat-${Date.now()}`,
          nombre: c.nombre || c.Nombre || '',
          descripcion: c.descripcion || c.Descripcion || '',
          imagenUrl: c.imagenUrl || c.ImagenUrl || '',
          isActive: c.estado === true || c.Estado === true || c.isActive === true,
          estado: (c.estado || c.isActive) ? 'Activo' : 'Inactivo'
      })) : [];

      setCategorias(mappedCategories);
      setAvailableStatuses(Array.isArray(statusData) ? statusData : []);
      NitroCache.set(CACHE_KEY, mappedCategories);
    } catch (error) {
      console.error("❌ Error cargando categorías:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(categorias.length === 0);
  }, [fetchData]); // 👈 Remover categorias.length para evitar re-fetch prematuro al borrar

  const filteredCategories = useMemo(() => {
    return categorias.filter(cat => {
      if (filterStatus !== 'Todos' && filterStatus !== '') {
        const normalizedFilter = filterStatus.endsWith('s') ? filterStatus.slice(0, -1) : filterStatus;
        const catStatus = cat.isActive ? 'Activo' : 'Inactivo';
        if (catStatus !== normalizedFilter) return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return cat.nombre?.toLowerCase().includes(term) || cat.descripcion?.toLowerCase().includes(term);
      }
      return true;
    });
  }, [categorias, searchTerm, filterStatus]);
  
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCategories, currentPage]);

  const handleToggleStatus = (category) => setAnularModalState({ isOpen: true, category });
  const closeAnularModal = () => setAnularModalState({ isOpen: false, category: null });

  const handleConfirmToggle = useCallback(async () => {
    const { category } = anularModalState;
    if (!category) return;
    const newStatus = !category.isActive;
    
    // Actuamos de inmediato en la UI
    setCategorias(prev => prev.map(c => c.id === category.id ? { ...c, isActive: newStatus, estado: newStatus ? 'Activo' : 'Inactivo' } : c));
    closeAnularModal();

    // Notar de inmediato a otras pestañas
    const channel = new BroadcastChannel('app_sync');
    channel.postMessage('categorias_updated');
    channel.close();

    try {
      showAlert(`Categoría ${newStatus ? 'activada ✅' : 'desactivada ⏸️'}`, newStatus ? 'success' : 'warning');
      await categoriasApi.update(category.id, { ...category, estado: newStatus });
      fetchData(); // Sincronizar suavemente en segundo plano
    } catch (error) {
      fetchData();
      showAlert("Error al cambiar estado", "error");
    }
  }, [anularModalState, showAlert, fetchData]);

  return {
    categorias, paginatedCategories, loading, alert, setAlert, searchTerm, setSearchTerm,
    filterStatus, setFilterStatus, currentPage, setCurrentPage,
    totalItems: filteredCategories.length,
    totalPages: Math.ceil(filteredCategories.length / ITEMS_PER_PAGE) || 1,
    startItem: filteredCategories.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1,
    endItem: Math.min(currentPage * ITEMS_PER_PAGE, filteredCategories.length),
    modalState, setModalState, deleteModalState, setDeleteModalState, anularModalState,
    formData, setFormData, errors, setErrors,
    handleInputChange: (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    },
    handlePageChange: (p) => setCurrentPage(p),
    handleFilterSelect: (s) => { setFilterStatus(s); setCurrentPage(1); },
    clearSearch: () => { setSearchTerm(''); setCurrentPage(1); },
    openModal: (mode = 'create', cat = null) => {
      if (cat) setFormData({ nombre: cat.nombre, descripcion: cat.descripcion, imagenUrl: cat.imagenUrl, isActive: cat.isActive });
      else setFormData({ nombre: '', descripcion: '', imagenUrl: '', isActive: true });
      setModalState({ isOpen: true, mode, category: cat });
    },
    closeModal: () => setModalState({ isOpen: false, mode: 'view', category: null }),
    handleSave: async () => {
      // Validación de campos
      const newErrors = {};
      if (!formData.nombre || !formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
      if (!formData.descripcion || !formData.descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria';
      if (!formData.imagenUrl || !formData.imagenUrl.trim()) newErrors.imagenUrl = 'La URL de imagen es obligatoria';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        showAlert("Complete los campos obligatorios", "error");
        return;
      }
      setErrors({});
      setLoading(true);
      try {
        if (modalState.mode === 'edit') {
          await categoriasApi.update(modalState.category.id, formData);
        } else {
          await categoriasApi.create(formData);
        }
        setModalState({ isOpen: false, mode: 'view', category: null });
        showAlert("Cambios guardados ✅");
        const channel = new BroadcastChannel('app_sync');
        channel.postMessage('categorias_updated');
        channel.close();
        fetchData();
      } catch (error) {
        const msg = error?.response?.data?.message || error?.message || "Error al guardar";
        showAlert(msg, "error");
      } finally { setLoading(false); }
    },
    handleToggleStatus, handleConfirmToggle, closeAnularModal,
    openDeleteModal: (cat) => setDeleteModalState({ isOpen: true, category: cat }),
    closeDeleteModal: () => setDeleteModalState({ isOpen: false, category: null }),
    handleDelete: async () => {
      const category = deleteModalState.category;
      if (!category) return;

      setLoading(true);
      try {
        await categoriasApi.delete(category.id);
        
        // Sincronizar estado local
        setCategorias(prev => prev.filter(c => c.id !== category.id));
        showAlert("Eliminado correctamente 🗑️");
        
        const channel = new BroadcastChannel('app_sync');
        channel.postMessage('categorias_updated');
        channel.close();
        
        // Actualizar caché
        const updated = categorias.filter(c => c.id !== category.id);
        NitroCache.set(CACHE_KEY, updated);

        setDeleteModalState({ isOpen: false, category: null });
      } catch (error) {
        const msg = error?.response?.data?.message || "Error al eliminar";
        showAlert(msg, "error");
      } finally {
        setLoading(false);
      }
    }
  };
};