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

// Trust Render Proxy
app.set('trust proxy', true);

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
// PÁGINA PRINCIPAL - PREMIUM LANDING PAGE
// ============================================
app.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  const modulos = [
    { name: 'Dashboard', path: 'dashboard', icon: '📊' },
    { name: 'Autenticación', path: 'auth', icon: '🔐' },
    { name: 'Productos', path: 'productos', icon: '📦' },
    { name: 'Categorías', path: 'categorias', icon: '📁' },
    { name: 'Proveedores', path: 'proveedores', icon: '🤝' },
    { name: 'Compras', path: 'compras', icon: '🛒' },
    { name: 'Clientes', path: 'clientes', icon: '👥' },
    { name: 'Ventas', path: 'ventas', icon: '💰' },
    { name: 'Devoluciones', path: 'devoluciones', icon: '↩️' },
    { name: 'Usuarios', path: 'usuarios', icon: '👤' },
    { name: 'Roles', path: 'roles', icon: '🛡️' },
    { name: 'Permisos', path: 'permisos', icon: '🔑' },
    { name: 'Tallas', path: 'tallas', icon: '📏' },
    { name: 'Colores', path: 'colores', icon: '🎨' },
    { name: 'Health Check', path: 'health', icon: '🚀' }
  ];

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>StreetCaps API | Documentación</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
      <style>
        :root {
          --primary: #3b82f6;
          --bg: #0f172a;
          --card-bg: rgba(30, 41, 59, 0.7);
          --text: #f8fafc;
          --text-dim: #94a3b8;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          font-family: 'Outfit', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-image: 
            radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(147, 51, 234, 0.15) 0px, transparent 50%);
          padding: 4rem 1rem;
        }

        .container {
          max-width: 1000px;
          width: 100%;
        }

        header {
          text-align: center;
          margin-bottom: 4rem;
        }

        h1 {
          font-size: 3.5rem;
          font-weight: 800;
          letter-spacing: -0.05em;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, #60a5fa, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        p.subtitle {
          color: var(--text-dim);
          font-size: 1.2rem;
          font-weight: 300;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .card {
          background: var(--card-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1.5rem;
          padding: 1.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          color: inherit;
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
          background: rgba(30, 41, 59, 0.9);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
        }

        .icon {
          font-size: 1.8rem;
          background: rgba(255, 255, 255, 0.05);
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 1rem;
        }

        .card-content h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.2rem;
        }

        .card-content span {
          font-size: 0.85rem;
          color: var(--text-dim);
        }

        footer {
          margin-top: auto;
          padding-top: 4rem;
          color: var(--text-dim);
          font-size: 0.9rem;
          text-align: center;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
          padding: 0.2rem 0.8rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 1rem;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        @media (max-width: 640px) {
          h1 { font-size: 2.5rem; }
          .grid { grid-template-columns: 1fr; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <div class="badge">● Sistema Operativo</div>
          <h1>StreetCaps API</h1>
          <p class="subtitle">Infraestructura central de gestión y servicios móviles</p>
        </header>

        <div class="grid">
          ${modulos.map(m => `
            <a href="${baseUrl}/api/${m.path}" class="card" target="_blank">
              <div class="icon">${m.icon}</div>
              <div class="card-content">
                <h3>${m.name}</h3>
                <span>/api/${m.path}</span>
              </div>
            </a>
          `).join('')}
        </div>

        <footer>
          <p>&copy; ${new Date().getFullYear()} StreetCaps. Todos los derechos reservados.</p>
        </footer>
      </div>
    </body>
    </html>
  `;

  res.send(html);
});

// Ruta de salud
app.get('/health', (req, res) => {
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