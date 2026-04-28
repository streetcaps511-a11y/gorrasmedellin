/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import '../../Productos/styles/ProductosHero.css'; // Reutilizamos estilos

const CartHero = () => {
  return (
    <div className="gm-hero">
      <div className="gm-hero-bg" />
      <div className="gm-hero-fade-top" />
      <div className="gm-hero-fade-bottom" />
      <div className="gm-hero-inner">
        <h1 className="gm-hero-title">Tu Carrito de Compras</h1>
        <p className="gm-hero-sub">Administra tus productos y finaliza tu pedido</p>
      </div>
    </div>
  );
};

export default CartHero;
