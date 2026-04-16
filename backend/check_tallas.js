
import { sequelize } from './src/config/db.js';

async function check() {
  try {
    const [res] = await sequelize.query("SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'Tallas'");
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
