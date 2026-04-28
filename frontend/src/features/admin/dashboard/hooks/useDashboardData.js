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
  const [ventas, setVentas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

        // 🚀 Carga paralela sin caché
        await Promise.allSettled([
          hasVentas ? fetchDashboardVentas().then(d => mounted && setVentas(d)) : Promise.resolve(),
          hasCompras ? fetchDashboardCompras().then(d => mounted && setCompras(d)) : Promise.resolve(),
          hasClientes ? fetchDashboardClientes().then(d => mounted && setClientes(d)) : Promise.resolve(),
          hasDashboard ? fetchDashboardStats().then(d => mounted && setEstadisticas(d)) : Promise.resolve(),
        ]);

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
