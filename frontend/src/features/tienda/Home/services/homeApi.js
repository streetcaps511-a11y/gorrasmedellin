/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

import api from "../../../shared/services/api";

/**
 * Obtiene los productos para la página de inicio (con filtros de destacados, oferta, etc. si fuera necesario).
 */
export const getHomeProducts = () => api.get("/api/productos", { params: { todos: true } });
