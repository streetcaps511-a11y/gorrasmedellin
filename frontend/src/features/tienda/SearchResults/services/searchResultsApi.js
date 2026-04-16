import api from "../../../shared/services/api";

/**
 * Fetch all public products for search
 */
export const getProductosPublicos = async () => {
  try {
    const response = await api.get('/api/productos');
    if (response.data.status === 'success' && response.data.data.products) {
      return response.data.data.products.map(p => ({
        id: p.id_producto,
        nombre: p.nombre,
        categoria: p.categoria_nombre,
        precio: p.precio_normal,
        precioOferta: p.precio_descuento,
        hasDiscount: p.has_discount || false,
        oferta: p.is_oferta || false,
        descripcion: p.descripcion || "",
        tallas: p.tallas || [],
        colores: p.colores || ["Negro"],
        imagenes: p.imagenes || [],
        isFeatured: p.is_featured || false,
        isActive: p.is_active !== undefined ? p.is_active : true,
        stock: p.stock,
        tallasStock: p.tallasStock || []
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching products for search:", error);
    return [];
  }
};
