import api from "../../../shared/services/api";

export const getProductos = (params = '') => api.get(`/api/productos${params}`);
