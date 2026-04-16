
import { Rol } from './src/models/index.js';

async function renameAdminRole() {
  try {
    const [updatedCount] = await Rol.update(
      { nombre: 'Administrador' },
      { where: { id: 1 } }
    );
    
    if (updatedCount > 0) {
      console.log('✅ Rol ID 1 actualizado exitosamente a "Administrador"');
    } else {
      console.log('⚠️ No se encontró el rol con ID 1 o ya tenía ese nombre.');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error actualizando el rol:', error);
    process.exit(1);
  }
}

renameAdminRole();
