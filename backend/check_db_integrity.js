import { sequelize } from './src/models/index.js';

async function checkVenta() {
  try {
    const [res] = await sequelize.query('SELECT * FROM "Ventas" WHERE "IdVenta" = 44');
    console.log('Venta 44:', res.length > 0 ? 'EXISTS' : 'NOT FOUND');
    
    const [res3] = await sequelize.query('SELECT * FROM "Estado"');
    console.log('--- ESTADOS TABLE ---');
    console.log(JSON.stringify(res3, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkVenta();
