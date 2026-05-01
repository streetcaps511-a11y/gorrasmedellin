import Venta from '../src/models/ventas.model.js';

async function checkDates() {
    try {
        const sales = await Venta.findAll({
            limit: 20
        });
        console.log(JSON.stringify(sales, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

checkDates();
