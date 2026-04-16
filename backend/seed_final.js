
import { sequelize } from './src/config/db.js';
import { Talla } from './src/models/index.js';

async function seed() {
  try {
    await sequelize.authenticate();
    // 1. Asegurar que IdProducto sea nulo en la BD si el modelo lo permite
    await sequelize.query('ALTER TABLE "Tallas" ALTER COLUMN "IdProducto" DROP NOT NULL').catch(e => console.log('Notice: Could not drop NOT NULL or it was already nullable'));
    
    const sizes = ['7', '7 1/4', '7 1/8', 'AJUSTABLE'];
    for (const s of sizes) {
      await Talla.findOrCreate({
        where: { nombre: s.toUpperCase() },
        defaults: { isActive: true, idProducto: null }
      });
      console.log(`📏 Talla "${s}" preparada`);
    }
    console.log('✅ Tallas seed completado');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error seeding tallas:', e);
    process.exit(1);
  }
}
seed();
