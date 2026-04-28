/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useState } from 'react';

const CustomColorSelect = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const selectedColorObj = options.find(o => o.name === value);

  return (
    <div className="color-select-container">
      <div 
        onClick={() => setOpen(!open)}
        className="color-select-btn"
      >
        <span className="color-select-label">{value || "Seleccionar"}</span>
        {selectedColorObj && (
          <div className="color-select-circle" style={{ color: selectedColorObj.hex }} />
        )}
        <span className="color-select-arrow">▼</span>
      </div>

      {open && <div className="color-select-overlay" onClick={() => setOpen(false)} />}
      
      {open && (
        <div className="color-select-dropdown">
          {options.map(c => (
            <div 
              key={c.name} 
              onClick={() => { onChange(c.name); setOpen(false); }} 
              className="color-select-option"
            >
              <span className="color-select-option-name" style={{ color: c.hex, fontWeight: '700' }}>{c.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomColorSelect;
