// test_auth.js
// Script para validar que el login y el nuevo secreto funcionan correctamente
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:3000/api';

async function testAuth() {
  console.log('--- Probando Autenticación de la API ---');
  
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Falta SEED_ADMIN_EMAIL o SEED_ADMIN_PASSWORD en el archivo .env');
    return;
  }

  console.log(`🔑 Intentando login como: ${email}`);

  try {
    // 1. LOGIN
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: email, clave: password })
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      console.error('❌ Login fallido:', loginData.message);
      return;
    }

    const token = loginData.data?.accessToken || loginData.data?.token || loginData.token;
    
    if (!token) {
      console.error('❌ Login exitoso pero no se encontró el token en la respuesta:', loginData);
      return;
    }
    
    console.log('✅ Login exitoso!');
    console.log(`🎫 Nuevo Token (comienza por): ${token.substring(0, 30)}...`);

    // 2. PROBAR RUTAS PROTEGIDAS
    console.log('\n--- Probando GET /api/productos con el nuevo token ---');
    
    const productsResponse = await fetch(`${API_URL}/productos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const productsData = await productsResponse.json();

    if (productsResponse.ok) {
      console.log('✅ Acceso concedido a /api/productos!');
      console.log(`📦 Se encontraron ${productsData.data?.length || 0} productos.`);
    } else {
      console.error('❌ Error al acceder a productos:', productsData.message);
    }

    // 3. PROBAR OTRA RUTA
    console.log('\n--- Probando GET /api/categorias ---');
    const catResponse = await fetch(`${API_URL}/categorias`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const catData = await catResponse.json();
    
    if (catResponse.ok) {
      console.log('✅ Acceso concedido a /api/categorias!');
    } else {
      console.error('❌ Error al acceder a categorías:', catData.message);
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('💡 Asegúrate de que el servidor (node server.js) esté corriendo en el puerto 3000');
  }
}

testAuth();
