import { sequelize } from './src/config/db.js';

async function fixTable() {
  try {
    console.log('Attempting to add column IdProductoCambio to Devoluciones table...');
    await sequelize.query('ALTER TABLE "Devoluciones" ADD COLUMN IF NOT EXISTS "IdProductoCambio" INTEGER;');
    console.log('Column added or already exists.');
    
    console.log('Attempting to add column IdEstado to Devoluciones table if missing...');
    await sequelize.query('ALTER TABLE "Devoluciones" ADD COLUMN IF NOT EXISTS "IdEstado" INTEGER DEFAULT 1;');
    
    console.log('Syncing models...');
    // This won't drop anything, just ensures Sequelize is happy
    await sequelize.authenticate();
    
    console.log('Database fix completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database:', error);
    process.exit(1);
  }
}

fixTable();
