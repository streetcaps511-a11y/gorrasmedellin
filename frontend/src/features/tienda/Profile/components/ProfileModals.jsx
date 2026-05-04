/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useState } from 'react';
import { 
  FaTimes, FaCheckCircle, FaExclamationTriangle, FaExchangeAlt, FaCalendarTimes, FaArrowRight
} from "react-icons/fa";
import '../styles/ProfileModals.css';

export const ImageModal = ({ src, onClose }) => (
  <div className="gm-zoom-overlay" onClick={onClose}>
    <div className="gm-zoom-container" onClick={e => e.stopPropagation()}>
      <button className="gm-zoom-close" onClick={onClose}><FaTimes size={24} /></button>
      <img src={src} className="gm-zoom-img" alt="zoom" />
    </div>
  </div>
);

export const SuccessModal = ({ onClose }) => (
  <div className="gm-modal-overlay-p">
    <div className="gm-success-modal">
      <div style={{ width: "80px", height: "80px", backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 25px", border: "1px solid #10b981" }}>
        <FaCheckCircle color="#10b981" size={40} />
      </div>
      <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "15px", color: "#fff" }}>¡Solicitud enviada con éxito!</h3>
      <p style={{ color: "#94a3b8", lineHeight: "1.6", fontSize: "0.95rem", marginBottom: "30px" }}>
        Su solicitud de cambio ha sido registrada. Nuestro equipo de administración revisará la información proporcionada a la brevedad. 
        <br /><br />
        Podrá realizar el seguimiento de su caso y ver la respuesta definitiva directamente en la pestaña <strong>"Devoluciones"</strong> de su perfil.
      </p>
      <button 
        onClick={onClose} 
        style={{ width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "#FFC107", color: "#000", border: "none", fontWeight: 800, cursor: "pointer", fontSize: "1rem" }}
      >
        ENTENDIDO
      </button>
    </div>
  </div>
);

export const ConfirmModal = ({ modal, onClose }) => (
  <div className="gm-modal-overlay-p">
    <div className={`gm-confirm-modal ${modal.isDanger ? 'danger' : ''}`}>
      <p className="gm-modal-msg-center-p">{modal.message}</p>
      <div className="gm-modal-actions-center-p">
        <button onClick={onClose} className="gm-btn-cancel-p">CANCELAR</button>
        <button 
          onClick={modal.onConfirm} 
          className={`gm-btn-confirm-p ${modal.isDanger ? 'danger' : ''}`}
        >
          {modal.confirmText}
        </button>
      </div>
    </div>
  </div>
);

export const PolicyModal = ({ onClose, onContinue }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="gm-modal-overlay-p">
      <div className="gm-policy-modal">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", margin: 0 }}>Políticas de Cambios y Devoluciones</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '12px', padding: '18px 22px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: "#cbd5e1", lineHeight: "1.4", fontSize: "0.85rem", marginBottom: "12px", fontWeight: 600 }}>
              En <span style={{ color: '#FFC107' }}>Gorras Medellín Caps</span> queremos que estés 100% satisfecho con tu compra.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <ul style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: "1.4", paddingLeft: "15px", margin: 0 }}>
                <li style={{ marginBottom: '4px' }}>Cambios en los primeros <strong>5 días</strong>.</li>
                <li>Gorra <strong>sin uso</strong> con etiquetas.</li>
              </ul>
              <ul style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: "1.4", paddingLeft: "15px", margin: 0 }}>
                <li style={{ marginBottom: '4px' }}>No hay devoluciones de dinero.</li>
                <li>Envío por cuenta del cliente.</li>
              </ul>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '15px 22px', borderRadius: '12px' }}>
            <h4 style={{ color: '#ef4444', margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaExclamationTriangle size={12} /> PRODUCTOS CON DEFECTO
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.75rem', margin: 0, lineHeight: 1.4 }}>
              Reportar en las primeras <strong>48 horas</strong> post-entrega para que nosotros asumamos el costo del cambio.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', display: 'flex', flexDirection: 'column' }}>
          <label className="gm-checkbox-row" style={{ marginBottom: '20px' }}>
            <input 
              type="checkbox" 
              className="gm-checkbox-custom" 
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span className="gm-checkbox-label" style={{ fontSize: '0.8rem' }}>Acepto las políticas de cambios de productos de StreetCaps.</span>
          </label>

          <div style={{ display: "flex", gap: "12px", width: '100%' }}>
            <button onClick={onClose} className="gm-btn-cancel-p" style={{ flex: 1, fontSize: '0.85rem' }}>CANCELAR</button>
            <button 
              onClick={onContinue} 
              className="gm-btn-confirm-p" 
              style={{ flex: 1, fontSize: '0.85rem' }}
              disabled={!accepted}
            >
              CONTINUAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExpiredReturnModal = ({ onClose, periodDays, expiredDate, orderDate }) => (
  <div className="gm-modal-overlay-p gm-expired-overlay">
    <div className="gm-expired-modal">

      {/* Glow decorativo de fondo */}
      <div className="gm-expired-glow" />

      {/* Ícono de reloj / calendario vencido */}
      <div className="gm-expired-icon-ring">
        <div className="gm-expired-icon-inner">
          <FaCalendarTimes size={34} color="#ef4444" />
        </div>
      </div>

      {/* Badge de estado */}
      <div className="gm-expired-badge">
        <span className="gm-expired-badge-dot" />
        PLAZO VENCIDO
      </div>

      <h3 className="gm-expired-title">¡Ya no es posible solicitar un cambio!</h3>

      <p className="gm-expired-desc">
        El período de <strong>{periodDays} días</strong> para solicitar cambios o devoluciones
        en este pedido ha expirado. Lamentablemente no podemos procesar tu solicitud.
      </p>

      {/* Tarjeta de fechas */}
      <div className="gm-expired-dates-card">
        <div className="gm-expired-date-item">
          <span className="gm-expired-date-label">Fecha del pedido</span>
          <span className="gm-expired-date-value">{orderDate}</span>
        </div>
        <div className="gm-expired-date-divider" />
        <div className="gm-expired-date-item">
          <span className="gm-expired-date-label">Plazo venció el</span>
          <span className="gm-expired-date-value gm-expired-date-red">{expiredDate}</span>
        </div>
      </div>

      {/* Botones */}
      <div className="gm-expired-actions">
        <button onClick={onClose} className="gm-expired-btn-secondary">
          ENTENDIDO
        </button>
        <a href="/politica-devoluciones" className="gm-expired-btn-primary">
          VER POLÍTICAS <FaArrowRight size={12} />
        </a>
      </div>
    </div>
  </div>
);

export const RejectionReasonModal = ({ reason, onClose }) => (
  <div className="gm-modal-overlay-p">
    <div className="gm-rejection-modal">
      <div className="gm-rejection-modal-header">
        <h3 className="gm-rejection-modal-title">Motivo del Rechazo</h3>
        <button className="gm-rejection-modal-close" onClick={onClose}>
          <FaTimes size={18} />
        </button>
      </div>
      <div className="gm-rejection-modal-content">
        <p className="gm-rejection-text">{reason}</p>
      </div>
    </div>
  </div>
);

