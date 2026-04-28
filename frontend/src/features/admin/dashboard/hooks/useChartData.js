/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

import { useMemo } from 'react';

/**
 * Parsea fecha de forma robusta (soporta DD/MM/YYYY y ISO Strings)
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  // Intentar parseo directo (para ISO strings de la BD)
  const directDate = new Date(dateStr);
  if (!isNaN(directDate.getTime())) return directDate;

  // Fallback para formato manual DD/MM/YYYY
  const [day, month, year] = dateStr.includes("/") ? dateStr.split("/") : [];
  if (day && month && year) return new Date(year, month - 1, day);
  
  return null;
};

/**
 * Formatea moneda en pesos colombianos
 */
export const formatCurrency = (amount) => {
  return `$${Number(amount || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
};

/**
 * Obtiene nombre del mes abreviado
 */
export const getMonthName = (monthNumber) => {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return months[monthNumber - 1] || monthNumber;
};

/**
 * Hook para calcular datos de ventas mensuales (SOLO COMPLETADAS)
 */
export const useSalesByMonth = (ventas, selectedYear, selectedMonth = "", selectedDay = "") => {
  return useMemo(() => {
    const map = {};
    (ventas || []).forEach(v => {
      const d = parseDate(v.fecha || v.Fecha);
      const isCompletada = (v.idEstado || v.IdEstado || "").toString().toLowerCase() === "completada";

      if (d && d.getFullYear().toString() === selectedYear && isCompletada) {
        const m = d.getMonth() + 1;
        const day = d.getDate().toString();

        // Aplicar filtros de mes y día si existen
        if (selectedMonth && m.toString() !== selectedMonth.toString()) return;
        if (selectedDay && day !== selectedDay.toString()) return;

        // 🛡️ Forzar Number() para evitar concatenación de strings
        const monto = Number(v.total || v.Total || 0);
        map[m] = (map[m] || 0) + monto;
      }
    });
    return Array.from({ length: 12 }, (_, i) => ({ 
      month: getMonthName(i + 1), 
      total: map[i + 1] || 0 
    }));
  }, [ventas, selectedYear, selectedMonth, selectedDay]);
};

/**
 * Hook para calcular datos de compras mensuales
 */
export const usePurchasesByMonth = (compras, selectedYear, selectedMonth = "", selectedDay = "") => {
  return useMemo(() => {
    const map = {};
    (compras || []).forEach(c => {
      const d = parseDate(c.Fecha || c.fecha);
      if (d && d.getFullYear().toString() === selectedYear) {
        const m = d.getMonth() + 1;
        const day = d.getDate().toString();

        // Aplicar filtros de mes y día si existen
        if (selectedMonth && m.toString() !== selectedMonth.toString()) return;
        if (selectedDay && day !== selectedDay.toString()) return;

        // 🛡️ Forzar Number() para evitar concatenación de strings
        const monto = Number(c.total || c.Total || 0);
        map[m] = (map[m] || 0) + monto;
      }
    });
    return Array.from({ length: 12 }, (_, i) => ({ 
      month: getMonthName(i + 1), 
      total: map[i + 1] || 0 
    }));
  }, [compras, selectedYear, selectedMonth, selectedDay]);
};

/**
 * Hook para obtener productos top filtrados por fecha
 */
export const useTopProducts = (ventas, productSearch, selectedYear, selectedMonth = "", selectedDay = "") => {
  return useMemo(() => {
    const pSales = {};
    (ventas || []).forEach(v => {
      const d = parseDate(v.fecha || v.Fecha);
      if (!d) return;

      const y = d.getFullYear().toString();
      const m = (d.getMonth() + 1).toString();
      const day = d.getDate().toString();

      if (y !== selectedYear) return;
      if (selectedMonth && m !== selectedMonth.toString()) return;
      if (selectedDay && day !== selectedDay.toString()) return;

      // Intentar obtener productos de los detalles (más preciso) o del campo raíz
      if (v.detalles && Array.isArray(v.detalles)) {
        v.detalles.forEach(det => {
          const nombre = det.producto?.nombre || det.NombreProducto || "Producto";
          const cant = Number(det.cantidad || 1);
          pSales[nombre] = (pSales[nombre] || 0) + cant;
        });
      } else {
        const nombre = v.producto || v.Producto;
        if (nombre) {
          pSales[nombre] = (pSales[nombre] || 0) + 1;
        }
      }
    });

    return Object.entries(pSales)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .filter(p => p.nombre.toLowerCase().includes(productSearch.toLowerCase()))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }, [ventas, productSearch, selectedYear, selectedMonth, selectedDay]);
};

/**
 * Hook para obtener clientes frecuentes filtrados por fecha
 */
export const useTopCustomers = (ventas, customerSearch, selectedYear, selectedMonth = "", selectedDay = "") => {
  return useMemo(() => {
    const cSales = {};
    (ventas || []).forEach(v => {
      const d = parseDate(v.fecha || v.Fecha);
      if (!d) return;

      const y = d.getFullYear().toString();
      const m = (d.getMonth() + 1).toString();
      const day = d.getDate().toString();

      if (y !== selectedYear) return;
      if (selectedMonth && m !== selectedMonth.toString()) return;
      if (selectedDay && day !== selectedDay.toString()) return;

      // Intentar obtener nombre de múltiples campos posibles
      const nombre = v.clienteData?.nombreCompleto || v.clienteData?.Nombre || 
                     v.cliente || v.Cliente || v.usuario || v.Usuario || 
                     "Cliente Anónimo";
      
      if (nombre) {
        cSales[nombre] = (cSales[nombre] || 0) + 1;
      }
    });

    return Object.entries(cSales)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .filter(c => c.nombre.toLowerCase().includes(customerSearch.toLowerCase()))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }, [ventas, customerSearch, selectedYear, selectedMonth, selectedDay]);
};
