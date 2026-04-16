import React from 'react';

export const ToggleSwitch = ({ value, onChange }) => {
  return (
    <div 
      onClick={() => onChange(!value)}
      className={`toggle-switch-container ${value ? 'active' : 'inactive'}`}
    >
      <div className="toggle-switch-thumb" />
    </div>
  );
};
