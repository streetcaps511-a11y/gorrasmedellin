import '../../styles/EntityTable.css';
import React from 'react';
import { FaEye, FaEdit, FaTrash, FaBan, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';

const CustomSwitch = ({ isCurrentlyActive, toggleAction, toggleTitle, activeColor = '#10b981', inactiveColor = '#ef4444' }) => {
  if (!toggleAction) return null;

  return (
    <button
      type="button"
      className={`custom-switch ${isCurrentlyActive ? 'active' : 'inactive'}`}
      onClick={toggleAction}
      title={toggleTitle}
      style={{ '--switch-on-color': activeColor, '--switch-off-color': inactiveColor }}
    >
      <span className="custom-switch-thumb" />
    </button>
  );
};

const EntityTable = ({
  entities = [],
  columns = [],
  idField = 'id',
  onView,
  onEdit,
  onDelete,
  onAnular,
  onComplete,
  onApprove,
  onReject,
  onPartialPago,
  onReactivar,
  estadoField = 'estado',
  moduleType = 'generic',
  isAdministradorCheck = null,
  isActiveField,
  switchProps = {},
  isRestrictedActionCheck = null,
}) => {
  const getEstadoField = () => {
    return estadoField || isActiveField || 'estado';
  };

  const isAdministrador = (row) =>
    isAdministradorCheck ? isAdministradorCheck(row) : false;

  const getDisplayValue = (value) => {
    if (value === null || value === undefined) return '-';
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      // 🛡️ Extraer nombre o label si es un objeto
      return value.nombre || value.Nombre || value.label || value.label || value.name || value.Name || '-';
    }
    
    if (Array.isArray(value)) {
      return value.map(v => (typeof v === 'object' ? (v.nombre || v.Nombre || String(v)) : v)).join(', ');
    }
    
    return String(value);
  };

  const isEmpty = !entities || entities.length === 0;

  // Formatear el mensaje según el tipo de módulo
  const getEmptyMessage = () => {
    switch (moduleType?.toLowerCase()) {
      case 'ventas': return 'No hay ventas registradas';
      case 'productos': return 'No hay productos disponibles';
      case 'categorias': return 'No hay categorías creadas';
      case 'proveedores': return 'No hay proveedores registrados';
      case 'compras': return 'No hay órdenes de compra';
      case 'clientes': return 'No hay clientes registrados';
      case 'usuarios': return 'No hay usuarios en el sistema';
      case 'roles': return 'No hay roles definidos';
      case 'devoluciones': return 'No hay devoluciones registradas';
      default: return 'No hay datos para mostrar';
    }
  };

  return (
    <div className="entity-table-container">
      <table className="entity-table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th 
                key={i} 
                className="entity-table-header-cell"
                style={{ width: col.width || 'auto' }}
              >
                {col.header}
              </th>
            ))}
            <th className="entity-table-header-cell actions-header">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td 
                colSpan={columns.length + 1} 
                className="entity-table-cell entity-table-empty-row"
                style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px', 
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontStyle: 'italic',
                  fontSize: '15px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px', opacity: 0.6 }}>📂</span>
                  {getEmptyMessage()}
                </div>
              </td>
            </tr>
          ) : (
            entities.map((row, rowIndex) => {
              const estadoKey = getEstadoField();
              const estadoValue = row?.[estadoKey];
              const isCurrentlyActive =
                estadoValue === true ||
                estadoValue === 1 ||
                estadoValue === 'Activo' ||
                estadoValue === 'Completada';

              const admin = isAdministrador(row);
              const showSwitch = moduleType !== 'ventas' && moduleType !== 'compras';
              const toggleAction = showSwitch ? (isCurrentlyActive ? onAnular : onReactivar) : null;

              return (
                <tr key={row[idField] || rowIndex} className={rowIndex % 2 === 0 ? 'row-even' : 'row-odd'}>
                  {columns.map((col, colIndex) => {
                    const content = typeof col.render === 'function'
                      ? col.render(row)
                      : getDisplayValue(row?.[col.field]);

                    return (
                      <td
                        key={`${col.field}-${colIndex}`}
                        className="entity-table-cell"
                        title={typeof content === 'string' ? content : ' '}
                      >
                        {content}
                      </td>
                    );
                  })}
                  <td className="entity-table-cell actions-cell">
                    <div className="actions-wrapper">
                      {isRestrictedActionCheck && isRestrictedActionCheck(row) ? (
                        <div className="actions-wrapper">
                          {onView && (
                            <FaEye
                              size={18}
                              className="action-icon"
                              onClick={() => onView(row)}
                              title="Ver detalles"
                            />
                          )}
                        </div>
                      ) : admin ? (
                        <div className="actions-wrapper">
                          {onView && (
                            <FaEye
                              size={18}
                              className="action-icon"
                              onClick={() => onView(row)}
                              title="Ver detalles"
                            />
                          )}
                          {onEdit && (
                            <FaEdit
                              size={18}
                              className="action-icon"
                              onClick={() => onEdit(row)}
                              title="Editar"
                            />
                          )}
                        </div>
                      ) : (
                        <>
                          {showSwitch && toggleAction && (
                            <CustomSwitch
                              isCurrentlyActive={isCurrentlyActive}
                              toggleAction={() => toggleAction(row)}
                              toggleTitle={isCurrentlyActive ? 'Desactivar' : 'Reactivar'}
                              activeColor={switchProps.activeColor}
                              inactiveColor={switchProps.inactiveColor}
                            />
                          )}

                          {onComplete && moduleType === 'compras' && (
                            <FaCheckCircle
                              size={18}
                              className={`action-icon ${row.estado === 'Completada' ? 'disabled-icon' : ''}`}
                              onClick={row.estado === 'Pendiente' ? () => onComplete(row) : undefined}
                              title={row.estado === 'Pendiente' ? "Marcar como completada" : (row.estado === 'Anulada' ? "Compra anulada" : "Ya completada")}
                              style={{ 
                                color: row.estado === 'Completada' ? '#065f46' : '#10b981', 
                                opacity: row.estado === 'Pendiente' ? 1 : 0.4,
                                cursor: row.estado === 'Pendiente' ? 'pointer' : 'default'
                              }}
                            />
                          )}

                           {onApprove && (
                            <FaCheckCircle
                              size={18}
                              className="action-icon action-approve"
                              onClick={row.estado === 'Pendiente' ? () => onApprove(row) : undefined}
                              title="Aprobar"
                              style={{ 
                                color: '#10b981', 
                                display: row.estado === 'Pendiente' ? 'block' : 'none'
                              }}
                            />
                          )}

                           {onReject && (
                            <FaTimesCircle
                              size={18}
                              className="action-icon action-reject"
                              onClick={row.estado === 'Pendiente' ? () => onReject(row) : undefined}
                              title="Rechazar"
                              style={{ 
                                color: '#ef4444', 
                                display: row.estado === 'Pendiente' ? 'block' : 'none'
                              }}
                            />
                          )}

                          {onPartialPago && (
                            <FaExclamationCircle
                              size={18}
                              className="action-icon action-partial"
                              onClick={(row.estado === 'Pendiente' || row.estado === 'Pago Incompleto') ? () => onPartialPago(row) : undefined}
                              title={(row.estado === 'Pendiente' || row.estado === 'Pago Incompleto') ? "Marcar Pago Incompleto" : ""}
                              style={{ 
                                color: '#f59e0b', 
                                opacity: (row.estado === 'Pendiente' || row.estado === 'Pago Incompleto') ? 1 : 0,
                                cursor: (row.estado === 'Pendiente' || row.estado === 'Pago Incompleto') ? 'pointer' : 'default',
                                pointerEvents: (row.estado === 'Pendiente' || row.estado === 'Pago Incompleto') ? 'auto' : 'none',
                                display: (row.estado === 'Pendiente' || row.estado === 'Pago Incompleto') ? 'block' : 'none'
                              }}
                            />
                          )}

                          {onView && (
                            <FaEye
                              size={18}
                              className="action-icon"
                              onClick={() => onView(row)}
                              title="Ver detalles"
                            />
                          )}

                          {onEdit && moduleType !== 'ventas' && moduleType !== 'compras' && (
                            <FaEdit
                              size={18}
                              className="action-icon"
                              onClick={() => onEdit(row)}
                              title="Editar"
                            />
                          )}

                           {onAnular && (moduleType === 'ventas' || moduleType === 'compras') && (
                            <FaBan
                              size={18}
                              className="action-icon"
                              onClick={() => onAnular(row)}
                              title="Anular"
                              style={{ 
                                display: (row.estado === 'Anulada' || row.estado === 'Completada') ? 'none' : 'block'
                              }}
                            />
                          )}

                          {onDelete && moduleType !== 'ventas' && moduleType !== 'compras' && (
                            <FaTrash
                              size={18}
                              className="action-icon"
                              onClick={() => onDelete(row)}
                              title="Eliminar"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EntityTable;
