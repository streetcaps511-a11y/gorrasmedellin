import { sequelize } from './src/models/index.js';

async function verifyStates() {
  try {
    const [rows] = await sequelize.query('SELECT "IdEstado", "Nombre" FROM "Estado" ORDER BY "IdEstado"');
    console.log('--- ESTADOS EN DB ---');
    console.log(JSON.stringify(rows, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyStates();
