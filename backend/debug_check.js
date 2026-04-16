import { sequelize } from './src/config/db.js';
import Usuario from './src/models/usuarios.model.js';
import Rol from './src/models/roles.model.js';

async function check() {
  try {
    await sequelize.authenticate();
    console.log('CONNECTED TO DB');
    
    // List roles
    const roles = await Rol.findAll();
    console.log('ROLES IN DB:', roles.map(r => `"${r.nombre}" (ID: ${r.id}, Active: ${r.isActive})`));
    
    const user = await Usuario.findOne({ 
      where: { email: 'duvann1991@gmail.com' },
      include: [{ model: Rol, as: 'rolData' }]
    });
    
    if (user) {
      console.log('USER FOUND:', user.email);
      console.log('IS ACTIVE:', user.estaActivo());
      console.log('ROLE PK IN USER:', user.idRol);
      if (user.rolData) {
        console.log('USER ROLE NAME:', `"${user.rolData.nombre}"`);
      } else {
        console.log('USER ROLE NOT FOUND IN ASSOCIATION');
      }
    } else {
      console.log('USER NOT FOUND');
    }
  } catch (e) {
    console.error('ERROR:', e.message);
    if (e.original) console.error('ORIGINAL:', e.original.message);
  } finally {
    await sequelize.close();
  }
}

check();
