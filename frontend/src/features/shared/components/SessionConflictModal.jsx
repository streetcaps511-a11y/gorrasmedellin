/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { FaUserShield, FaSignOutAlt, FaRocket } from 'react-icons/fa';
import '../styles/SessionConflictModal.css';

const SessionConflictModal = ({ 
  title = "SESIÓN ACTIVA EN OTRO LUGAR", 
  description = "Tu cuenta se ha abierto en otro dispositivo o navegador.",
  infoText = "Por seguridad, solo puedes tener una sesión activa a la vez.",
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
          <div className="sc-icon-pulse">
            <FaUserShield size={40} color="#F5C81B" />
          </div>
        </div>
        
        <h2 className="sc-title">{title}</h2>
        
        <p className="sc-description">{description}</p>

        <div className="sc-info-box">
          <p>{infoText}</p>
        </div>

        <div className="sc-actions">
          <button className="sc-btn sc-btn-secondary" onClick={handleClose}>
            <FaSignOutAlt />
            <span>Cerrar</span>
          </button>

          {showUseHere && (
            <button className="sc-btn sc-btn-primary" onClick={handleUseHere}>
              <FaRocket />
              <span>Usar aquí</span>
            </button>
          )}
        </div>
        
        <div className="sc-footer">
          Si no fuiste tú, te recomendamos cambiar tu contraseña inmediatamente.
        </div>
      </div>
    </div>
  );
};

export default SessionConflictModal;
