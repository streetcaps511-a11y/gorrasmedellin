import { sequelize } from './src/config/db.js';

async function migrate() {
  try {
    console.log('🚀 Iniciando migración de columna IdEstado...');

    // 1. Quitar la restricción de llave foránea (si existe)
    console.log('🔗 Eliminando restricciones de llave foránea...');
    await sequelize.query('ALTER TABLE "Ventas" DROP CONSTRAINT IF EXISTS "Ventas_IdEstado_fkey"');

    // 2. Cambiar el tipo de columna de INTEGER a VARCHAR
    // Usamos TYPE VARCHAR(50) USING "IdEstado"::text para convertir los números actuales a texto
    console.log('📝 Cambiando tipo de dato de INTEGER a VARCHAR...');
    await sequelize.query('ALTER TABLE "Ventas" ALTER COLUMN "IdEstado" TYPE VARCHAR(50) USING "IdEstado"::text');

    // 3. Reemplazar los números por palabras legibles
    console.log('🔄 Reemplazando IDs por nombres legibles...');
    await sequelize.query("UPDATE \"Ventas\" SET \"IdEstado\" = 'Completada' WHERE \"IdEstado\" = '1'");
    await sequelize.query("UPDATE \"Ventas\" SET \"IdEstado\" = 'Pendiente' WHERE \"IdEstado\" = '2'");
    await sequelize.query("UPDATE \"Ventas\" SET \"IdEstado\" = 'Rechazada' WHERE \"IdEstado\" = '3'");
    await sequelize.query("UPDATE \"Ventas\" SET \"IdEstado\" = 'Anulada' WHERE \"IdEstado\" = '4'");

    console.log('✅ MIGRACIÓN EXITOSA');
  } catch (err) {
    console.error('❌ ERROR DURANTE LA MIGRACIÓN:', err.message);
  } finally {
    process.exit();
  }
}

migrate();
