
import { Talla, Estado } from './src/models/index.js';
import { sequelize } from './src/config/db.js';

async function seed() {
  try {
    const tallas = ['7', '7 1/4', '7 1/8', 'AJUSTABLE'];
    const estados = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'ACTIVO', 'INACTIVO'];

    for (const t of tallas) {
      try {
        await Talla.findOrCreate({ where: { nombre: t.toUpperCase() }, defaults: { isActive: true } });
        console.log(`📏 Talla "${t}" OK`);
      } catch (e) {
        console.log(`⚠️ Talla "${t}" error: ${e.message}`);
      }
    }

    for (const s of estados) {
      try {
        await Estado.findOrCreate({ where: { nombre: s.toUpperCase() }, defaults: { isActive: true } });
        console.log(`📑 Estado "${s}" OK`);
      } catch (e) {
        console.log(`⚠️ Estado "${s}" error: ${e.message}`);
      }
    }

    console.log('✅ SEED COMPLETADO');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
seed();
