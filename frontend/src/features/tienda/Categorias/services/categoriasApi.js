import api from "../../../shared/services/api";

/**
 * Obtiene todas las categorías públicas de la API.
 */
export const getCategorias = () => api.get("/api/categorias");
