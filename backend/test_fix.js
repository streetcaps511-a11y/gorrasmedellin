import { Devolucion, Producto, Estado, sequelize } from './src/models/index.js';
import { Op } from 'sequelize';

async function testUpdate() {
  const ID_DEV = 25;
  const t = await sequelize.transaction();
  try {
    console.log('--- DIAGNOSTIC TEST FOR DEV 25 ---');
    const dev = await Devolucion.findByPk(ID_DEV);
    if (!dev) {
        console.log('❌ DEV NOT FOUND');
        process.exit(1);
    }
    
    console.log('Dev data:', JSON.stringify(dev, null, 2));
    
    const targetStatusName = 'Completada';
    const matchEstado = await Estado.findOne({ 
        where: { nombre: { [Op.iLike]: targetStatusName } },
        transaction: t
    });
    
    if (!matchEstado) {
        console.log('❌ STATUS "Completada" NOT FOUND');
    } else {
        console.log('✅ Found Status:', matchEstado.nombre, 'ID:', matchEstado.id);
    }
    
    const newStatusId = matchEstado ? matchEstado.id : dev.idEstado;
    
    // Test stock adjustment
    if (dev.idProducto) {
        const prod = await Producto.findByPk(dev.idProducto);
        if (!prod) {
            console.log('❌ PRODUCT NOT FOUND:', dev.idProducto);
        } else {
            console.log('✅ Found Product:', prod.nombre, 'Current Stock:', prod.stock);
            // Attempt a dry-run increment
            await Producto.increment('stock', { by: 0, where: { id: prod.id }, transaction: t });
            console.log('✅ Dry-run increment succeeded');
        }
    }
    
    const updateData = {
        idEstado: newStatusId,
        observacion: 'Test Diagnostic'
    };
    
    await dev.update(updateData, { transaction: t });
    console.log('✅ Update succeeded within transaction');
    
    await t.commit();
    console.log('✅ Transaction committed');
    process.exit(0);
  } catch (error) {
    await t.rollback();
    console.error('❌ FATAL ERROR DURING TEST:', error);
    if (error.parent) console.error('Parent error:', error.parent);
    process.exit(1);
  }
}

testUpdate();
