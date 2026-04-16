
import { sequelize, Permiso, Role, DetallePermiso, Usuario } from './src/models/index.js';

async function verifyPermissions() {
  try {
    const email = 'lhucho1111@gmail.com';
    const user = await Usuario.findOne({
        where: { email },
        include: [{association: 'rolData'}]
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log(`User: ${user.email}, Rol: ${user.rolData?.nombre}, ID Rol: ${user.idRol}`);

    const [perms] = await sequelize.query('SELECT * FROM "Permisos" LIMIT 10');
    console.log('Permisos Sample:', perms.map(p => p.IdPermiso));

    const [detalles] = await sequelize.query(`SELECT * FROM "DetallePermisos" WHERE "IdRol" = ${user.idRol}`);
    console.log('User DetallePermisos:', detalles.map(d => d.IdPermiso));

  } catch (err) {
    console.log(err);
  } finally {
    await sequelize.close();
  }
}

verifyPermissions();
