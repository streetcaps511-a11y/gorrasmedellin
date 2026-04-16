import api from "../../../shared/services/api";

/**
 * Obtiene los productos para la página de inicio (con filtros de destacados, oferta, etc. si fuera necesario).
 */
export const getHomeProducts = () => api.get("/api/productos", { params: { todos: true } });
