// backend/debug_perms.js
import { Rol, Permiso } from './src/models/index.js';

async function debug() {
  try {
    const roles = await Rol.findAll();
    console.log("=== ROLES ===");
    roles.forEach(r => {
      console.log(`Role: ${r.nombre} (ID: ${r.id})`);
      console.log(`Permisos (JSON):`, r.permisos);
      console.log("---");
    });

    const perms = await Permiso.findAll();
    console.log("=== PERMISOS (Relational Table) ===");
    perms.forEach(p => {
      console.log(`Permission: ${p.id} (${p.nombre}) - Module: ${p.modulo}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

debug();
