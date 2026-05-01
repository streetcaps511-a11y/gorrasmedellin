
import { sequelize, Venta, Cliente, Compra, Producto, Usuario } from '../src/models/index.js';
import { connectDB } from '../src/config/db.js';

const check = async () => {
  try {
    await connectDB();
    const ventasCount = await Venta.count();
    const clientesCount = await Cliente.count();
    const comprasCount = await Compra.count();
    const productosCount = await Producto.count();
    
    console.log('--- DATABASE STATS ---');
    console.log('Ventas:', ventasCount);
    console.log('Clientes:', clientesCount);
    console.log('Compras:', comprasCount);
    console.log('Productos:', productosCount);
    
    if (ventasCount > 0) {
      const lastVenta = await Venta.findOne({ order: [['id', 'DESC']] });
      console.log('Last Venta:', JSON.stringify(lastVenta, null, 2));
    }

    const allUsers = await Usuario.findAll({ include: ['rolData'] });
    console.log('--- ALL USERS ---');
    allUsers.forEach(u => {
      console.log(`- ${u.id}: ${u.email} (Rol: ${u.rolData?.nombre}, IDRol: ${u.idRol})`);
    });
    
    const totalSum = await Venta.sum('total');
    console.log('--- SUM TEST ---');
    console.log('Total Sum (Venta.sum("total")):', totalSum);
    
    const safeSumNoDefault = async (model, col, where) => { 
        try { 
            const result = await model.sum(col, { where }) || 0; 
            return Number(result);
        } catch (e) { 
            console.error(`Error sumando ${col}:`, e);
            return 0; 
        } 
    };
    
    const totalSafeNoDefault = await safeSumNoDefault(Venta, 'total');
    console.log('Total Safe (No Default):', totalSafeNoDefault);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

check();
