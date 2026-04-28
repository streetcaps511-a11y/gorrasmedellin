/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { FaUserShield, FaSignOutAlt, FaRocket } from 'react-icons/fa';
import '../styles/SessionConflictModal.css';

const SessionConflictModal = ({ 
  title = "SESIÓN INICIADA EN OTRO LUGAR", 
  description = "¡Hola! Por seguridad, hemos detectado que tu cuenta se ha abierto en un nuevo navegador o dispositivo.",
  infoText = "Para proteger tus datos, esta sesión ha sido desactivada automáticamente.",
  showUseHere = false,
  onUseHere,
  onClose
}) => {
  
  const handleUseHere = () => {
    if (onUseHere) {
      onUseHere();
    } else {
      sessionStorage.clear();
      window.location.href = '/login?ref=force';
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="sc-overlay">
      <div className="sc-container">
        <div className="sc-icon-header">
          <FaUserShield size={32} color="#F5C81B" />
        </div>
        
        <h2 className="sc-title">SESIÓN ACTIVA EN OTRO LUGAR</h2>
        
        <p className="sc-description">Tu cuenta se ha abierto en otro dispositivo o navegador.</p>

        <div className="sc-actions">
          <button className="sc-btn sc-btn-secondary" onClick={handleClose}>
            <span>Entendido</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default SessionConflictModal;
