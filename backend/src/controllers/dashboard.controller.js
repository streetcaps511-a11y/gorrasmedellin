/* === CONTROLADOR DE BACKEND === 
   Recibe las solicitudes (Requests) desde las Rutas, procesa las variables enviadas por el cliente, 
   ejecuta las consultas a la base de datos protegiendo contra inyección SQL, 
   y devuelve las respuestas en formato JSON. */

// controllers/dashboard.controller.js
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';

// ✅ TODAS LAS IMPORTACIONES CORREGIDAS - usando .model.js
import Categoria from '../models/categorias.model.js';
import Producto from '../models/productos.model.js';
import Proveedor from '../models/proveedores.model.js';
import Compra from '../models/compras.model.js';
import Cliente from '../models/clientes.model.js';
import Venta from '../models/ventas.model.js';
import Devolucion from '../models/devoluciones.model.js';
import Usuario from '../models/usuarios.model.js';
import Talla from '../models/tallas.model.js';
import Estado from '../models/estado.model.js';
import DetalleVenta from '../models/detalleVentas.model.js';

const dashboardController = {
    /**
     * Dashboard básico para todos los usuarios autenticados
     * @route GET /api/dashboard
     */
    getDashboardBasico: async (req, res) => {
        try {
            const usuario = req.usuario;
            
            let data = {
                usuario: {
                    nombre: usuario.nombre,
                    tipo: usuario.tipo,
                    rol: usuario.rol
                }
            };

            // No se puede asociar cliente por falta de IdUsuario en la BD
            
            res.json({
                success: true,
                data
            });
        } catch (error) {
            console.error('❌ Error en getDashboardBasico:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Información del perfil del usuario
     * @route GET /api/dashboard/perfil
     */
    getPerfilInfo: async (req, res) => {
        try {
            const usuario = req.usuario;
            
            let perfil = {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                tipo: usuario.tipo,
                rol: usuario.rol
            };

            // Los datos de cliente no están vinculados por IdUsuario
            
            res.json({
                success: true,
                data: perfil
            });
        } catch (error) {
            console.error('❌ Error en getPerfilInfo:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Dashboard específico para clientes
     * @route GET /api/dashboard/cliente
     */
    getDashboardCliente: async (req, res) => {
        try {
            const cliente = await Cliente.findOne({
                where: { IdUsuario: req.usuario.id }
            });

            if (!cliente) {
                return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
            }

            const compras = await Venta.findAll({
                where: { IdCliente: cliente.IdCliente },
                order: [['Fecha', 'DESC']],
                limit: 10
            });

            const totalCompras = await Venta.sum('Total', {
                where: { IdCliente: cliente.IdCliente }
            }) || 0;

            res.json({
                success: true,
                data: {
                    cliente: {
                        nombre: cliente.Nombre,
                        documento: cliente.formatearDocumento()
                    },
                    estadisticas: {
                        totalCompras,
                        cantidadCompras: compras.length
                    },
                    ultimasCompras: compras
                }
            });
        } catch (error) {
            console.error('❌ Error en getDashboardCliente:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener compras del cliente actual
     * @route GET /api/dashboard/cliente/compras
     */
    getMisCompras: async (req, res) => {
        try {
            const cliente = await Cliente.findOne({
                where: { IdUsuario: req.usuario.id }
            });

            if (!cliente) {
                return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
            }

            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { count, rows } = await Venta.findAndCountAll({
                where: { IdCliente: cliente.IdCliente },
                // Estado ahora es string directo en IdEstado
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['Fecha', 'DESC']]
            });

            res.json({
                success: true,
                data: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            console.error('❌ Error en getMisCompras:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener facturas del cliente actual
     * @route GET /api/dashboard/cliente/facturas
     */
    getMisFacturas: async (req, res) => {
        try {
            const cliente = await Cliente.findOne({
                where: { IdUsuario: req.usuario.id }
            });

            if (!cliente) {
                return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
            }

            const facturas = await Venta.findAll({
                where: { 
                    IdCliente: cliente.IdCliente,
                    IdEstado: 'Completada'
                },
                include: [{ model: DetalleVenta, as: 'Detalles' }],
                order: [['Fecha', 'DESC']],
                limit: 20
            });

            res.json({
                success: true,
                data: facturas
            });
        } catch (error) {
            console.error('❌ Error en getMisFacturas:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener estadísticas completas para el dashboard (admin/empleados)
     * @route GET /api/dashboard/estadisticas
     */
    getDashboardStats: async (req, res) => {
        try {
            // 📦 CONTEO DE REGISTROS (safe - simple counts)
            const totalCategorias = await Categoria.count();
            const totalProductos = await Producto.count();
            const totalProveedores = await Proveedor.count();
            const totalCompras = await Compra.count();
            const totalClientes = await Cliente.count();
            const totalVentas = await Venta.count();
            const totalDevoluciones = await Devolucion.count();
            const totalUsuarios = await Usuario.count();

            // 🆕 ÚLTIMOS PRODUCTOS REGISTRADOS
            const ultimosProductosReg = await Producto.findAll({
                limit: 5,
                order: [['createdAt', 'DESC']]
            });

            // 🆕 ÚLTIMOS PROVEEDORES REGISTRADOS
            const ultimosProveedoresReg = await Proveedor.findAll({
                limit: 5,
                order: [['createdAt', 'DESC']]
            });

            // 💰 TOTALES DE VENTAS Y COMPRAS
            const ventasHoy = await Venta.sum('total', {
                where: {
                    fecha: {
                        [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
                    },
                    idEstado: 'Completada'
                }
            }) || 0;

            const ventasMes = await Venta.sum('total', {
                where: {
                    fecha: {
                        [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    },
                    idEstado: 'Completada'
                }
            }) || 0;

            const comprasMes = await Compra.sum('total', {
                where: {
                    fecha: {
                        [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            }) || 0;

            // 📉 STOCK BAJO (productos con stock menor a 10)
            let productosStockBajo = [];
            try {
                productosStockBajo = await Producto.findAll({
                    where: { stock: { [Op.lt]: 10 } },
                    limit: 5
                });
            } catch (e) {
                console.warn('⚠️ Error obteniendo stock bajo:', e.message);
            }

            // 📈 ÚLTIMAS VENTAS
            let ultimasVentas = [];
            try {
                ultimasVentas = await Venta.findAll({
                    limit: 5,
                    order: [['fecha', 'DESC']],
                    include: [
                        { model: Cliente, as: 'clienteData', attributes: ['nombreCompleto'] }
                    ]
                });
            } catch (e) {
                console.warn('⚠️ Error obteniendo últimas ventas:', e.message);
            }

            // 📊 VENTAS POR MES (últimos 36 meses - SOLO COMPLETADAS)
            let ventasPorMes = [];
            try {
                ventasPorMes = await Venta.findAll({
                    attributes: [
                        [sequelize.fn('to_char', sequelize.col('Fecha'), 'YYYY-MM'), 'mes'],
                        [sequelize.fn('COUNT', sequelize.col('IdVenta')), 'cantidad'],
                        [sequelize.literal('SUM(COALESCE("Total", 0))::numeric'), 'total']
                    ],
                    where: {
                        fecha: {
                            [Op.gte]: new Date(new Date().setFullYear(new Date().getFullYear() - 3))
                        },
                        idEstado: { [Op.iLike]: 'Completada' } // 🛡️ Solo lo que ya se cobró
                    },
                    group: [sequelize.literal("to_char(\"Fecha\", 'YYYY-MM')")],
                    order: [[sequelize.literal("to_char(\"Fecha\", 'YYYY-MM')"), 'ASC']]
                });
            } catch (e) {
                console.warn('⚠️ Error obteniendo ventas por mes:', e.message);
            }

            // 📊 COMPRAS POR MES (últimos 36 meses)
            let comprasPorMes = [];
            try {
                comprasPorMes = await Compra.findAll({
                    attributes: [
                        [sequelize.fn('to_char', sequelize.col('Fecha'), 'YYYY-MM'), 'mes'],
                        [sequelize.fn('COUNT', sequelize.col('IdCompra')), 'cantidad'],
                        [sequelize.literal('SUM(COALESCE("Total", 0))::numeric'), 'total']
                    ],
                    where: {
                        fecha: {
                            [Op.gte]: new Date(new Date().setFullYear(new Date().getFullYear() - 3))
                        }
                    },
                    group: [sequelize.literal("to_char(\"Fecha\", 'YYYY-MM')")],
                    order: [[sequelize.literal("to_char(\"Fecha\", 'YYYY-MM')"), 'ASC']]
                });
            } catch (e) {
                console.warn('⚠️ Error obteniendo compras por mes:', e.message);
            }

            // 🏆 PRODUCTOS MÁS VENDIDOS (SOLO EN VENTAS COMPLETADAS)
            let topProductos = [];
            try {
                topProductos = await DetalleVenta.findAll({
                    attributes: [
                        'idProducto',
                        [sequelize.fn('SUM', sequelize.col('DetalleVenta.Cantidad')), 'total_vendido'],
                        [sequelize.fn('SUM', sequelize.col('DetalleVenta.Subtotal')), 'total_ingresos']
                    ],
                    include: [
                        {
                            model: Producto,
                            as: 'producto',
                            attributes: ['nombre']
                        },
                        {
                            model: Venta,
                            as: 'venta',
                            attributes: [],
                            where: { idEstado: { [Op.iLike]: 'Completada' } } // 🛡️ Solo ventas reales
                        }
                    ],
                    group: ['idProducto', 'producto.IdProducto', 'producto.Nombre'],
                    order: [[sequelize.literal('total_vendido'), 'DESC']],
                    limit: 5
                });
            } catch (e) {
                console.warn('⚠️ Error obteniendo top productos:', e.message);
            }

            // 👑 CLIENTES RECURRENTES (BASADO EN VENTAS COMPLETADAS)
            let topClientes = [];
            try {
                topClientes = await Venta.findAll({
                    attributes: [
                        'idCliente',
                        [sequelize.fn('COUNT', sequelize.col('IdVenta')), 'total_compras'],
                        [sequelize.fn('SUM', sequelize.col('Total')), 'total_gastado']
                    ],
                    where: { idEstado: { [Op.iLike]: 'Completada' } }, // 🛡️ Solo lo que ya pagaron
                    include: [{
                        model: Cliente,
                        as: 'clienteData',
                        attributes: ['nombreCompleto', 'email']
                    }],
                    group: [
                        'Venta.IdCliente', 
                        'clienteData.IdCliente', 
                        'clienteData.Nombre',
                        'clienteData.Email'
                    ],
                    order: [[sequelize.literal('total_gastado'), 'DESC']],
                    limit: 5
                });
            } catch (e) {
                console.warn('⚠️ Error obteniendo top clientes:', e.message);
            }

            // 📊 ESTADO DE CAJA
            const caja = {
                ventasHoy,
                ventasMes,
                comprasMes,
                balanceMes: ventasMes - comprasMes
            };

            res.json({
                success: true,
                data: {
                    conteos: {
                        categorias: totalCategorias,
                        productos: totalProductos,
                        proveedores: totalProveedores,
                        compras: totalCompras,
                        clientes: totalClientes,
                        ventas: totalVentas,
                        devoluciones: totalDevoluciones,
                        usuarios: totalUsuarios
                    },
                    caja,
                    stockBajo: productosStockBajo.map(p => ({
                        IdProducto: p.id,
                        Nombre: p.nombre,
                        Stock: p.stock
                    })),
                    ultimasVentas: ultimasVentas.map(v => ({
                        IdVenta: v.id,
                        Cliente: v.clienteData?.nombreCompleto,
                        Total: parseFloat(v.total || 0),
                        Fecha: v.fecha,
                        Estado: v.idEstado
                    })),
                    ventasPorMes: ventasPorMes.map(v => ({
                        mes: v.dataValues.mes,
                        cantidad: parseInt(v.dataValues.cantidad),
                        total: parseFloat(v.dataValues.total || 0)
                    })),
                    comprasPorMes: comprasPorMes.map(v => ({
                        mes: v.dataValues.mes,
                        cantidad: parseInt(v.dataValues.cantidad),
                        total: parseFloat(v.dataValues.total || 0)
                    })),
                    topProductos: topProductos.map(p => ({
                        nombre: p.producto?.nombre || 'Producto desconocido',
                        imagen: p.producto?.imagenes?.[0] || null,
                        cantidad: parseInt(p.dataValues.total_vendido || 0),
                        total: parseFloat(p.dataValues.total_ingresos || 0) // Para que coincida con p.total en el Front
                    })),
                    topClientes: topClientes.map(c => ({
                        nombre: c.clienteData?.nombreCompleto || 'Cliente desconocido',
                        correo: c.clienteData?.email,
                        cantidad: parseInt(c.dataValues.total_compras || 0),
                        total: parseFloat(c.dataValues.total_gastado || 0) // Para que coincida con c.total en el Front
                    })),
                    ultimosProductos: ultimosProductosReg.map(p => ({
                        id: p.id,
                        nombre: p.nombre,
                        fecha: p.createdAt
                    })),
                    ultimosProveedores: ultimosProveedoresReg.map(p => ({
                        id: p.id,
                        nombre: p.companyName || p.contactName,
                        fecha: p.createdAt
                    }))
                }
            });

        } catch (error) {
            console.error('❌ Error en dashboard stats:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener resumen rápido (cards superiores)
     * @route GET /api/dashboard/resumen
     */
    getResumen: async (req, res) => {
        try {
            const hoy = new Date().setHours(0, 0, 0, 0);
            const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

            // Ventas del día
            const ventasHoy = await Venta.count({
                where: {
                    Fecha: { [Op.gte]: hoy },
                    IdEstado: 'Completada'
                }
            });

            const totalVentasHoy = await Venta.sum('Total', {
                where: {
                    Fecha: { [Op.gte]: hoy },
                    IdEstado: 'Completada'
                }
            }) || 0;

            // Ventas del mes
            const totalVentasMes = await Venta.sum('Total', {
                where: {
                    Fecha: { [Op.gte]: inicioMes },
                    IdEstado: 'Completada'
                }
            }) || 0;

            // Productos con stock bajo
            const productosBajoStock = await Producto.count({
                where: { Stock: { [Op.lt]: 10 } }
            });

            // Clientes nuevos hoy
            const clientesHoy = await Cliente.count({
                where: {
                    createdAt: { [Op.gte]: hoy }
                }
            });

            res.json({
                success: true,
                data: {
                    ventasHoy: {
                        cantidad: ventasHoy,
                        total: totalVentasHoy,
                        totalFormateado: new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP'
                        }).format(totalVentasHoy)
                    },
                    ventasMes: {
                        total: totalVentasMes,
                        totalFormateado: new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP'
                        }).format(totalVentasMes)
                    },
                    productosBajoStock,
                    clientesNuevosHoy: clientesHoy
                }
            });

        } catch (error) {
            console.error('❌ Error en resumen:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener gráficos para el dashboard
     * @route GET /api/dashboard/graficos
     */
    getGraficos: async (req, res) => {
        try {
            const { periodo = 'mes' } = req.query;

            let fechaInicio;
            const ahora = new Date();

            if (periodo === 'semana') {
                fechaInicio = new Date(ahora.setDate(ahora.getDate() - 7));
            } else if (periodo === 'mes') {
                fechaInicio = new Date(ahora.setMonth(ahora.getMonth() - 1));
            } else if (periodo === 'año') {
                fechaInicio = new Date(ahora.setFullYear(ahora.getFullYear() - 1));
            }

            // Ventas por día
            const ventasPorDia = await Venta.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('Fecha')), 'dia'],
                    [sequelize.fn('COUNT', sequelize.col('IdVenta')), 'cantidad'],
                    [sequelize.fn('SUM', sequelize.col('Total')), 'total']
                ],
                where: {
                    Fecha: { [Op.gte]: fechaInicio },
                    IdEstado: 'Completada'
                },
                group: [sequelize.fn('DATE', sequelize.col('Fecha'))],
                order: [[sequelize.literal('dia'), 'ASC']]
            });

            // Productos por categoría
            const productosPorCategoria = await Producto.findAll({
                attributes: [
                    'IdCategoria',
                    [sequelize.fn('COUNT', sequelize.col('IdProducto')), 'cantidad']
                ],
                include: [{
                    model: Categoria,
                    as: 'categoriaData',
                    attributes: ['Nombre']
                }],
                group: ['IdCategoria', 'categoriaData.IdCategoria', 'categoriaData.Nombre']
            });

            res.json({
                success: true,
                data: {
                    ventasPorDia: ventasPorDia.map(v => ({
                        dia: v.dataValues.dia,
                        cantidad: parseInt(v.dataValues.cantidad),
                        total: v.dataValues.total
                    })),
                    productosPorCategoria: productosPorCategoria.map(p => ({
                        categoria: p.categoriaData?.Nombre,
                        cantidad: parseInt(p.dataValues.cantidad)
                    }))
                }
            });

        } catch (error) {
            console.error('❌ Error en gráficos:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener gráfico de ventas
     * @route GET /api/dashboard/graficos/ventas
     */
    getGraficoVentas: async (req, res) => {
        try {
            const ventasPorDia = await Venta.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('Fecha')), 'dia'],
                    [sequelize.fn('SUM', sequelize.col('Total')), 'total']
                ],
                where: {
                    Fecha: {
                        [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30))
                    },
                    IdEstado: 'Completada'
                },
                group: [sequelize.fn('DATE', sequelize.col('Fecha'))],
                order: [[sequelize.literal('dia'), 'ASC']]
            });

            res.json({
                success: true,
                data: ventasPorDia.map(v => ({
                    fecha: v.dataValues.dia,
                    total: v.dataValues.total
                }))
            });
        } catch (error) {
            console.error('❌ Error en getGraficoVentas:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener gráfico de productos más vendidos
     * @route GET /api/dashboard/graficos/productos
     */
    getGraficoProductos: async (req, res) => {
        try {
            const topProductos = await DetalleVenta.findAll({
                attributes: [
                    'IdProducto',
                    [sequelize.fn('SUM', sequelize.col('Cantidad')), 'total']
                ],
                include: [{
                    model: Producto,
                    as: 'producto',
                    attributes: ['Nombre']
                }],
                group: ['IdProducto', 'producto.IdProducto', 'producto.Nombre'],
                order: [[sequelize.literal('total'), 'DESC']],
                limit: 10
            });

            res.json({
                success: true,
                data: topProductos.map(p => ({
                    producto: p.producto?.Nombre,
                total: parseInt(p.dataValues.total)
                }))
            });
        } catch (error) {
            console.error('❌ Error en getGraficoProductos:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener reporte de ventas diarias
     * @route GET /api/dashboard/reportes/ventas-diarias
     */
    getVentasDiarias: async (req, res) => {
        try {
            const { fecha } = req.query;
            const fechaConsulta = fecha ? new Date(fecha) : new Date();
            fechaConsulta.setHours(0, 0, 0, 0);
            const fechaFin = new Date(fechaConsulta);
            fechaFin.setHours(23, 59, 59, 999);

            const ventas = await Venta.findAll({
                where: {
                    Fecha: {
                        [Op.between]: [fechaConsulta, fechaFin]
                    },
                    IdEstado: 'Completada'
                },
                include: [
                    { model: Cliente, as: 'clienteData', attributes: ['nombreCompleto'] },
                    { model: DetalleVenta, as: 'Detalles' }
                ]
            });

            const total = ventas.reduce((sum, v) => sum + v.Total, 0);
            const cantidad = ventas.length;

            res.json({
                success: true,
                data: {
                    fecha: fechaConsulta.toISOString().split('T')[0],
                    cantidad,
                    total,
                    ventas
                }
            });
        } catch (error) {
            console.error('❌ Error en getVentasDiarias:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener productos más vendidos
     * @route GET /api/dashboard/reportes/productos-mas-vendidos
     */
    getProductosMasVendidos: async (req, res) => {
        try {
            const { limite = 10 } = req.query;

            const productos = await DetalleVenta.findAll({
                attributes: [
                    'IdProducto',
                    [sequelize.fn('SUM', sequelize.col('Cantidad')), 'totalVendido'],
                    [sequelize.fn('SUM', sequelize.col('Subtotal')), 'totalIngresos']
                ],
                include: [{
                    model: Producto,
                    as: 'producto',
                    attributes: ['Nombre', 'PrecioVenta', 'url']
                }],
                group: ['IdProducto', 'producto.IdProducto', 'producto.Nombre', 'producto.PrecioVenta', 'producto.url'],
                order: [[sequelize.literal('totalVendido'), 'DESC']],
                limit: parseInt(limite)
            });

            res.json({
                success: true,
                data: productos.map(p => ({
                    producto: p.producto?.Nombre,
                    imagen: p.producto?.url,
                    precio: p.producto?.PrecioVenta,
                    totalVendido: parseInt(p.dataValues.totalVendido),
                    totalIngresos: p.dataValues.totalIngresos
                }))
            });
        } catch (error) {
            console.error('❌ Error en getProductosMasVendidos:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener clientes frecuentes
     * @route GET /api/dashboard/reportes/clientes-frecuentes
     */
    getClientesFrecuentes: async (req, res) => {
        try {
            const { limite = 10 } = req.query;

            const clientes = await Venta.findAll({
                attributes: [
                    'IdCliente',
                    [sequelize.fn('COUNT', sequelize.col('IdVenta')), 'totalCompras'],
                    [sequelize.fn('SUM', sequelize.col('Total')), 'totalGastado']
                ],
                where: { IdEstado: 'Completada' },
                include: [{
                    model: Cliente,
                    as: 'clienteData',
                    attributes: ['nombreCompleto', 'email', 'telefono']
                }],
                group: ['IdCliente', 'clienteData.IdCliente', 'clienteData.nombreCompleto', 'clienteData.email', 'clienteData.telefono'],
                order: [[sequelize.literal('totalCompras'), 'DESC']],
                limit: parseInt(limite)
            });

            res.json({
                success: true,
                data: clientes.map(c => ({
                    nombre: c.clienteData?.nombreCompleto,
                    correo: c.clienteData?.email,
                    telefono: c.clienteData?.telefono,
                    totalCompras: parseInt(c.dataValues.totalCompras),
                    totalGastado: c.dataValues.totalGastado
                }))
            });
        } catch (error) {
            console.error('❌ Error en getClientesFrecuentes:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener reporte de rentabilidad
     * @route GET /api/dashboard/reportes/rentabilidad
     */
    getRentabilidad: async (req, res) => {
        try {
            const { periodo = 'mes' } = req.query;

            let fechaInicio;
            const ahora = new Date();

            if (periodo === 'semana') {
                fechaInicio = new Date(ahora.setDate(ahora.getDate() - 7));
            } else if (periodo === 'mes') {
                fechaInicio = new Date(ahora.setMonth(ahora.getMonth() - 1));
            } else if (periodo === 'año') {
                fechaInicio = new Date(ahora.setFullYear(ahora.getFullYear() - 1));
            }

            const totalVentas = await Venta.sum('Total', {
                where: {
                    Fecha: { [Op.gte]: fechaInicio },
                    IdEstado: 'Completada'
                }
            }) || 0;

            const totalCompras = await Compra.sum('Total', {
                where: {
                    Fecha: { [Op.gte]: fechaInicio }
                }
            }) || 0;

            const totalDevoluciones = await Devolucion.sum('MontoReembolsado', {
                where: {
                    Fecha: { [Op.gte]: fechaInicio },
                    Estado: 'aprobada'
                }
            }) || 0;

            const utilidad = totalVentas - totalCompras - totalDevoluciones;
            const margen = totalVentas > 0 ? (utilidad / totalVentas) * 100 : 0;

            res.json({
                success: true,
                data: {
                    periodo,
                    totalVentas,
                    totalCompras,
                    totalDevoluciones,
                    utilidad,
                    margen: margen.toFixed(2)
                }
            });
        } catch (error) {
            console.error('❌ Error en getRentabilidad:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener KPI de ventas hoy
     * @route GET /api/dashboard/kpi/ventas-hoy
     */
    getVentasHoy: async (req, res) => {
        try {
            const hoy = new Date().setHours(0, 0, 0, 0);
            
            const cantidad = await Venta.count({
                where: {
                    Fecha: { [Op.gte]: hoy },
                    IdEstado: 'Completada'
                }
            });

            const total = await Venta.sum('Total', {
                where: {
                    Fecha: { [Op.gte]: hoy },
                    IdEstado: 'Completada'
                }
            }) || 0;

            res.json({
                success: true,
                data: {
                    cantidad,
                    total,
                    totalFormateado: new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP'
                    }).format(total)
                }
            });
        } catch (error) {
            console.error('❌ Error en getVentasHoy:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener productos con bajo stock
     * @route GET /api/dashboard/kpi/productos-bajo-stock
     */
    getProductosBajoStock: async (req, res) => {
        try {
            const { umbral = 10 } = req.query;

            const productos = await Producto.findAll({
                where: { Stock: { [Op.lt]: umbral } },
                order: [['Stock', 'ASC']],
                limit: 20
            });

            const cantidad = productos.length;

            res.json({
                success: true,
                data: {
                    cantidad,
                    productos: productos.map(p => ({
                        id: p.IdProducto,
                        nombre: p.Nombre,
                        stock: p.Stock
                    }))
                }
            });
        } catch (error) {
            console.error('❌ Error en getProductosBajoStock:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * Obtener alertas del sistema
     * @route GET /api/dashboard/kpi/alertas
     */
    getAlertas: async (req, res) => {
        try {
            const stockBajo = await Producto.count({
                where: { Stock: { [Op.lt]: 10 } }
            });

            const devolucionesPendientes = await Devolucion.count({
                where: { Estado: 'pendiente' }
            });

            const ventasPendientes = await Venta.count({
                where: { IdEstado: 'Pendiente' }
            });

            res.json({
                success: true,
                data: {
                    alertas: [
                        {
                            tipo: 'stock',
                            mensaje: `${stockBajo} productos con stock bajo`,
                            nivel: stockBajo > 0 ? 'advertencia' : 'ok',
                            cantidad: stockBajo
                        },
                        {
                            tipo: 'devoluciones',
                            mensaje: `${devolucionesPendientes} devoluciones pendientes`,
                            nivel: devolucionesPendientes > 0 ? 'info' : 'ok',
                            cantidad: devolucionesPendientes
                        },
                        {
                            tipo: 'ventas',
                            mensaje: `${ventasPendientes} ventas pendientes`,
                            nivel: ventasPendientes > 0 ? 'info' : 'ok',
                            cantidad: ventasPendientes
                        }
                    ]
                }
            });
        } catch (error) {
            console.error('❌ Error en getAlertas:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default dashboardController;