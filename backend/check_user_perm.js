
import { sequelize } from './src/config/db.js';
import Usuario from './src/models/usuarios.model.js';
import Rol from './src/models/roles.model.js';
import Permiso from './src/models/permisos.model.js';
import DetallePermiso from './src/models/detallePermisos.model.js';

async function checkUser() {
  try {
    const email = 'lhucho1111@gmail.com';
    const usuario = await Usuario.findOne({
      where: { email },
      include: [{ model: Rol, as: 'rolData' }]
    });

    if (!usuario) {
      console.log(`Usuario ${email} no encontrado.`);
      return;
    }

    console.log('--- USUARIO ---');
    console.log('ID:', usuario.id);
    console.log('Nombre:', usuario.nombre);
    console.log('Email:', usuario.email);
    console.log('Estado:', usuario.estado);
    console.log('ID Rol:', usuario.idRol);
    
    if (usuario.rolData) {
      console.log('--- ROL ---');
      console.log('Nombre Rol:', usuario.rolData.nombre);
      console.log('Permisos (JSON):', usuario.rolData.permisos);
      
      const detalles = await DetallePermiso.findAll({
        where: { idRol: usuario.idRol }
      });
      console.log('--- PERMISOS RELACIONALES ---');
      detalles.forEach(d => console.log('- ', d.idPermiso));
    } else {
      console.log('El usuario NO tiene un rol asociado.');
    }

    // List all roles
    const roles = await Rol.findAll();
    console.log('--- TODOS LOS ROLES ---');
    roles.forEach(r => console.log(`- ID: ${r.id}, Nombre: ${r.nombre}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkUser();
