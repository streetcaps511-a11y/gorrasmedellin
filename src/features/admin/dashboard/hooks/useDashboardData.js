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
  const DASHBOARD_TTL = 5 * 60 * 1000; // 5 minutos exactos

  const getCache = () => {
    const cached = NitroCache.get('dashboard_admin');
    if (cached && NitroCache.isFresh('dashboard_admin', DASHBOARD_TTL)) return cached.data;
    return null;
  };

  const cachedData = getCache();
  const [ventas, setVentas] = useState(cachedData?.ventas || []);
  const [compras, setCompras] = useState(cachedData?.compras || []);
  const [clientes, setClientes] = useState(cachedData?.clientes || []);
  const [estadisticas, setEstadisticas] = useState(cachedData?.estadisticas || null);
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

        const [rVentas, rCompras, rClientes, rStats] = await Promise.all([
          hasPermission('ventas') ? fetchDashboardVentas() : Promise.resolve([]),
          hasPermission('compras') ? fetchDashboardCompras() : Promise.resolve([]),
          hasPermission('clientes') ? fetchDashboardClientes() : Promise.resolve([]),
          hasPermission('dashboard') ? fetchDashboardStats() : Promise.resolve(null),
        ]);

        if (mounted) {
          const allData = { ventas: rVentas, compras: rCompras, clientes: rClientes, estadisticas: rStats };
          
          setVentas(rVentas);
          setCompras(rCompras);
          setClientes(rClientes);
          setEstadisticas(rStats);
          
          NitroCache.set('dashboard_admin', allData);
          setLoading(false);
        }

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        if (mounted) {
          setError(err.message || 'Error al cargar los datos');
          setLoading(false);
        }
      }
    };



    loadDashboardData();
    return () => { mounted = false; };
  }, []);

  return { ventas, compras, clientes, estadisticas, loading, error };
};
