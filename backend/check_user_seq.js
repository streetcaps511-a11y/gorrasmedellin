import { Usuario, Cliente, Rol, Proveedor } from './src/models/index.js';
import { connectDB, sequelize } from './src/config/db.js';
import fs from 'fs';

async function check() {
  let output = '';
  try {
    await connectDB();
    
    output += '--- BUSCANDO USUARIO cardonauribecristian20@gmail.com ---\n';
    const user = await Usuario.findOne({ 
        where: { email: 'cardonauribecristian20@gmail.com' },
        include: [{ model: Cliente, as: 'clienteData' }]
    });
    
    if (user) {
        output += JSON.stringify(user.toJSON(), null, 2) + '\n';
    } else {
        output += '⚠️ Usuario no encontrado.\n';
    }

    output += '\n--- ROLES EN EL SISTEMA ---\n';
    const roles = await Rol.findAll();
    output += JSON.stringify(roles.map(r => r.toJSON()), null, 2) + '\n';

    output += '\n--- PROVEEDORES EN EL SISTEMA ---\n';
    const provs = await Proveedor.findAll();
    output += JSON.stringify(provs.map(p => p.toJSON()), null, 2) + '\n';

  } catch (err) {
    output += 'ERROR: ' + err.message + '\n';
  } finally {
    fs.writeFileSync('db_check_result.txt', output);
    await sequelize.close();
    process.exit(0);
  }
}

check();
