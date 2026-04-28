import React from 'react';
import { FaBox, FaTruck, FaUsers, FaShoppingCart } from 'react-icons/fa';
import '../style/StatsCards.css';

const StatsCard = ({ title, value, icon: Icon, color, subValue }) => (
  <div className="stats-card" style={{ borderTop: `4px solid ${color}` }}>
    <div className="stats-card-content">
      <div className="stats-card-info">
        <p className="stats-card-title">{title}</p>
        <h3 className="stats-card-value">{value}</h3>
        {subValue && <p className="stats-card-subvalue">{subValue}</p>}
      </div>
      <div className="stats-card-icon-wrapper" style={{ backgroundColor: `${color}20`, color: color }}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const StatsCards = ({ stats }) => {
  if (!stats || !stats.conteos) return null;

  const { conteos, caja } = stats;

  const cards = [
    {
      title: 'Productos Registrados',
      value: conteos.productos || 0,
      icon: FaBox,
      color: '#3B82F6', // Blue
      subValue: `${conteos.categorias || 0} categorías`
    },
    {
      title: 'Proveedores Activos',
      value: conteos.proveedores || 0,
      icon: FaTruck,
      color: '#F59E0B', // Amber
      subValue: 'Registrados en el sistema'
    },
    {
      title: 'Clientes Totales',
      value: conteos.clientes || 0,
      icon: FaUsers,
      color: '#10B981', // Emerald
      subValue: 'Clientes en base de datos'
    },
    {
      title: 'Ventas del Mes',
      value: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(caja?.ventasMes || 0),
      icon: FaShoppingCart,
      color: '#8B5CF6', // Violet
      subValue: `${conteos.ventas || 0} transacciones totales`
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
