import '../../styles/AnularOperacionModal.css';
// src/components/AnularOperacionModal.jsx
import React from 'react';

const getDisplayParts = (operationData, operationType) => {
    if (!operationData) return { prefix: `el/la ${operationType}`, name: "" };
    
    // 1. Prioridad: Venta (Cliente)
    if (operationData.cliente) {
        let clienteNombre = '';
        if (typeof operationData.cliente === 'object' && operationData.cliente !== null) {
            clienteNombre = operationData.cliente.nombre || operationData.cliente.id;
        } else {
            clienteNombre = operationData.cliente;
        }
        return { prefix: `el/la cliente:`, name: clienteNombre || 'N/A' };
    }
    
    // 2. Prioridad: Compra (Proveedor)
    if (operationData.proveedor) {
        return { prefix: `el/la proveedor:`, name: operationData.proveedor || 'N/A' };
    }
    
    // 3. Prioridad: Elementos genéricos (Producto, Usuario, Rol, etc.)
    if (operationData.companyName) {
        return { prefix: `el/la proveedor:`, name: operationData.companyName };
    }
    if (operationData.nombreCompleto) {
        return { prefix: `el/la cliente:`, name: operationData.nombreCompleto };
    }
    if (operationData.nombre) {
        return { prefix: `el/la ${operationType}:`, name: operationData.nombre };
    }
    if (operationData.name) {
        return { prefix: `el/la ${operationType}:`, name: operationData.name };
    }
    if (operationData.Nombre) {
      return { prefix: `el/la ${operationType}:`, name: operationData.Nombre };
    }
    if (operationData.email) {
        return { prefix: `el/la usuario:`, name: operationData.email };
    }

    // Fallback: Usar código o ID si no hay nombre claro
    if (operationData.codigo || operationData.id) {
        return { prefix: `la ${operationType}:`, name: (operationData.codigo || operationData.id).toString() };
    }

    return { prefix: `el/la ${operationType}`, name: "" };
};

const AnularOperacionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar acción",
  operationType = "operación",
  operationData,
  confirmButtonText = "Desactivar",
  cancelButtonText = "Conservar",
  loading = false,
  loadingText
}) => {
  if (!isOpen) return null;

  const { prefix, name } = getDisplayParts(operationData, operationType);

  // Generar texto de carga por defecto basado en el botón si no se provee loadingText
  const getAutoLoadingText = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('desactivar')) return "Desactivando...";
    if (lower.includes('activar')) return "Activando...";
    if (lower.includes('anular')) return "Anulando...";
    if (lower.includes('eliminar')) return "Eliminando...";
    if (lower.includes('cambiar')) return "Cambiando...";
    return "Procesando...";
  };

  const currentLoadingText = loadingText || getAutoLoadingText(confirmButtonText);

  return (
    <div className="anular-modal-backdrop" onClick={loading ? null : onClose}>
      <div className="anular-modal-container" onClick={(e) => e.stopPropagation()}>
        <h3 className="anular-modal-title">{title}</h3>

        <div className="anular-modal-message-container">
          <p className="anular-modal-message">
            Estás a punto de {confirmButtonText.toLowerCase()} {prefix} <span style={{ color: '#3b82f6', fontWeight: '800' }}>{name}</span>
            <span className="anular-modal-highlight">. ¿Deseas continuar?</span>
          </p>
        </div>

        <div className="anular-modal-actions">
          <button
            onClick={onClose}
            className="anular-modal-btn anular-modal-btn-cancel"
            disabled={loading}
          >
            {cancelButtonText}
          </button>
          
          <button
            onClick={onConfirm}
            className={`anular-modal-btn anular-modal-btn-confirm ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? currentLoadingText : confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnularOperacionModal;
