import { sequelize } from './src/config/db.js';

async function listTables() {
  try {
    const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('--- TABLES IN DATABASE ---');
    results.forEach(r => console.log(r.table_name));
    
    const [cols] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Devoluciones'");
    console.log('\n--- COLUMNS IN Devoluciones ---');
    cols.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listTables();
