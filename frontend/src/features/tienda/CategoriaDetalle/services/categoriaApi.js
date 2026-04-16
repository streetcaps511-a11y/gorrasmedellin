import api from "../../../shared/services/api";

/**
 * Obtiene todas las categorías públicas.
 */
export const getCategorias = () => api.get("/api/categorias");

/**
 * Obtiene los productos filtrados por categoría.
 * @param {string} categoriaId - El ID o nombre de la categoría.
 */
export const getProductsByCategory = (categoriaId) => api.get(`/api/productos/categoria/${categoriaId}`);

/**
 * Obtiene todos los productos públicos (para filtrado manual si es necesario).
 */
export const getAllProducts = () => api.get("/api/productos", { params: { todos: true } });
