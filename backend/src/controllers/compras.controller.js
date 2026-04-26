/* === CONTROLADOR DE BACKEND === 
   Recibe las solicitudes (Requests) desde las Rutas, procesa las variables enviadas por el cliente, 
   ejecuta las consultas a la base de datos protegiendo contra inyección SQL, 
   y devuelve las respuestas en formato JSON. */

// controllers/compras.controller.js
import { Op } from 'sequelize';
import { 
    Compra, 
    DetalleCompra, 
    Proveedor, 
    Producto, 
    Categoria,
    sequelize 
} from '../models/index.js';

const compraController = {
    /**
     * Obtener estadísticas de compras
     */
    getEstadisticas: async (req, res) => {
        try {
            const total = await Compra.count();
            const totalGastado = await Compra.sum('total') || 0;
            const proveedores = await Proveedor.count();
            res.json({ success: true, data: { total, totalGastado, proveedores } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener todas las compras
     */
    getAllCompras: async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { count, rows } = await Compra.findAndCountAll({
                include: [
                    { model: Proveedor, as: 'proveedorData', attributes: ['id', 'companyName', 'documentNumber'] },
                    { model: DetalleCompra, as: 'detalles' }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [
                    ['id', 'DESC'],
                    [{ model: DetalleCompra, as: 'detalles' }, 'IdDetalle', 'DESC']
                ]
            });

            res.json({
                success: true,
                data: rows,
                pagination: {
                    totalItems: count,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Compras por Proveedor
     */
    getComprasByProveedor: async (req, res) => {
        try {
            const { proveedorId } = req.params;
            const data = await Compra.findAll({ 
                where: { idProveedor: proveedorId },
                include: [{ model: DetalleCompra, as: 'detalles' }],
                order: [
                    ['id', 'DESC'],
                    [{ model: DetalleCompra, as: 'detalles' }, 'IdDetalle', 'DESC']
                ]
            });
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener compra por ID
     */
    getCompraById: async (req, res) => {
        try {
            const { id } = req.params;
            const compra = await Compra.findByPk(id, {
                include: [
                    { model: Proveedor, as: 'proveedorData' },
                    { 
                        model: DetalleCompra, 
                        as: 'detalles',
                        include: [{ model: Producto, as: 'producto', paranoid: false }]
                    }
                ],
                order: [
                    [{ model: DetalleCompra, as: 'detalles' }, 'id', 'DESC']
                ]
            });
            if (!compra) return res.status(404).json({ success: false, message: 'Compra no encontrada' });
            res.json({ success: true, data: compra });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Generar Reporte (Mock)
     */
    generarReporte: async (req, res) => {
        res.json({ success: true, message: 'Reporte generado' });
    },

    /**
     * Crear nueva compra (AUMENTA stock)
     */
    createCompra: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { idProveedor, productos, metodoPago, fecha, estado } = req.body;
            if (!idProveedor || !productos) throw new Error('Datos incompletos');

            let totalCompra = 0;
            const detalles = [];

            for (const item of productos) {
                const subtotal = item.cantidad * item.precioCompra;
                totalCompra += subtotal;

                // 1. Buscar producto por id o por nombre
                let producto = null;
                if (item.idProducto) {
                    producto = await Producto.findByPk(item.idProducto);
                } else if (item.nombre) {
                    // Usar iLike para que sea case insensitive
                    producto = await Producto.findOne({ where: { nombre: { [Op.iLike]: item.nombre } } });
                }

                if (estado === 'Completada') {
                    if (producto) {
                        // Aumentar stock del producto existente
                        const stock = [...(producto.tallasStock || [])];
                        const idx = stock.findIndex(s => s.talla === item.talla);
                        if (idx !== -1) stock[idx].cantidad += parseInt(item.cantidad);
                        else stock.push({ talla: item.talla, cantidad: parseInt(item.cantidad) });
                        
                        const totalStock = stock.reduce((sum, t) => sum + (t.cantidad || 0), 0);

                        await producto.update({ 
                            tallasStock: stock,
                            stock: totalStock,
                            precioCompra: item.precioCompra || producto.precioCompra,
                            precioVenta: item.precioVenta || producto.precioVenta,
                            precioMayorista6: item.precioMayorista6 || producto.precioMayorista6,
                            precioMayorista80: item.precioMayorista80 || producto.precioMayorista80,
                            isActive: false
                        }, { transaction });
                        
                        item.idProducto = producto.id;
                    } else {
                        // Crear producto nuevo en el módulo de productos
                        const catDefault = await Categoria.findOne({ order: [['id', 'ASC']] });
                        const idCat = catDefault ? catDefault.id : 1;
                        const nombreCat = catDefault ? catDefault.nombre : 'General';

                        producto = await Producto.create({
                            nombre: item.nombre,
                            precioCompra: item.precioCompra || 0,
                            precioVenta: item.precioVenta || 0,
                            precioMayorista6: item.precioMayorista6 || 0,
                            precioMayorista80: item.precioMayorista80 || 0,
                            stock: parseInt(item.cantidad),
                            tallasStock: [{ talla: item.talla, cantidad: parseInt(item.cantidad) }],
                            idCategoria: idCat,
                            categoria: nombreCat,
                            isActive: false,
                            enInventario: true,
                            colores: [],
                            imagenes: []
                        }, { transaction });
                        
                        item.idProducto = producto.id;
                    }
                }
                
                detalles.push({ 
                    ...item, 
                    idProducto: (item.id !== undefined && item.id !== '' && item.id !== null) ? parseInt(item.id, 10) : null,
                    subtotal 
                });
            }

            const nueva = await Compra.create({
                idProveedor,
                fecha: fecha || new Date(),
                total: totalCompra,
                estado: estado || 'Pendiente',
                metodoPago: metodoPago || 'Efectivo',
                isActive: true
            }, { transaction });

            for (const d of detalles) {
                await DetalleCompra.create({ 
                    idCompra: nueva.id, 
                    idProducto: d.idProducto || null,
                    nombreProducto: d.nombre,
                    talla: d.talla,
                    cantidad: d.cantidad,
                    precioCompra: d.precioCompra,
                    precioVenta: d.precioVenta,
                    precioMayorista6: d.precioMayorista6 || 0,
                    precioMayorista80: d.precioMayorista80 || 0,
                    subtotal: d.subtotal
                }, { transaction });
            }

            await transaction.commit();
            res.status(201).json({ success: true, data: nueva });
        } catch (error) {
            await transaction.rollback();
            console.error('ERROR EN CREATE COMPRA:', error);
            const detailedError = error.errors ? error.errors.map(e => e.message).join(', ') : error.message;
            res.status(400).json({ success: false, message: detailedError, stack: error.stack });
        }
    },

    /**
     * Anular compra (REVIERTE stock)
     */
    anularCompra: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const compra = await Compra.findByPk(id, { include: ['detalles'] });
            if (!compra || compra.estado === 'Anulada') throw new Error('Inválido');

            for (const d of compra.detalles) {
                if (!d.idProducto) continue;
                const p = await Producto.findByPk(d.idProducto);
                if (p) {
                    const stock = [...(p.tallasStock || [])];
                    const idx = stock.findIndex(s => s.talla === d.talla);
                    if (idx !== -1) {
                        stock[idx].cantidad = Math.max(0, stock[idx].cantidad - d.cantidad);
                        const totalStock = stock.reduce((sum, t) => sum + (t.cantidad || 0), 0);
                        await p.update({ tallasStock: stock, stock: totalStock }, { transaction });
                    }
                }
            }

            await compra.update({ estado: 'Anulada' }, { transaction });
            await transaction.commit();
            res.json({ success: true, message: 'Anulada' });
        } catch (error) {
            await transaction.rollback();
            res.status(400).json({ success: false, message: error.message });
        }
    },

    /**
     * Actualizar estado de compra
     */
    updateStatus: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { estado } = req.body;
            
            const compra = await Compra.findByPk(id, {
                include: [{ model: DetalleCompra, as: 'detalles' }]
            });
            if (!compra) {
                await transaction.rollback();
                return res.status(404).json({ success: false, message: 'Compra no encontrada' });
            }

            // Si pasa a completada y antes no lo estaba, procesar productos
            if (estado === 'Completada' && compra.estado !== 'Completada') {
                for (const item of compra.detalles) {
                    let producto = null;
                    if (item.idProducto && !isNaN(item.idProducto)) {
                        producto = await Producto.findByPk(item.idProducto);
                    } else if (item.nombreProducto) {
                        producto = await Producto.findOne({ where: { nombre: { [Op.iLike]: item.nombreProducto } } });
                    }

                    if (producto) {
                        const stock = [...(producto.tallasStock || [])];
                        const idx = stock.findIndex(s => s.talla === item.talla);
                        if (idx !== -1) stock[idx].cantidad += parseInt(item.cantidad);
                        else stock.push({ talla: item.talla, cantidad: parseInt(item.cantidad) });
                        
                        const totalStock = stock.reduce((sum, t) => sum + (t.cantidad || 0), 0);

                        await producto.update({ 
                            tallasStock: stock,
                            stock: totalStock,
                            precioCompra: item.precioCompra || producto.precioCompra,
                            precioVenta: item.precioVenta || producto.precioVenta,
                            precioMayorista6: item.precioMayorista6 || producto.precioMayorista6,
                            precioMayorista80: item.precioMayorista80 || producto.precioMayorista80,
                            isActive: false // Los productos llegan inactivos
                        }, { transaction });
                    } else {
                        const catDefault = await Categoria.findOne({ order: [['id', 'ASC']] });
                        const idCat = catDefault ? catDefault.id : 1;
                        const nombreCat = catDefault ? catDefault.nombre : 'General';

                        const nuevoProd = await Producto.create({
                            nombre: item.nombreProducto,
                            precioCompra: item.precioCompra || 0,
                            precioVenta: item.precioVenta || 0,
                            precioMayorista6: item.precioMayorista6 || 0,
                            precioMayorista80: item.precioMayorista80 || 0,
                            stock: parseInt(item.cantidad),
                            tallasStock: [{ talla: item.talla, cantidad: parseInt(item.cantidad) }],
                            idCategoria: idCat,
                            categoria: nombreCat,
                            isActive: false,
                            enInventario: true,
                            colores: [],
                            imagenes: []
                        }, { transaction });

                        // Actualizar idProducto en el detalle
                        await item.update({ idProducto: nuevoProd.id }, { transaction });
                    }
                }
            }
            
            await compra.update({ estado }, { transaction });
            await transaction.commit();
            res.json({ success: true, data: compra });
        } catch (error) {
            await transaction.rollback();
            res.status(400).json({ success: false, message: error.message });
        }
    }
};

export default compraController;