import { useState, useEffect } from 'react';
import { 
  fetchDashboardVentas, 
  fetchDashboardCompras, 
  fetchDashboardClientes, 
  fetchDashboardStats 
} from '../services/dashboardApi';
import { NitroCache } from '../../../shared/utils/NitroCache';

// 2 minutos de TTL para el dashboard
const DASHBOARD_TTL = 2 * 60 * 1000;

const getCache = () => {
  const cached = NitroCache.get('dashboard_admin');
  return cached?.data || null;
};

/**
 * Hook para obtener datos del dashboard con CACHÉ INTELIGENTE.
 * Solo hace peticiones reales si el caché tiene más de 2 minutos de antigüedad.
 */
export const useDashboardData = () => {
  const cached = getCache();

  const [ventas, setVentas] = useState(cached?.ventas || []);
  const [compras, setCompras] = useState(cached?.compras || []);
  const [clientes, setClientes] = useState(cached?.clientes || []);
  const [estadisticas, setEstadisticas] = useState(cached?.estadisticas || null);
  // Si hay caché fresco, no mostramos spinner de carga
  const [loading, setLoading] = useState(!cached || !NitroCache.isFresh('dashboard_admin', DASHBOARD_TTL));
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si el caché está fresco (<2 min), no volvemos a pedir
    if (NitroCache.isFresh('dashboard_admin', DASHBOARD_TTL)) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadDashboardData = async () => {
      const user = JSON.parse(sessionStorage.getItem('user') || 'null');
      const token = sessionStorage.getItem('token');
      
      if (!user || !token) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const hasPermission = (moduleName) => {
          if (!user) return false;
          const userRolId = Number(user.idRol || user.IdRol || 0);
          const rolName = String(user.rol || user.Rol || user.rolData?.nombre || '').toUpperCase().trim();
          
          if (userRolId === 1 || rolName === 'ADMINISTRADOR' || rolName === 'ADMIN') return true;
          if (!user.permisos || !Array.isArray(user.permisos)) return false;

          return user.permisos.some(p => {
            const pStr = (typeof p === 'string' ? p : (p.nombre || p.id || p.modulo || '')).toLowerCase();
            const normalized = pStr.replace('perm_', '').replace('ver_', '').trim();
            return normalized === moduleName.toLowerCase();
          });
        };

        const hasVentas   = hasPermission('ventas');
        const hasCompras  = hasPermission('compras');
        const hasClientes = hasPermission('clientes');
        const hasDashboard = hasPermission('dashboard');

        // 🚀 Solo pedir lo que el usuario tiene permiso de ver
        const [ventasResult, comprasResult, clientesResult, statsResult] = await Promise.allSettled([
          hasVentas    ? fetchDashboardVentas()  : Promise.resolve([]),
          hasCompras   ? fetchDashboardCompras() : Promise.resolve([]),
          hasClientes  ? fetchDashboardClientes(): Promise.resolve([]),
          hasDashboard ? fetchDashboardStats()   : Promise.resolve(null),
        ]);
        
        if (!mounted) return;

        const newVentas      = ventasResult.status      === 'fulfilled' ? ventasResult.value      : (cached?.ventas      || []);
        const newCompras     = comprasResult.status     === 'fulfilled' ? comprasResult.value     : (cached?.compras     || []);
        const newClientes    = clientesResult.status    === 'fulfilled' ? clientesResult.value    : (cached?.clientes    || []);
        const newEstadisticas = statsResult.status      === 'fulfilled' ? statsResult.value       : (cached?.estadisticas || null);

        // 💾 Guardar con timestamp para controlar frescura
        const toCache = {
          ventas: newVentas,
          compras: newCompras,
          clientes: newClientes,
          estadisticas: newEstadisticas,
          _savedAt: Date.now()
        };
        NitroCache.set('dashboard_admin', toCache);

        setVentas(newVentas);
        setCompras(newCompras);
        setClientes(newClientes);
        setEstadisticas(newEstadisticas);
        setError(null);

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        if (mounted) setError(err.message || 'Error al cargar los datos');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboardData();
    return () => { mounted = false; };
  }, []);

  return { ventas, compras, clientes, estadisticas, loading, error };
};
