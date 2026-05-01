/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

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
  const DASHBOARD_TTL = 1; // 1 ms para forzar carga siempre

  const getCache = () => {
    const cached = NitroCache.get('dashboard_admin');
    if (cached && NitroCache.isFresh('dashboard_admin', DASHBOARD_TTL)) return cached.data;
    return null;
  };

  const cachedData = getCache();
  const [ventas, setVentas] = useState(cachedData?.ventas || []);
  const [compras, setCompras] = useState(cachedData?.compras || []);
  const [clientes, setClientes] = useState(cachedData?.clientes || []);
  const [stats, setStats] = useState(cachedData?.stats || {
    totalVentas: 0,
    totalCompras: 0,
    totalClientes: 0,
    ventasHoy: 0,
    ventasMes: 0,
    totalVentasHistorico: 0
  });
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      // Si el caché está fresco, no cargamos nada
      if (NitroCache.isFresh('dashboard_admin', DASHBOARD_TTL)) {
        if (mounted) setLoading(false);
        return;
      }

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
            return pStr.includes(moduleName.toLowerCase());
          });
        };

        // 🚀 CARGA ULTRA-AGRESIVA (Prioridad: Mostrar Datos)
        const [rVentas, rCompras, rClientes, rStats] = await Promise.all([
          fetchDashboardVentas().catch(() => []),
          fetchDashboardCompras().catch(() => []),
          fetchDashboardClientes().catch(() => []),
          fetchDashboardStats().catch(() => ({}))
        ]);

        if (mounted) {
          // 🚀 Los servicios ya devuelven el .data limpio, los usamos directamente
          const statsData = rStats || {};
          
          // 🛡️ RE-SINCRONIZACIÓN DE LISTAS (Productos y Clientes)
          // Si statsData tiene las listas, las usamos, si no, fallback a vacío
          const allData = { 
            ventas: Array.isArray(rVentas) ? rVentas : [], 
            compras: Array.isArray(rCompras) ? rCompras : [], 
            clientes: Array.isArray(rClientes) ? rClientes : [],
            stats: {
              ...statsData,
              productosMasVendidos: statsData.productosMasVendidos || [],
              clientesRecurrentes: statsData.clientesRecurrentes || []
            }
          };
          
          setVentas(allData.ventas);
          setCompras(allData.compras);
          setClientes(allData.clientes);
          setStats(allData.stats);
          
          NitroCache.set('dashboard_admin', allData);
          setLoading(false);
        }

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        // Reintento silencioso una vez si falla
        if (mounted) {
           setError(err.message || 'Error al conectar con el servidor');
           setLoading(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };



    loadDashboardData();
    return () => { mounted = false; };
  }, []);

  return { 
    ventas, 
    compras, 
    clientes, 
    stats,
    loading, 
    error,
    refresh: () => {
      NitroCache.remove('dashboard_admin');
      window.location.reload();
    }
  };
};
