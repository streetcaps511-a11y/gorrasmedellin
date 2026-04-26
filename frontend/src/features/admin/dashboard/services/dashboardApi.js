/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

/**
 * Servicios del Dashboard del Admin
 * Conectados a la API a través de adminApi
 */

import { 
  getVentas, 
  getCompras, 
  getClientes,
  getDashboardStats 
} from '../../../shared/services/adminApi';

/**
 * Obtiene todas las ventas para el dashboard
 * @returns {Promise} Respuesta con listado de ventas
 */
export const fetchDashboardVentas = async () => {
  try {
    const response = await getVentas();
    const data = response?.data?.data || response?.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching ventas:', error);
    throw error;
  }
};

/**
 * Obtiene todas las compras para el dashboard
 * @returns {Promise} Respuesta con listado de compras
 */
export const fetchDashboardCompras = async () => {
  try {
    const response = await getCompras();
    const data = response?.data?.data || response?.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching compras:', error);
    throw error;
  }
};

/**
 * Obtiene todos los clientes para el dashboard
 * @returns {Promise} Respuesta con listado de clientes
 */
export const fetchDashboardClientes = async () => {
  try {
    const response = await getClientes();
    const data = response?.data?.data || response?.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching clientes:', error);
    throw error;
  }
};

/**
 * Obtiene las estadísticas resumidas para el dashboard
 * @returns {Promise} Objeto con estadísticas (top clientes, top productos, etc.)
 */
export const fetchDashboardStats = async () => {
  try {
    const response = await getDashboardStats();
    return response?.data?.data || response?.data || {};
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

/**
 * Obtiene todos los datos necesarios para el dashboard
 * Ventas, Compras y Clientes en paralelo
 * @returns {Promise} Objeto con ventas, compras y clientes
 */
export const fetchAllDashboardData = async () => {
  const result = {
    ventas: [],
    compras: [],
    clientes: [],
  };

  try {
    const [ventasRes, comprasRes, clientesRes] = await Promise.allSettled([
      getVentas(),
      getCompras(),
      getClientes(),
    ]);

    if (ventasRes.status === 'fulfilled') result.ventas = ventasRes.value?.data?.data || ventasRes.value?.data || [];
    if (comprasRes.status === 'fulfilled') result.compras = comprasRes.value?.data?.data || comprasRes.value?.data || [];
    if (clientesRes.status === 'fulfilled') result.clientes = clientesRes.value?.data?.data || clientesRes.value?.data || [];

    return result;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return result; // Devuelve arrays vacíos en lugar de lanzar error
  }
};

/**
 * Filtra ventas por rango de fechas
 * @param {Array} ventas - Listado de ventas
 * @param {string} startDate - Fecha inicio (DD/MM/YYYY)
 * @param {string} endDate - Fecha fin (DD/MM/YYYY)
 * @returns {Array} Ventas filtradas
 */
export const filterVentasByDateRange = (ventas = [], startDate, endDate) => {
  if (!startDate || !endDate) return ventas;

  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split("/");
    return new Date(year, month - 1, day).getTime();
  };

  const startTime = parseDate(startDate);
  const endTime = parseDate(endDate);

  return ventas.filter(v => {
    const vTime = parseDate(v.fecha)?.getTime?.();
    return vTime >= startTime && vTime <= endTime;
  });
};

/**
 * Filtra compras por rango de fechas
 * @param {Array} compras - Listado de compras
 * @param {string} startDate - Fecha inicio
 * @param {string} endDate - Fecha fin
 * @returns {Array} Compras filtradas
 */
export const filterComprasByDateRange = (compras = [], startDate, endDate) => {
  if (!startDate || !endDate) return compras;

  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split("/");
    return new Date(year, month - 1, day).getTime();
  };

  const startTime = parseDate(startDate);
  const endTime = parseDate(endDate);

  return compras.filter(c => {
    const cTime = parseDate(c.Fecha || c.fecha)?.getTime?.();
    return cTime >= startTime && cTime <= endTime;
  });
};

export default {
  fetchDashboardVentas,
  fetchDashboardCompras,
  fetchDashboardClientes,
  fetchDashboardStats,
  fetchAllDashboardData,
  filterVentasByDateRange,
  filterComprasByDateRange,
};
