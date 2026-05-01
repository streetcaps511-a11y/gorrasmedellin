
import { sequelize } from '../src/config/db.js';

async function fixDatabase() {
    try {
        console.log('🚀 Iniciando reparación de base de datos...');
        
        // 1. Asegurar columna DeletedAt en Productos
        await sequelize.query('ALTER TABLE "Productos" ADD COLUMN IF NOT EXISTS "DeletedAt" TIMESTAMP WITH TIME ZONE');
        console.log('✅ Columna DeletedAt en Productos verificada.');

        // 2. Asegurar columnas en Ventas
        await sequelize.query('ALTER TABLE "Ventas" ALTER COLUMN "IdCliente" DROP NOT NULL');
        await sequelize.query('ALTER TABLE "Ventas" ADD COLUMN IF NOT EXISTS "ClienteNombreHistorico" VARCHAR(255)');
        console.log('✅ Columnas de Ventas verificadas.');

        // 3. Asegurar columnas en DetalleVentas
        await sequelize.query('ALTER TABLE "DetalleVentas" ADD COLUMN IF NOT EXISTS "NombreProducto" VARCHAR(255)');
        console.log('✅ Columnas de DetalleVentas verificadas.');

        // 4. Asegurar columnas en Compras
        await sequelize.query('ALTER TABLE "Compras" ALTER COLUMN "IdProveedor" DROP NOT NULL');
        await sequelize.query('ALTER TABLE "Compras" ADD COLUMN IF NOT EXISTS "ProveedorNombreHistorico" VARCHAR(255)');
        console.log('✅ Columnas de Compras verificadas.');

        console.log('🎉 Reparación completada exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error reparando base de datos:', error.message);
        process.exit(1);
    }
}

fixDatabase();
