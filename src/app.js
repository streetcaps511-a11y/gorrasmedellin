import './models/index.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';

// Importar rutas
import productosRoutes from './routes/productos.routes.js';
import proveedoresRoutes from './routes/proveedores.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import comprasRoutes from './routes/compras.routes.js';
import detalleComprasRoutes from './routes/detalleCompras.routes.js';
import devolucionesRoutes from './routes/devoluciones.routes.js';
import clientesRoutes from './routes/clientes.routes.js';
import ventasRoutes from './routes/ventas.routes.js';
import detalleVentasRoutes from './routes/detalleVentas.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import permisosRoutes from './routes/permisos.routes.js';
import detallePermisosRoutes from './routes/detallePermisos.routes.js';
import estadoRoutes from './routes/estado.routes.js';
import tallasRoutes from './routes/tallas.routes.js';
import imagenesRoutes from './routes/imagenes.routes.js';
import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import coloresRoutes from './routes/colores.routes.js';

// Middlewares
import { notFound, errorHandler } from './middlewares/error.middleware.js';

const app = express();

<<<<<<< HEAD
=======
// Trust Render Proxy
app.set('trust proxy', true);

>>>>>>> bb0a2ea29ef31bb2002d5c6db9d452633f6775c5
// Middlewares globales
app.use(cors());
app.use(morgan('dev', {
  // 🤐 No loguear 401 en el login para mantener terminal limpia
  skip: (req, res) => res.statusCode === 401 && req.originalUrl.includes('/login')
}));
app.use(compression());

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// 📁 Servir archivos estáticos (para las fotos de comprobantes)
app.use('/uploads', express.static('public/uploads'));

// ============================================
// RUTAS DE LA API
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/detallecompras', detalleComprasRoutes);
app.use('/api/devoluciones', devolucionesRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/detalleventas', detalleVentasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/permisos', permisosRoutes);
app.use('/api/detallepermisos', detallePermisosRoutes);
app.use('/api/estados', estadoRoutes);
app.use('/api/tallas', tallasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/imagenes', imagenesRoutes);
app.use('/api/colores', coloresRoutes);

// ============================================
<<<<<<< HEAD
// PÁGINA PRINCIPAL - EN COLUMNA SIN SLASH
=======
// PÁGINA PRINCIPAL - STREETCAPS (SIN SCROLL)
>>>>>>> bb0a2ea29ef31bb2002d5c6db9d452633f6775c5
// ============================================
app.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  const modulos = [
<<<<<<< HEAD
    'dashboard',
    'auth',
    'productos',
    'categorias',
    'proveedores',
    'compras',
    'detallecompras',
    'devoluciones',
    'clientes',
    'ventas',
    'detalleventas',
    'usuarios',
    'roles',
    'permisos',
    'detallepermisos',
    'estados',
    'tallas',
    'imagenes',
    'pedidos',
    'colores',
    'health'
=======
    'dashboard', 'auth', 'productos', 'categorias',
    'proveedores', 'compras', 'detallecompras', 'devoluciones',
    'clientes', 'ventas', 'detalleventas', 'usuarios',
    'roles', 'permisos', 'detallepermisos', 'estados',
    'tallas', 'imagenes', 'pedidos', 'colores', 'health'
>>>>>>> bb0a2ea29ef31bb2002d5c6db9d452633f6775c5
  ];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
<<<<<<< HEAD
      <style>
        body { 
          margin: 20px; 
          font-family: Arial;
        }
        a { 
          color: blue; 
          text-decoration: underline;
          display: block;
          margin-bottom: 8px;
        }
      </style>
    </head>
    <body>
      ${modulos.map(m => `<a href="${baseUrl}/api/${m}" target="_blank">${m}</a>`).join('')}
=======
      <title>StreetCaps API</title>
      <style>
        body { 
          margin: 0; 
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #ffffff;
        }
        h1 { font-size: 2rem; color: #111; margin-bottom: 30px; font-weight: 800; letter-spacing: -1px; }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          max-width: 900px;
          width: 100%;
        }
        a { 
          color: #3b82f6; 
          text-decoration: none; 
          padding: 12px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 1rem;
          transition: all 0.2s;
          display: block;
        }
        a:hover { background: #f9fafb; color: #1d4ed8; }
      </style>
    </head>
    <body>
      <h1>StreetCaps</h1>
      <div class="grid">
        ${modulos.map(m => `<a href="${baseUrl}/api/${m}" target="_blank">${m}</a>`).join('')}
      </div>
>>>>>>> bb0a2ea29ef31bb2002d5c6db9d452633f6775c5
    </body>
    </html>
  `;

  res.send(html);
});

// Ruta de salud
<<<<<<< HEAD
app.get('/health', (req, res) => {
=======
app.get('/api/health', (req, res) => {
>>>>>>> bb0a2ea29ef31bb2002d5c6db9d452633f6775c5
  res.status(200).json({ 
    status: 'OK', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Middleware de errores
app.use(notFound);
app.use(errorHandler);

export default app;