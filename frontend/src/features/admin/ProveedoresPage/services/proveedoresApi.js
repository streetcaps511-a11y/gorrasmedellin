/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

import * as adminApi from "../../../shared/services/adminApi.js";

/**
 * Mapea los datos del backend al formato del frontend
 */
export const mapBackendToFrontend = (p) => ({
  id: p.id || p.IdProveedor,
  companyName: p.companyName || p.Nombre || "",
  documentNumber: p.documentNumber || p.NumeroDocumento || "",
  contactName: p.contactName || p.Contacto || p.Nombre || "", // In natural person mode, Nombre is used for contactName if Contacto is missing
  email: p.email || p.Correo || "",
  phone: p.phone || p.Telefono || "",
  isActive: p.isActive !== undefined ? !!p.isActive : (p.Estado !== undefined ? !!p.Estado : true),
  supplierType: p.supplierType || (p.TipoProveedor === 'Empresa' ? 'Persona Jurídica' : p.TipoProveedor) || '',
  documentType: p.TipoDocumento || p.documentType || '',
  address: p.Direccion || p.address || "",
  department: p.Departamento || p.department || "",
  city: p.Ciudad || p.city || "",
  searchField: `${p.Nombre} ${p.TipoDocumento} ${p.NumeroDocumento} ${p.Correo} ${p.Telefono}`
});

/**
 * Mapea los datos del frontend al formato del backend
 */
export const mapFrontendToBackend = (p) => {
  const payload = { ...p };
  // Fallbacks para que Sequelize lo entienda según los modelos:
  if (!payload.companyName && payload.supplierType === 'Persona Natural') {
    payload.companyName = payload.contactName || `${payload.firstName || ''} ${payload.lastName || ''}`.trim();
  }
  return payload;
};

export const getProveedores = async () => {
  try {
    const response = await adminApi.getProveedores();
    const data = response?.data?.data || [];
    return data.map(mapBackendToFrontend);
  } catch (error) {
    if (error.response?.status !== 401 && error.response?.status !== 400) {
      console.error("Error fetching proveedores:", error);
    }
    throw error;
  }
};

export const createProveedor = async (proveedorData) => {
  try {
    const backendData = mapFrontendToBackend(proveedorData);
    const response = await adminApi.createProveedor(backendData);
    return mapBackendToFrontend(response.data?.data || response.data);
  } catch (error) {
    if (error.response?.status !== 400) {
      console.error("Error creating proveedor:", error);
    }
    throw error;
  }
};

export const updateProveedor = async (id, proveedorData) => {
  try {
    const backendData = mapFrontendToBackend(proveedorData);
    const response = await adminApi.updateProveedor(id, backendData);
    return mapBackendToFrontend(response.data?.data || response.data);
  } catch (error) {
    if (error.response?.status !== 400) {
      console.error("Error updating proveedor:", error);
    }
    throw error;
  }
};

export const deleteProveedor = async (id) => {
  try {
    await adminApi.deleteProveedor(id);
    return true;
  } catch (error) {
    if (error.response?.status !== 400) {
      console.error("Error deleting proveedor:", error);
    }
    throw error;
  }
};

// Externos - Colombia API
export const getDepartments = async () => {
  try {
    const response = await fetch('https://api-colombia.com/api/v1/Department');
    const data = await response.json();
    return data.sort((a, b) => a.name.localeCompare(b.name)).map(d => ({ value: d.name, label: d.name, id: d.id }));
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [
      { value: 'Antioquia', label: 'Antioquia', id: 1 },
      { value: 'Atlántico', label: 'Atlántico', id: 4 },
      { value: 'Bogotá D.C.', label: 'Bogotá D.C.', id: 100 },
      { value: 'Bolívar', label: 'Bolívar', id: 5 },
      { value: 'Cundinamarca', label: 'Cundinamarca', id: 11 },
      { value: 'Santander', label: 'Santander', id: 21 },
      { value: 'Valle del Cauca', label: 'Valle del Cauca', id: 25 }
    ];
  }
};

export const getCitiesByDepartment = async (deptId) => {
  try {
    const response = await fetch(`https://api-colombia.com/api/v1/Department/${deptId}/cities`);
    const data = await response.json();
    if (Array.isArray(data)) {
      return data.sort((a, b) => a.name.localeCompare(b.name)).map(c => ({ value: c.name, label: c.name }));
    }
    return [{ value: 'Ciudad Principal', label: 'Sin datos de municipios' }];
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};
export const getStatuses = async () => {
  try {
    const response = await adminApi.getEstados();
    return response.data?.data || response.data || [];
  } catch (error) {
    if (error.response?.status !== 400) {
      console.error("Error fetching provider statuses:", error);
    }
    throw error;
  }
};
