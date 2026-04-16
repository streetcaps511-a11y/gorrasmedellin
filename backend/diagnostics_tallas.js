import { sequelize } from './src/config/db.js';
import Talla from './src/models/tallas.model.js';
import { Op } from 'sequelize';

async function testTalla() {
  try {
    await sequelize.authenticate();
    console.log('DB CONNECTION OK');
    
    console.log('ATTEMPTING findAndCountAll with:');
    console.log(' - order: [["nombre", "ASC"]]');
    
    const { count, rows } = await Talla.findAndCountAll({
      limit: 20,
      offset: 0,
      order: [['nombre', 'ASC']]
    });
    
    console.log('SUCCESS! Count:', count);
    console.log('First row:', rows[0]?.toJSON());
    
  } catch (e) {
    console.error('FAILED WITH ERROR:', e.message);
    if (e.original) console.error('SQL ERROR:', e.original.sql);
  } finally {
    await sequelize.close();
  }
}

testTalla();
