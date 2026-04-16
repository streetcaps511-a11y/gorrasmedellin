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
