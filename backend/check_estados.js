import { sequelize } from './src/config/db.js';

async function check() {
  try {
    const [results] = await sequelize.query('SELECT * FROM "Estado"');
    console.log('--- ESTADOS DATA ---');
    console.log(JSON.stringify(results, null, 2));
    console.log('--------------------');
    process.exit(0);
  } catch (error) {
    console.error('Error fetching estados:', error);
    process.exit(1);
  }
}

check();
