import { useState, useEffect, useCallback, useMemo } from 'react';
import * as rolesService from '../services/rolesApi';
import { NitroCache } from '../../../shared/utils/NitroCache';

// 🧠 MEMORIA GLOBAL (Caché Nitro)
const getInitialRoles = () => {
  const cached = NitroCache.get('roles_admin');
  return cached?.data || [];
};

let rolesCache = {
  roles: getInitialRoles(),
  isInitialized: false
};

export const useRolesLogic = (initialAvailablePermissions = []) => {
  const [roles, setRoles] = useState(rolesCache.roles);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [loading, setLoading] = useState(!rolesCache.isInitialized && rolesCache.roles.length === 0);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  
  const [currentRole, setCurrentRole] = useState({
    name: "",
    description: "",
    permissions: [],
    isActive: true,
  });

  const [modalState, setModalState] = useState({ 
    isOpen: false, 
    mode: 'create', // create, edit, details
    role: null 
  });

  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    role: null 
  });
  
  const [anularModal, setAnularModal] = useState({ 
    isOpen: false, 
    role: null 
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    permissions: false
  });

  // ====== FETCH INICIAL ======
  const fetchData = useCallback(async () => {
    if (roles.length === 0) setLoading(true);
    try {
      const data = await rolesService.getRoles();
      // Ensure "Administrador" role has special handling if needed
      const processed = data.map(role => 
        (role.name || "").toLowerCase() === "administrador"
          ? { ...role, description: role.description || "Acceso total al sistema" }
          : role
      );
      setRoles(processed);
      
      // 💾 SINCRONIZAR CACHÉ
      NitroCache.set('roles_admin', processed);
      rolesCache = { roles: processed, isInitialized: true };
    } catch (error) {
      setAlert({ show: true, message: 'Error cargando roles: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []); // 👈 Remover roles.length para evitar re-fetch prematuro al borrar

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ====== HELPERS ======
  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 2500);
  };

  const isAdministrador = (role) => (role?.name || "").toLowerCase() === "administrador";

  // ====== FILTRADO ======
  const filteredRoles = useMemo(() => {
    let result = roles;
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(r => 
        (r.name || "").toLowerCase().includes(term) ||
        (r.description || "").toLowerCase().includes(term)
      );
    }
    if (filterStatus !== 'Todos') {
      const statusBool = filterStatus === 'Activos';
      result = result.filter(p => p.isActive === statusBool);
    }
    return result;
  }, [roles, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRoles.length);
  const paginatedRoles = filteredRoles.slice(startIndex, endIndex);
  const showingStart = filteredRoles.length > 0 ? startIndex + 1 : 0;

  // ====== HANDLERS ======
  const openModal = (mode = 'create', role = null) => {
    if (mode === 'edit' && isAdministrador(role)) {
      showAlert('El rol "Administrador" no se puede editar', "error");
      return;
    }
    setModalState({ isOpen: true, mode, role });
    setFieldErrors({ name: false, permissions: false });
    if (role) {
      setCurrentRole({ ...role });
    } else {
      setCurrentRole({ name: "", description: "", permissions: [], isActive: true });
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'create', role: null });
    setCurrentRole({ name: "", description: "", permissions: [], isActive: true });
  };

  const validate = () => {
    const errors = {
      name: !currentRole.name?.trim(),
      permissions: currentRole.permissions.length === 0 && !isAdministrador(currentRole)
    };
    setFieldErrors(errors);
    return !errors.name && !errors.permissions;
  };

  const handleSave = async () => {
    if (!validate()) {
      showAlert("Complete todos los campos requeridos", "error");
      return;
    }

    setLoading(true);
    try {
      if (modalState.mode === 'edit') {
        const updated = await rolesService.updateRole(currentRole.id, currentRole);
        setRoles(prev => prev.map(r => r.id === updated.id ? updated : r));
        showAlert("Rol actualizado correctamente");
      } else {
        const created = await rolesService.createRole(currentRole);
        setRoles(prev => [created, ...prev]);
        showAlert("Rol creado correctamente");
      }
      closeModal();
    } catch (error) {
      showAlert("Error al guardar: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (role) => {
    if (isAdministrador(role)) {
      showAlert('El rol "Administrador" siempre está activo', "error");
      return;
    }
    setAnularModal({ isOpen: true, role });
  };

  const closeAnularModal = () => {
    setAnularModal({ isOpen: false, role: null });
  };

  const confirmToggleStatus = async () => {
    const role = anularModal.role;
    if (!role) return;

    setLoading(true);
    try {
      const nuevoEstado = !role.isActive;
      await rolesService.updateRole(role.id, { ...role, isActive: nuevoEstado });
      setRoles(prev => prev.map(r => r.id === role.id ? { ...r, isActive: nuevoEstado } : r));
      showAlert(`Rol "${role.name}" ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
      closeAnularModal();
    } catch (error) {
      showAlert("Error al actualizar estado", "error");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (role) => {
    if (isAdministrador(role)) {
      showAlert('El rol "Administrador" no se puede eliminar', "error");
      return;
    }
    if (role.isActive) {
      showAlert('No se puede eliminar un rol activo. Primero desactívelo.', "error");
      return;
    }
    setDeleteModal({ isOpen: true, role });
  };

  const closeDeleteModal = () => setDeleteModal({ isOpen: false, role: null });

  const handleDelete = async () => {
    const roleToDelete = deleteModal.role;
    if (!roleToDelete) return;

    setLoading(true);
    try {
      await rolesService.deleteRole(roleToDelete.id);
      
      // Sincronizar estado local
      setRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
      showAlert(`Rol "${roleToDelete.name}" eliminado correctamente`, "delete");
      
      // Sincronizar caché
      const updated = roles.filter(r => r.id !== roleToDelete.id);
      NitroCache.set('roles_admin', updated);
      
      closeDeleteModal();
    } catch (error) {
      const msg = error.response?.data?.message || "Error al eliminar";
      showAlert(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    roles,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    currentPage, setCurrentPage,
    loading,
    alert, setAlert,
    currentRole, setCurrentRole,
    modalState,
    deleteModal,
    fieldErrors,
    setFieldErrors,
    filteredRoles,
    paginatedRoles,
    totalPages,
    showingStart,
    endIndex,
    openModal,
    closeModal,
    handleSave,
    handleToggleStatus,
    confirmToggleStatus,
    closeAnularModal,
    anularModal,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    isAdministrador,
    isRestrictedRole: (role) => (role?.name || "").toLowerCase() === "administrador" || (role?.name || "").toLowerCase() === "cliente"
  };
};
