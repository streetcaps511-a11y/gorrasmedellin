// backend/fix_devoluciones.js
import { Devolucion } from './src/models/index.js';

async function fix() {
  console.log('--- Iniciando corrección de estados en Devoluciones ---');
  try {
    const [updatedCount] = await Devolucion.update(
      { isActive: false },
      { 
        where: { 
          idEstado: ['Rechazada', 'Completada'],
          isActive: true 
        } 
      }
    );
    console.log(`✅ Se actualizaron ${updatedCount} registros que estaban inconsistentes.`);
  } catch (error) {
    console.error('❌ Error al fijar estados:', error);
  } finally {
    process.exit();
  }
}

fix();
