import { sequelize } from './src/config/db.js';

async function probe() {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Devoluciones'
    `);
    console.log('--- COLUMNS IN DEVOLUCIONES ---');
    results.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));
    console.log('-------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Error probing DB:', error);
    process.exit(1);
  }
}

probe();
