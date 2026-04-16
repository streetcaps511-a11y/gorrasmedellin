// backend/revert_devoluciones.js
import { Devolucion } from './src/models/index.js';

async function revert() {
  console.log('--- Revirtiendo estados isActive a true ---');
  try {
    const [updatedCount] = await Devolucion.update(
      { isActive: true },
      { where: {} } // Todos a true
    );
    console.log(`✅ Se restauraron ${updatedCount} registros a isActive: true.`);
  } catch (error) {
    console.error('❌ Error al revertir estados:', error);
  } finally {
    process.exit();
  }
}

revert();
