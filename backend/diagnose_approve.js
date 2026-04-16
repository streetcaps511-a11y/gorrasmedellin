import { Producto, Estado } from './src/models/index.js';

async function check() {
  try {
    const prod = await Producto.findByPk(22);
    console.log('Product 22:', prod ? prod.nombre || prod.Nombre : 'NOT FOUND');
    
    const estados = await Estado.findAll();
    console.log('--- ALL ESTADOS ---');
    console.log(JSON.stringify(estados, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

check();
