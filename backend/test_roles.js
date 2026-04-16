import { Rol } from './src/models/index.js';

async function listRoles() {
  try {
    const roles = await Rol.findAll();
    console.log("Roles in DB:", roles.map(r => r.toJSON()));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listRoles();
