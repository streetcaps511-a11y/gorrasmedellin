import api from "../../../shared/services/api";

export const getProductos = () => api.get("/api/productos");
