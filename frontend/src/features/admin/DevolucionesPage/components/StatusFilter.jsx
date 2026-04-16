import React, { useState } from 'react';

const StatusFilter = React.memo(function StatusFilter({ filterStatus, onFilterSelect, statuses = [] }) {
  const [open, setOpen] = useState(false);
  const allOptions = ['Todos', ...statuses];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="devoluciones-status-filter-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: 'transparent',
          border: '1px solid #F5C81B',
          color: '#F5C81B',
          borderRadius: '6px',
          fontSize: '13px',
          cursor: 'pointer',
          minWidth: '120px',
          justifyContent: 'space-between',
          fontWeight: '600',
          height: '36px'
        }}
      >
        {filterStatus}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            backgroundColor: '#1F2937',
            border: '1px solid #F5C81B',
            borderRadius: '4px',
            padding: '4px 0',
            minWidth: '120px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(245, 200, 27, 0.2)'
          }}>
            {allOptions.map((status, idx) => {
              const label = typeof status === 'object' ? (status.nombre || status.Nombre || status.Estado || 'Estado') : status;
              const key = typeof status === 'object' ? (status.id || idx) : status;
              
              return (
                <button
                  key={String(key)}
                  onClick={() => { onFilterSelect(label); setOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#F5C81B',
                    fontSize: '12px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {String(label)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
});

export default StatusFilter;
