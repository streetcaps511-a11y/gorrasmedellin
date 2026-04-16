import * as adminApi from "../../../shared/services/adminApi.js";
import api from "../../../shared/services/api.js";

/**
 * Mapea los datos del backend al formato del frontend
 */
export const mapBackendToFrontend = (v) => {
  if (!v) return null;
  
  // El nombre del estado ahora viene en IdEstado (mayúscula) o idEstado (minúscula) como string
  const estadoNombre = v.IdEstado || v.idEstado || v.Estado || v.estado || 'Pendiente';
  
  // Extraer el nombre del cliente
  const clienteNombre = v.clienteData?.Nombre || v.clienteData?.nombreCompleto || v.ClienteNombre || v.cliente || 'Desconocido';

  // Manejar el comprobante (evidencia)
  const getEvidencia = () => {
    const raw = v.comprobante || v.Comprobante || v.ComprobanteUrl || v.evidencia || null;
    if (raw && typeof raw === 'string' && raw.startsWith('/uploads')) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      return `${baseUrl}${raw}`;
    }
    return raw;
  };

  // Manejar el segundo comprobante
  const getEvidencia2 = () => {
    const raw = v.comprobante2 || v.Comprobante2 || null;
    if (raw && typeof raw === 'string' && raw.startsWith('/uploads')) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      return `${baseUrl}${raw}`;
    }
    return raw;
  };

  return {
    id: v.id || v.IdVenta,
    cliente: clienteNombre,
    idCliente: v.idCliente || v.IdCliente,
    fecha: (v.fecha || v.Fecha) ? new Date(v.fecha || v.Fecha).toLocaleDateString('es-CO') : '',
    total: parseFloat(v.total || v.Total || 0),
    montoPagado: parseFloat(v.montoPagado || v.MontoPagado || 0),
    monto1: parseFloat(v.monto1 || v.Monto1 || 0),
    monto2: parseFloat(v.monto2 || v.Monto2 || 0),
    metodoPago: v.metodoPago || v.MetodoPago || '',
    estado: estadoNombre,
    idEstado: v.idEstado || v.IdEstado,
    evidencia: getEvidencia(),
    evidencia2: getEvidencia2(),
    tipoEntrega: v.tipoEntrega || v.TipoEntrega || 'envio',
    direccionEnvio: v.direccionEnvio || v.DireccionEnvio || 'N/A',
    motivoRechazo: v.motivoRechazo || v.MotivoRechazo || '',
    productos: (v.detalles || v.Productos || v.productos || []).map(d => ({
      id: d.idProducto || d.id,
      nombre: d.producto?.nombre || d.nombre || 'Producto',
      talla: d.talla || '',
      cantidad: d.cantidad || 1,
      precio: d.precio || d.producto?.precioVenta || 0,
      subtotal: d.subtotal || 0
    }))
  };
};

/**
 * Mapea los datos del frontend al formato que el BACKEND espera en req.body
 */
export const mapFrontendToBackend = (v) => ({
  idCliente: parseInt(v.idCliente) || null,
  productos: (v.productos || []).map(p => ({
    idProducto: p.id,
    cantidad: parseInt(p.cantidad) || 1,
    precio: parseFloat(p.precio) || 0,
    talla: p.talla || ''
  })),
  metodoPago: v.metodoPago || 'Efectivo',
  comprobante: v.evidencia || null,
  direccionEnvio: v.direccionEnvio || null,
  tipoEntrega: v.tipoEntrega || 'envio'
});

export const getSales = async () => {
  try {
    const response = await adminApi.getSales();
    const data = response?.data?.data || [];
    return data.map(mapBackendToFrontend);
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw error;
  }
};

export const createSale = async (saleData) => {
  try {
    const backendData = mapFrontendToBackend(saleData);
    console.log('📤 Enviando al backend:', JSON.stringify(backendData, null, 2));
    const response = await api.post('/api/ventas', backendData);
    return mapBackendToFrontend(response.data?.data || response.data);
  } catch (error) {
    console.error("Error creating sale:", error);
    throw error;
  }
};

export const updateSaleStatus = async (id, status, reason = '', evidence = null, montoPagado = undefined, monto1 = undefined, monto2 = undefined) => {
  try {
    const response = await api.patch(`/api/ventas/${id}/estado`, { 
      nuevoEstado: status, 
      motivoRechazo: reason,
      comprobante2: evidence,
      montoPagado: montoPagado,
      monto1,
      monto2
    });
    return mapBackendToFrontend(response.data?.data || response.data);
  } catch (error) {
    console.error("Error updating sale status:", error);
    throw error;
  }
};

export const informarPagoParcial = async (id, montoRecibido, evidence = null) => {
    try {
      const response = await api.patch(`/api/ventas/${id}/estado`, { 
        nuevoEstado: 'Pago Incompleto', 
        montoPagado: montoRecibido,
        comprobante2: evidence
      });
      return mapBackendToFrontend(response.data?.data || response.data);
    } catch (error) {
      console.error("Error informing partial payment:", error);
      throw error;
    }
};

export const getStatuses = async () => {
  try {
    const response = await adminApi.getEstados();
    return response.data?.data || response.data || []; // Array of strings or objects [{ Nombre: 'Pendiente' }]
  } catch (error) {
    console.error("Error fetching statuses:", error);
    throw error;
  }
};

export const getPaymentMethods = async () => {
  try {
    const response = await adminApi.getMetodosPago();
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    throw error;
  }
};

export const getSizes = async () => {
  try {
    const response = await adminApi.getTallas();
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching sizes:", error);
    throw error;
  }
};

export const getCustomers = async () => {
  try {
    const response = await api.get('/api/clientes');
    const data = response.data?.data || response.data || [];
    
    // Mapear para que el selector siempre tenga id, nombre, dirección, documento y correo
    return data.map(c => ({
      id: c.id || c.IdCliente,
      nombre: c.nombreCompleto || c.NombreCompleto || c.nombre || c.Nombre || 'Sin nombre',
      direccion: c.direccion || c.Direccion || '',
      num_documento: c.numeroDocumento || c.NumeroDocumento || 'N/A',
      correo: c.email || c.Email || 'S/C'
    }));
  } catch (error) {
    console.error("Error fetching customers for sales:", error);
    return [];
  }
};
