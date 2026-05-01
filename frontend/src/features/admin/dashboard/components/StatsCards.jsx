import React from 'react';
import { FaBox, FaTruck, FaUsers, FaShoppingCart } from 'react-icons/fa';
import '../style/StatsCards.css';

const StatsCard = ({ title, value, color, subValue }) => (
  <div className="stats-card">
    <div className="stats-card-content">
      <div className="stats-card-info">
        <p className="stats-card-title">{title}</p>
        <h3 className="stats-card-value">{value}</h3>
        {subValue && <p className="stats-card-subvalue">{subValue}</p>}
      </div>
    </div>
  </div>
);

const StatsCards = ({ stats }) => {
  // 🛡️ PROTECCIÓN TOTAL: No ocultar el componente si faltan datos
  const conteos = stats?.conteos || {};
  const caja = stats?.caja || {};

  const cards = [
    {
      title: 'Ventas Totales',
      value: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(caja?.totalVentas || 0),
      icon: FaShoppingCart,
      color: '#3B82F6', // Blue
      subValue: 'Histórico total'
    },
    {
      title: 'Ventas de Hoy',
      value: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(caja?.ventasHoy || 0),
      icon: FaShoppingCart,
      color: '#F59E0B', // Amber
      subValue: 'Ventas del día actual'
    },
    {
      title: 'Ventas del Mes',
      value: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(caja?.ventasMes || 0),
      icon: FaShoppingCart,
      color: '#10B981', // Emerald
      subValue: 'Mes actual'
    },
    {
      title: 'Ganancias del Mes',
      value: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(caja?.balanceMes || 0),
      icon: FaShoppingCart,
      color: '#8B5CF6', // Violet
      subValue: 'Utilidad neta mensual'
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  );
};

export default StatsCards;
