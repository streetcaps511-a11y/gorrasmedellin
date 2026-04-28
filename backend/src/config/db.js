import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 🗄️ Inicialización de Sequelize para PostgreSQL (Aiven)
 */
export const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialectOptions: {
        ssl: process.env.DB_SSL === 'require' ? {
            require: true,
            rejectUnauthorized: false
        } : false,
        connectTimeout: 30000, // 30 segundos para conectar (Aiven puede ser lento)
        keepAlive: true
    },
    logging: false, // 🤐 Desactivado para mantener la terminal limpia
    pool: {
        max: 5,              // Aumentado a 5 para mejor concurrencia
        min: 1,              // Mantener 1 conexión caliente para respuesta rápida
        acquire: 30000,
        idle: 30000,         // 30 segundos de inactividad
        evict: 15000         // Revisar cada 15 segundos
    },
    retry: {
        max: 5,              // Más reintentos para soportar micro-cortes de red
        match: [
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/,
            /TimeoutError/
        ]
    }
});

/**
 * 🔌 Función para conectar a la base de datos con reintentos
 */
export const connectDB = async () => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 5000; // 5 segundos entre reintentos

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            await sequelize.authenticate();
            console.log('✅ PostgreSQL Conectado a Aiven Cloud DB');
            return; // Éxito, salir
        } catch (error) {
            console.error(`❌ Intento ${attempt}/${MAX_RETRIES} - Error conectando a la BD: ${error.message}`);

            if (attempt < MAX_RETRIES) {
                console.log(`⏳ Reintentando en ${RETRY_DELAY / 1000} segundos...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            } else {
                console.error('💀 No se pudo conectar a la base de datos después de varios intentos.');
                console.error('   Verifica que el servicio de Aiven esté activo en: https://console.aiven.io');
                process.exit(1);
            }
        }
    }
};

/**
 * 🔗 Definición de asociaciones (opcional, si no se usa src/models/index.js)
 */
export const defineAssociations = () => {
    const {
        Usuario, Rol, Cliente, Permiso, DetallePermiso,
        Categoria, Producto, Talla, Proveedor, Compra,
        DetalleCompra, Venta, DetalleVenta, Devolucion,
        Estado, Imagen
    } = sequelize.models;

    if (!Usuario || !Rol || !Producto || !Categoria) {
        console.warn('⚠️ Modelos core no registrados aún');
        return;
    }

    // 1. Usuarios y Roles
    Usuario.belongsTo(Rol, { foreignKey: 'IdRol', as: 'rolData', onDelete: 'SET NULL' });
    Rol.hasMany(Usuario, { foreignKey: 'IdRol', as: 'Usuarios' });
    Usuario.hasOne(Cliente, { foreignKey: 'IdUsuario', as: 'clienteData', onDelete: 'CASCADE' });
    Cliente.belongsTo(Usuario, { foreignKey: 'IdUsuario', as: 'usuarioData' });

    // 2. Roles y Permisos
    Rol.hasMany(DetallePermiso, { foreignKey: 'IdRol', as: 'DetallePermisos' });
    DetallePermiso.belongsTo(Rol, { foreignKey: 'IdRol', as: 'rolData' });
    DetallePermiso.belongsTo(Permiso, { foreignKey: 'IdPermiso', as: 'permisoData', onDelete: 'CASCADE' });
    Permiso.hasMany(DetallePermiso, { foreignKey: 'IdPermiso', as: 'DetallePermisos' });

    // 3. Productos y Categorías
    Producto.belongsTo(Categoria, { foreignKey: 'IdCategoria', as: 'categoriaData' });
    Categoria.hasMany(Producto, { foreignKey: 'IdCategoria', as: 'Productos' });

    // 4. Producto Variantes
    Producto.hasMany(Talla, { foreignKey: 'IdProducto', as: 'Tallas', onDelete: 'CASCADE' });
    Talla.belongsTo(Producto, { foreignKey: 'IdProducto', as: 'productoData' });
    Producto.hasMany(Imagen, { foreignKey: 'IdProducto', as: 'Imagenes', onDelete: 'CASCADE' });
    Imagen.belongsTo(Producto, { foreignKey: 'IdProducto', as: 'productoData' });

    // 5. Compras y Proveedores
    Compra.belongsTo(Proveedor, { foreignKey: 'IdProveedor', as: 'proveedorData' });
    Proveedor.hasMany(Compra, { foreignKey: 'IdProveedor', as: 'Compras' });
    Compra.hasMany(DetalleCompra, { foreignKey: 'IdCompra', as: 'Detalles', onDelete: 'CASCADE' });
    DetalleCompra.belongsTo(Compra, { foreignKey: 'IdCompra', as: 'compraData' });
    DetalleCompra.belongsTo(Producto, { foreignKey: 'IdProducto', as: 'productoData' });
    DetalleCompra.belongsTo(Talla, { foreignKey: 'IdTalla', as: 'tallaData' });

    // 6. Ventas y Clientes
    Venta.belongsTo(Cliente, { foreignKey: 'IdCliente', as: 'clienteData' });
    Cliente.hasMany(Venta, { foreignKey: 'IdCliente', as: 'Ventas' });
    // Venta ya no usa FK a Estado — IdEstado ahora es STRING
    // Venta.belongsTo(Estado, { foreignKey: 'IdEstado', as: 'estadoVenta' });
    // Estado.hasMany(Venta, { foreignKey: 'IdEstado', as: 'VentasConEstado' });
    Venta.hasMany(DetalleVenta, { foreignKey: 'IdVenta', as: 'Detalles', onDelete: 'CASCADE' });
    DetalleVenta.belongsTo(Venta, { foreignKey: 'IdVenta', as: 'ventaData' });
    DetalleVenta.belongsTo(Producto, { foreignKey: 'IdProducto', as: 'productoData' });
    DetalleVenta.belongsTo(Talla, { foreignKey: 'IdTalla', as: 'tallaData' });

    // 7. Devoluciones
    Devolucion.belongsTo(Producto, { foreignKey: 'idProducto', as: 'productoOriginal' });
    Devolucion.belongsTo(Estado, { foreignKey: 'idEstado', as: 'estadoDevolucion' });
    Devolucion.belongsTo(Venta, { foreignKey: 'idVenta', as: 'ventaOriginal' });
};