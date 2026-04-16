import { Permiso } from './src/models/index.js';

async function check() {
  try {
    const p = await Permiso.findAll();
    console.log(JSON.stringify(p, null, 2));
  } catch (e) {
    console.error(e);
  }
}
check();
