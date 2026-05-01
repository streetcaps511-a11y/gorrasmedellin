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
  const DASHBOARD_TTL = 2 * 60 * 1000; // 2 minutos para evitar saturación

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
      const user = JSON.parse(sessionStorage.getItem('user') || 'null');
      const token = sessionStorage.getItem('token');

      if (!user || !token) {
        if (mounted) setLoading(false);
        return;
      }

      // Si el caché está fresco, no cargamos nada
      if (NitroCache.isFresh('dashboard_admin', DASHBOARD_TTL)) {
        if (mounted) setLoading(false);
        return;
      }

      // Función auxiliar para cargar cada pieza de forma independiente
      const loadPiece = async (fetchFn, setterFn, fallbackValue) => {
        try {
          const result = await fetchFn();
          if (mounted) setterFn(result || fallbackValue);
          return result || fallbackValue;
        } catch (err) {
          console.error(`Error cargando pieza del dashboard:`, err);
          if (mounted) setterFn(fallbackValue);
          return fallbackValue;
        }
      };

      try {
        if (mounted) setLoading(true);

        // Disparamos todas las peticiones en paralelo pero sin esperar a todas juntas con await individual
        const [rVentas, rCompras, rClientes, rStats] = await Promise.all([
          loadPiece(fetchDashboardVentas, setVentas, []),
          loadPiece(fetchDashboardCompras, setCompras, []),
          loadPiece(fetchDashboardClientes, setClientes, []),
          loadPiece(fetchDashboardStats, (data) => {
             setStats({
                ...data,
                productosMasVendidos: data?.productosMasVendidos || [],
                clientesRecurrentes: data?.clientesRecurrentes || []
             });
          }, {})
        ]);

        if (mounted) {
          // Guardamos en caché lo que tengamos al final
          NitroCache.set('dashboard_admin', { 
            ventas: rVentas, 
            compras: rCompras, 
            clientes: rClientes, 
            stats: rStats 
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ Error general en Dashboard:', err);
        if (mounted) {
          setError('No se pudo sincronizar toda la información.');
          setLoading(false);
        }
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
