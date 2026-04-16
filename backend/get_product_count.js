import { Producto } from './src/models/index.js';
import { sequelize } from './src/config/db.js';

async function countProducts() {
    try {
        const count = await Producto.count();
        console.log(`TOTAL_PRODUCTS_COUNT: ${count}`);
        process.exit(0);
    } catch (error) {
        console.error('Error counting products:', error);
        process.exit(1);
    }
}

countProducts();
