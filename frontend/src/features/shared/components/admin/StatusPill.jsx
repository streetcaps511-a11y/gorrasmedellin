import '../../styles/StatusPill.css';
import React from 'react';

const StatusPill = React.memo(({ status, name = null, size = 'medium' }) => {
  let normalizedStatus = '';
  if (typeof status === 'boolean') {
    normalizedStatus = status ? 'activo' : 'inactivo';
  } else {
    normalizedStatus = status?.toString().toLowerCase() || '';
  }
  
  // Mapear estado a clase
  const getStatusClass = () => {
    if (normalizedStatus.includes('inactivo') || normalizedStatus === 'inactive' || normalizedStatus.includes('anulad') || normalizedStatus.includes('rechazad')) return 'inactive';
    if (normalizedStatus.includes('activo') || normalizedStatus === 'active') return 'active';
    if (normalizedStatus.includes('pendiente') || normalizedStatus === 'pending') return 'pending';
    if (normalizedStatus.includes('completad') || normalizedStatus === 'completed') return 'completed';
    return 'default';
  };

  const statusType = getStatusClass();
  
  const getDisplayText = () => {
    if (name) return name;
    if (typeof status === 'boolean') return status ? 'Activo' : 'Inactivo';
    if (normalizedStatus.includes('anulad')) return 'Anulada';
    if (normalizedStatus.includes('rechazad')) return 'Rechazada';
    if (statusType === 'active') return 'Activo';
    if (statusType === 'inactive') return 'Inactivo';
    if (statusType === 'pending') return 'Pendiente';
    if (statusType === 'completed') return 'Completado';
    return String(status || 'N/A');
  };

  const displayText = getDisplayText();

  const sizeClass = size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md';

  return (
    <span className={`status-pill-container status-pill-${sizeClass} status-pill-${statusType}`}>
      {displayText}
    </span>
  );
});

StatusPill.displayName = 'StatusPill';

export default StatusPill;
