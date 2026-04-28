/* === PÁGINA PRINCIPAL === 
   Este componente es la interfaz visual principal de la ruta. 
   Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */

import '../style/AdminDashboard.css';
import React from "react";
import { FaSyncAlt } from "react-icons/fa";
import { Alert, SearchInput } from '../../../shared/services';

// Hooks
import { 
  useDashboardFilters, 
  useDashboardData,
  useSalesByMonth,
  usePurchasesByMonth,
  useTopProducts,
  useTopCustomers,
  getMonthName
} from '../hooks';

// Componentes
import { SalesChart, PurchasesChart, TopProductsList, FrequentCustomersList, StatsCards } from '../components';

/**
 * Página principal del dashboard del admin
 * Conectada a API, sin data hardcodeada
 */
const AdminDashboard = () => {
  // Filtros
  const {
    selectedDay,
    setSelectedDay,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    productSearch,
    setProductSearch,
    customerSearch,
    setCustomerSearch,
    resetFilters,
  } = useDashboardFilters();

  // Datos del dashboard desde API
  const { ventas, compras, estadisticas, loading, error } = useDashboardData();

  // Datos procesados para gráficos (Filtrados por Año, Mes y Día)
  const salesByMonth = useSalesByMonth(ventas, selectedYear, selectedMonth, selectedDay);
  const purchasesByMonth = usePurchasesByMonth(compras, selectedYear, selectedMonth, selectedDay);
  
  // Listas calculadas dinámicamente según filtros de fecha y búsqueda interna
  const topProducts = useTopProducts(ventas, productSearch, selectedYear, selectedMonth, selectedDay);
  const frequentCustomers = useTopCustomers(ventas, customerSearch, selectedYear, selectedMonth, selectedDay);

  return (
    <div className="dashboard-container">
      {/* HEADER CON FILTROS */}
      <div className="header-top">
        <h1 className="dashboard-label">Panel de Dashboard</h1>
        <div className="filters-row">
          <select 
            className="slim-input" 
            value={selectedDay} 
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            <option value="">Día</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select 
            className="slim-input slim-input-month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">Mes</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{getMonthName(m)}</option>)}
          </select>
          <input
            type="number"
            className="slim-input slim-input-year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            placeholder="Año"
            title="Filtrar por año"
          />

          <button className="reset-button" onClick={resetFilters} title="Limpiar filtros">
            <FaSyncAlt size={12} />
          </button>
        </div>
      </div>

      {/* ESTADO DE CARGA SILENCIOSO (Solo error) */}

      {error && (
        <Alert 
          message={`Error al cargar datos: ${error}`} 
          type="error" 
          onClose={() => {}} 
        />
      )}
      
      {/* TARJETAS DE ESTADÍSTICAS (PRODUCTOS, PROVEEDORES, ETC) */}
      <StatsCards stats={estadisticas} />

      {/* GRÁFICOS PRINCIPALES */}
      <div className="main-visual-grid">
        <SalesChart data={salesByMonth} />
        <PurchasesChart data={purchasesByMonth} />
      </div>

      {/* LISTAS SECUNDARIAS */}
      <div className="main-visual-grid">
        <FrequentCustomersList customers={frequentCustomers} />
        <TopProductsList products={topProducts} />
      </div>

      {/* ÚLTIMOS REGISTROS */}
      {estadisticas && (
        <div className="main-visual-grid">
          <div className="chart-visual-box">
            <h3 className="chart-header-dark">ÚLTIMOS PRODUCTOS REGISTRADOS</h3>
            <div className="recent-list">
              {estadisticas.ultimosProductos?.map(p => (
                <div key={p.id} className="recent-item">
                  <span className="item-name">{p.nombre}</span>
                  <span className="item-date">{new Date(p.fecha).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-visual-box">
            <h3 className="chart-header-dark">ÚLTIMOS PROVEEDORES REGISTRADOS</h3>
            <div className="recent-list">
              {estadisticas.ultimosProveedores?.map(p => (
                <div key={p.id} className="recent-item">
                  <span className="item-name">{p.nombre}</span>
                  <span className="item-date">{new Date(p.fecha).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
