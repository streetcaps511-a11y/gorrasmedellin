import api from "../../../shared/services/api";

/**
 * Crea un nuevo pedido/compra en el sistema.
 * @param {Object} orderData - Datos del pedido (cliente, items, total, comprobante, etc.)
 * @returns {Promise} Resultado de la petición
 */
/**
 * Obtiene el perfil actual del cliente desde la base de datos
 */
export const getMiPerfil = () => {
  return api.get("/api/clientes/mi/perfil");
};

export const getProductoById = (id) => {
  return api.get(`/api/productos/${id}`);
};

export const createPedido = (orderData) => {
  // Si hay un archivo (comprobante), usamos FormData
  if (orderData.comprobante && orderData.comprobante instanceof File) {
    const formData = new FormData();
    Object.keys(orderData).forEach(key => {
      formData.append(key, orderData[key]);
    });
    return api.post("/api/pedidos", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  }
  
  return api.post("/api/pedidos", orderData);
};
