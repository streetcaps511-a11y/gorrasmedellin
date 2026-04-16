import 'dotenv/config';
import { Compra, DetalleCompra, Producto, Proveedor, sequelize } from './src/models/index.js';

async function test() {
  const transaction = await sequelize.transaction();
  try {
    const idProveedor = 1; // Assuming supplier 1 exists
    const productos = [
      {
        nombre: 'Gorra Test',
        talla: '',
        cantidad: 10,
        precioCompra: 100,
        precioVenta: 150,
        precioMayorista6: 130,
        precioMayorista80: 120
      }
    ];
    const metodoPago = 'Efectivo';
    const fecha = new Date();

    let totalCompra = 0;
    const detalles = [];

    for (const item of productos) {
        let producto = null;
        producto = await Producto.create({
            nombre: item.nombre,
            precioCompra: item.precioCompra || 0,
            precioVenta: item.precioVenta || 0,
            precioMayorista6: item.precioMayorista6 || 0,
            precioMayorista80: item.precioMayorista80 || 0,
            stock: parseInt(item.cantidad),
            tallasStock: [{ talla: item.talla, cantidad: parseInt(item.cantidad) }],
            idCategoria: 1, // hardcode for test
            categoria: 'Test',
            estado: true,
            enInventario: true,
            colores: ['Surtido'],
            imagenes: []
        }, { transaction });
        
        item.idProducto = producto.id;
        detalles.push({ ...item, subtotal: 1000 });
    }

    const nueva = await Compra.create({
        idProveedor,
        fecha: fecha || new Date(),
        total: totalCompra,
        estado: 'Completada',
        metodoPago: metodoPago || 'Efectivo',
        isActive: true
    }, { transaction });

    for (const d of detalles) {
        await DetalleCompra.create({ 
            idCompra: nueva.id, 
            nombreProducto: d.nombre,
            ...d 
        }, { transaction });
    }

    await transaction.commit();
    console.log("Exitoso");
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("ERROR CAPTURADO:");
    console.error(error.message);
    if (error.errors) console.error(error.errors.map(e => e.message));
  } finally {
    await sequelize.close();
  }
}

test();
