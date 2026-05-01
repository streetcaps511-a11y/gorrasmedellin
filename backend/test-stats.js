import { sequelize } from './src/config/db.js';
import ventasController from './src/controllers/ventas.controller.js';

async function testFrontendLogic() {
  try {
    await sequelize.authenticate();
    const req = { query: { page: 1, limit: 1, search: '' } };
    let jsonResponse;
    const res = {
        status: function() { return this; },
        json: function(data) { jsonResponse = data; }
    };
    await ventasController.getAllVentas(req, res);

    const rawData = jsonResponse.data || [];
    if (rawData.length > 0) {
      const v = rawData[0];
      console.log('Raw item 0:', v);
      
      const fecha = (v.fecha || v.Fecha) ? new Date(v.fecha || v.Fecha).toLocaleDateString('es-CO') : '';
      const fechaOriginal = v.fecha || v.Fecha || v.createdAt;
      const total = parseFloat(v.total || v.Total || 0) || 0;
      
      console.log('Mapped =>', { fecha, fechaOriginal, total });
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testFrontendLogic();
