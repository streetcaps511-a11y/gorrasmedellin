/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import '../styles/CenterAlert.css';
import React, { useEffect } from 'react';

const CenterAlert = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 10000,
        animation: 'fadeIn 0.3s ease'
      }} />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#030712',
        border: '1px solid #4CAF50',
        borderRadius: '15px',
        padding: '25px',
        maxWidth: '350px',
        width: '90%',
        textAlign: 'center',
        zIndex: 10001,
        animation: 'slideUp 0.4s ease'
      }}>
        <div style={{
          fontSize: '2rem',
          marginBottom: '12px',
          color: '#4CAF50'
        }}>
          ✓
        </div>
        
        <h3 style={{
          color: '#4CAF50',
          margin: '0 0 8px 0',
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}>
          ¡Éxito!
        </h3>
        
        <p style={{
          color: '#CBD5E1',
          marginBottom: '15px',
          fontSize: '0.9rem',
          lineHeight: '1.4'
        }}>
          {message}
        </p>
        
        <div style={{
          fontSize: '0.8rem',
          color: '#666',
          fontStyle: 'italic'
        }}>
          Esta alerta se cerrará automáticamente...
        </div>
      </div>
      
      
    </>
  );
};

export default CenterAlert;
