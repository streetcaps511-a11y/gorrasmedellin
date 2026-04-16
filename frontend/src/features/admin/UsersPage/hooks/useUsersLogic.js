import { useState, useEffect, useCallback, useMemo } from 'react';
import * as usersService from '../services/usersApi';
import * as rolesService from '../../RolesPage/services/rolesApi';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { NitroCache } from '../../../shared/utils/NitroCache';

// 🧠 MEMORIA GLOBAL (Caché Nitro)
const getInitialUsers = () => {
  const cached = NitroCache.get('users_admin');
  return cached?.data || [];
};

let usersCache = {
  users: getInitialUsers(),
  availableStatuses: ['Activo', 'Inactivo'],
  availableRoles: [],
  isInitialized: false
};

export const useUsersLogic = () => {
  const { user: currentUser, updateUser: updateUserAuth } = useAuth();
  const [users, setUsers] = useState(usersCache.users);
  const [availableStatuses, setAvailableStatuses] = useState(usersCache.availableStatuses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [loading, setLoading] = useState(!usersCache.isInitialized && usersCache.users.length === 0);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [userToDelete, setUserToDelete] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  
  const initialFormState = {
    nombreCompleto: '',
    email: '',
    tipoDocumento: '',
    numeroDocumento: '',
    contacto: '',
    rol: '',
    idRol: '',
    clave: '',
    isActive: true
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [anularModal, setAnularModal] = useState({ isOpen: false, user: null });

  // ====== FETCH INICIAL ======
  const fetchData = useCallback(async () => {
    if (users.length === 0) setLoading(true);
    try {
      const [userData, statusData, rolesData] = await Promise.all([
        usersService.getUsers(),
        usersService.getStatuses(),
        rolesService.getRoles()
      ]);

      const statuses = statusData.map(s => {
        if (typeof s === 'string') return s;
        return s.nombre || s.Nombre || s.estado || s.Estado || String(s);
      });

      setUsers(userData);
      setAvailableStatuses(statuses);
      setAvailableRoles(rolesData);

      // 💾 SINCRONIZAR CACHÉ
      NitroCache.set('users_admin', userData);
      usersCache = {
        users: userData,
        availableStatuses: statuses,
        availableRoles: rolesData,
        isInitialized: true
      };
    } catch (error) {
      setAlert({ show: true, message: 'Error cargando datos: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [users.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ====== ALERTA ======
  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 2500);
  };

  const isAdministrador = (user) => {
    if (!user) return false;
    const rol = (user.rol || "").toLowerCase();
    const idRol = user.idRol || user.IdRol;
    const email = (user.email || "").toLowerCase();
    
    return rol === "administrador" || 
           idRol === 1 || idRol === "1" || 
           email === "duvann1991@gmail.com";
  };

  // ====== FILTRADO ======
  const filteredUsers = useMemo(() => {
    let result = users;
    const term = searchTerm.toLowerCase().trim();

    if (filterStatus !== 'Todos') {
      result = result.filter(u => {
        const statusLabel = u.isActive ? (availableStatuses[0] || 'Activo') : (availableStatuses[1] || 'Inactivo');
        return statusLabel === filterStatus;
      });
    }

    if (term) {
      result = result.filter(u => {
        const fullName = `${u.nombre} ${u.apellido}`.toLowerCase();
        return (
          fullName.includes(term) ||
          u.email.toLowerCase().includes(term) ||
          (u.rol?.toLowerCase() || "").includes(term) ||
          (u.numeroDocumento || "").toLowerCase().includes(term)
        );
      });
    }
    // Siempre poner al Administrador de primero, y luego ordenar por nombre
    return [...result].sort((a, b) => {
      const isAAdmin = isAdministrador(a);
      const isBAdmin = isAdministrador(b);
      
      if (isAAdmin && !isBAdmin) return -1;
      if (!isAAdmin && isBAdmin) return 1;
      
      const nameA = (a.nombre || "").toLowerCase();
      const nameB = (b.nombre || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [users, searchTerm, filterStatus, isAdministrador]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers.length);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // ====== HANDLERS ======
  const openModal = (user = null) => {
    setEditingUser(user);
    setErrors({});

    if (user) {
      setFormData({
        nombreCompleto: `${user.nombre || ''} ${user.apellido || ''}`.trim(),
        email: user.email || '',
        tipoDocumento: user.tipoDocumento || '',
        numeroDocumento: user.numeroDocumento || user.NumeroDocumento || '',
        contacto: user.telefono || user.Telefono || user.contacto || '',
        // 🛡️ CORRECCIÓN: Usar el ID del rol para el valor del select
        rol: user.idRol || user.IdRol || '2', 
        idRol: user.idRol || user.IdRol || '2',
        clave: '', 
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else {
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
    setFormData(initialFormState);
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombreCompleto?.trim()) newErrors.nombreCompleto = 'Nombre Completo es obligatorio';
    else if (formData.nombreCompleto.trim().split(/\s+/).length < 2) {
      newErrors.nombreCompleto = 'Debe ingresar nombre y apellido';
    }

    if (!formData.email?.trim()) newErrors.email = 'Email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email no válido';
    
    // 🛡️ Validación de Teléfono (Sincronizada con Cliente model)
    if (formData.contacto) {
      const cleanPhone = formData.contacto.replace(/\s+/g, '');
      if (!/^\d+$/.test(cleanPhone)) {
        newErrors.contacto = 'El teléfono debe contener solo números';
      } else if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        newErrors.contacto = 'El teléfono debe tener entre 7 y 15 dígitos';
      }
    } else {
      newErrors.contacto = 'Teléfono es obligatorio';
    }
    
    if (!formData.numeroDocumento?.trim()) {
      newErrors.numeroDocumento = 'Número de documento es obligatorio';
    } else if (!editingUser && formData.numeroDocumento.trim().length < 6) {
      newErrors.numeroDocumento = 'Para nuevos usuarios, el documento debe tener al menos 6 dígitos (será su clave inicial)';
    }

    if (!formData.rol && !formData.idRol) newErrors.rol = 'Rol es obligatorio';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      showAlert('Complete los campos obligatorios correctamente', 'error');
      return;
    }

    setLoading(true);
    const nameParts = (formData.nombreCompleto || '').trim().split(/\s+/);
    const nombre = nameParts[0] || '';
    const apellido = nameParts.slice(1).join(' ') || '';

    // 🛡️ CORRECCIÓN FINAL: Asegurar que idRol sea un número y venga del campo correcto
    const finalIdRol = isAdministrador(editingUser) ? 1 : (formData.rol || formData.idRol);

    const userData = {
      nombre,
      apellido,
      email: formData.email.trim(),
      tipoDocumento: formData.tipoDocumento,
      numeroDocumento: formData.numeroDocumento,
      telefono: formData.contacto,
      idRol: finalIdRol,
      isActive: formData.isActive
    };
    
    // Si es nuevo, la clave por defecto es el número de documento. 
    // Al editar, solo se incluye si se proporcionó una nueva en el estado (aunque el campo esté oculto en el form actual)
    if (!editingUser?.id) {
       userData.clave = formData.numeroDocumento;
    } else if (formData.clave && formData.clave.trim() !== '') {
       userData.clave = formData.clave.trim();
    }

    try {
      if (editingUser?.id) {
        // Special check for Administrador limit if editing to change role to Admin
        if (userData.rol === "Administrador" && editingUser.rol !== "Administrador") {
           const existingAdmin = users.find(u => u.rol === "Administrador");
           if (existingAdmin) throw new Error('Ya existe un usuario Administrador');
        }

        const updated = await usersService.updateUser(editingUser.id, userData);
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        
        // 🔄 Sincronizar con el estado global si el usuario se está editando a sí mismo
        if (currentUser && (updated.id === currentUser.id)) {
          console.log("🔄 Actualizando datos del usuario logueado en AuthContext");
          updateUserAuth(updated);
        }
        
        showAlert(`Usuario "${updated.nombre}" actualizado correctamente`);
      } else {
        // Special check for Administrador limit on new user
        if (userData.rol === "Administrador") {
          const existingAdmin = users.find(u => u.rol === "Administrador");
          if (existingAdmin) throw new Error('Ya existe un usuario Administrador');
        }

        const created = await usersService.createUser(userData);
        setUsers(prev => [created, ...prev]);
        showAlert(`Usuario "${created.nombre}" creado correctamente`);
      }
      closeModal();
    } catch (error) {
      showAlert(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (isAdministrador(user)) {
      showAlert('El usuario "Administrador" siempre está activo', "error");
      return;
    }
    setAnularModal({ isOpen: true, user });
  };

  const closeAnularModal = () => {
    setAnularModal({ isOpen: false, user: null });
  };

  const confirmToggleStatus = async () => {
    const user = anularModal.user;
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await usersService.toggleUserStatus(user.id);
      const nuevoEstado = response.estado || (user.isActive ? 'inactivo' : 'activo');
      const isActive = nuevoEstado === 'activo';
      
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive } : u));
      showAlert(`Usuario ${isActive ? 'activado' : 'desactivado'} correctamente`);
      closeAnularModal();
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
      showAlert('Error al actualizar estado del usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (user) => {
    if (isAdministrador(user)) {
      showAlert('El usuario "Administrador" no se puede eliminar', "error");
      return;
    }
    if (user.isActive) {
      showAlert('No se puede eliminar un usuario activo. Debe desactivarlo primero.', 'error');
      return;
    }
    setUserToDelete(user);
    setIsConfirmOpen(true);
  };

  const closeDeleteModal = () => {
    setIsConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setLoading(true);
    try {
      await usersService.deleteUser(userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      showAlert("Usuario eliminado correctamente");
      closeDeleteModal();
    } catch (error) {
      showAlert("Error al eliminar", "error");
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedUser(null);
  };

  return {
    users,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    currentPage, setCurrentPage,
    loading,
    alert, setAlert,
    formData,
    errors,
    isModalOpen,
    editingUser,
    isConfirmOpen,
    userToDelete,
    isDetailsOpen,
    selectedUser,
    filteredUsers,
    paginatedUsers,
    totalPages,
    availableRoles,
    openModal,
    closeModal,
    handleInputChange,
    handleSave,
    handleToggleStatus,
    confirmToggleStatus,
    closeAnularModal,
    anularModal,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    viewUserDetails,
    closeDetails,
    isAdministrador,
    availableStatuses
  };
};
