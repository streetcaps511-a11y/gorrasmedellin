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
  const cached = getCache();

  const [ventas, setVentas] = useState(cached?.ventas || []);
  const [compras, setCompras] = useState(cached?.compras || []);
  const [clientes, setClientes] = useState(cached?.clientes || []);
  const [estadisticas, setEstadisticas] = useState(cached?.estadisticas || null);
  // ⚡ Solo mostramos spinner si NO hay nada de caché.
  // Si el caché está vencido, cargamos en segundo plano sin bloquear la vista.
  const [loading, setLoading] = useState(!cached);
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

        const hasVentas = hasPermission('ventas');
        const hasCompras = hasPermission('compras');
        const hasClientes = hasPermission('clientes');
        const hasDashboard = hasPermission('dashboard');

        // 🚀 PROCESO DE CARGA INDIVIDUAL (No bloqueante)
        // Actualizamos cada estado en cuanto su promesa se resuelve para una UI más rápida
        
        const processVentas = async () => {
          if (!hasVentas) return;
          try {
            const data = await fetchDashboardVentas();
            if (mounted) {
              setVentas(data);
              // Actualizar caché parcial
              updateNitroCache('ventas', data);
            }
          } catch (e) { console.error("Error en ventas:", e); }
        };

        const processCompras = async () => {
          if (!hasCompras) return;
          try {
            const data = await fetchDashboardCompras();
            if (mounted) {
              setCompras(data);
              updateNitroCache('compras', data);
            }
          } catch (e) { console.error("Error en compras:", e); }
        };

        const processClientes = async () => {
          if (!hasClientes) return;
          try {
            const data = await fetchDashboardClientes();
            if (mounted) {
              setClientes(data);
              updateNitroCache('clientes', data);
            }
          } catch (e) { console.error("Error en clientes:", e); }
        };

        const processStats = async () => {
          if (!hasDashboard) return;
          try {
            const data = await fetchDashboardStats();
            if (mounted) {
              setEstadisticas(data);
              updateNitroCache('estadisticas', data);
            }
          } catch (e) { console.error("Error en stats:", e); }
        };

        // Función auxiliar para actualizar el caché de forma incremental
        const updateNitroCache = (key, value) => {
          const current = NitroCache.get('dashboard_admin')?.data || {};
          NitroCache.set('dashboard_admin', {
            ...current,
            [key]: value,
            _savedAt: Date.now()
          });
        };

        // Ejecutar todas en paralelo pero sin esperar (Promise.all)
        // Esto permite que la UI se actualice conforme llega cada respuesta
        Promise.allSettled([
          processVentas(),
          processCompras(),
          processClientes(),
          processStats()
        ]).then(() => {
          if (mounted) setLoading(false);
        });

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        if (mounted) setError(err.message || 'Error al cargar los datos');
        if (mounted) setLoading(false);
      }
    };


    loadDashboardData();
    return () => { mounted = false; };
  }, []);

  return { ventas, compras, clientes, estadisticas, loading, error };
};
