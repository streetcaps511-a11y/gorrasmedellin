import { sequelize } from './src/config/db.js';
import Producto from './src/models/productos.model.js';
import Venta from './src/models/ventas.model.js';
// Buscaremos el modelo de estados (puede llamarse Estado o Estados)
import fs from 'fs';

async function checkDB() {
  try {
    const [rows, metadata] = await sequelize.query("SELECT * FROM \"Estado\" OR \"Estados\" OR \"Estadoventa\"");
    // Como no sabemos el nombre exacto de la tabla de estados, probaremos una consulta genérica a las tablas
    const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('--- TABLAS DISPONIBLES ---');
    console.table(tables);

    const tableEstado = tables.find(t => t.table_name.toLowerCase().includes('estado'))?.table_name;
    if (tableEstado) {
      const [resEstado] = await sequelize.query(`SELECT * FROM "${tableEstado}"`);
      console.log(`--- CONTENIDO DE ${tableEstado} ---`);
      console.table(resEstado);
    }

    const [venta] = await sequelize.query("SELECT \"IdVenta\", \"IdEstado\", \"Total\" FROM \"Ventas\" WHERE \"IdVenta\" = 43");
    console.log('\n--- VENTA #43 (Directamente SQL) ---');
    console.table(venta);

  } catch (err) {
    console.error('Error durante diagnóstico:', err.message);
  } finally {
    process.exit();
  }
}

checkDB();
