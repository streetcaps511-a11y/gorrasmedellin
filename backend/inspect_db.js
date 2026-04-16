
import { Producto, Talla } from './src/models/index.js';
import { sequelize } from './src/config/db.js';

async function inspect() {
  try {
    await sequelize.authenticate();
    const productos = await Producto.findAll();
    const allTallasInProducts = new Set();
    productos.forEach(p => {
      if (p.tallasStock && Array.isArray(p.tallasStock)) {
        p.tallasStock.forEach(ts => {
           if (ts.talla) allTallasInProducts.add(ts.talla);
        });
      }
    });

    const tallasTable = await Talla.findAll();
    
    console.log('Tallas in Tallas table:', tallasTable.map(t => t.nombre));
    console.log('Unique Tallas used in products (tallasStock):', Array.from(allTallasInProducts));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

inspect();
