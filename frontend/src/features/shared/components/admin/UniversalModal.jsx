import '../../styles/UniversalModal.css';
import React, { useEffect } from 'react';

const UniversalModal = ({
  isOpen,
  onClose,
  title = "Detalles",
  subtitle,
  children,
  showActions = false,
  onCancel,
  onConfirm,
  onSave,
  confirmText = "Guardar",
  actionLabel,
  customStyles = {},
  // Compatibilidad con versiones anteriores si es necesario
  actions = [],
  size = 'medium',
  loading = false,
  loadingText
}) => {
  /* ============================
     CERRAR CON ESC
  ============================ */
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = onSave || onConfirm || (() => {});
  const handleCancel = onCancel || onClose || (() => {});

  // Estilos personalizados si vienen por props
  const modalContentStyle = customStyles.content || {};
  const modalOverlayStyle = customStyles.overlay || {};

  return (
    <div
      className="universal-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={modalOverlayStyle}
    >
      <div
        className={`universal-modal-container modal-${size}`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        style={modalContentStyle}
      >
        {/* BOTÓN CERRAR */}
        <button
          type="button"
          onClick={onClose}
          className="modal-close-btn"
        >
          ×
        </button>

        {/* HEADER */}
        <div className="modal-header-section">
          <h2 className="modal-title-main">{title}</h2>
          {subtitle && (
            <p className="modal-subtitle-text">{subtitle}</p>
          )}
        </div>

        {/* CONTENIDO (Incluyendo las acciones) */}
  <div className="modal-content-scroll" style={{ overflowY: 'auto', flex: 1, position: 'relative' }}>
          {children}

          {/* FOOTER - Actions dentro del scroll para mayor integración */}
          {(showActions || actions.length > 0) && (
            <div className="modal-footer-actions">
              {/* Renderizar acciones por el nuevo formato o el antiguo */}
              {actions.length > 0 ? (
                actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (loading) return;
                      action.onClick?.();
                      if (action.closeOnClick !== false) onClose();
                    }}
                    className={`btn-modal-base ${action.variant === 'secondary' ? 'btn-modal-cancel' : 'btn-modal-confirm'} ${loading ? 'loading' : ''}`}
                    disabled={loading || action.disabled}
                  >
                    {loading && action.variant !== 'secondary' ? (loadingText || "Procesando...") : action.label}
                  </button>
                ))
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-modal-base btn-modal-cancel"
                    disabled={loading}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    className={`btn-modal-base btn-modal-confirm ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? (loadingText || "Cargando...") : (actionLabel || confirmText)}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversalModal;