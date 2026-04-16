import '../../styles/BlurModalOverlay.css';
// BlurModalOverlay.jsx
import React from 'react';

const BlurModalOverlay = ({ onClose, children }) => {
  return (
    <div className="blur-modal-overlay" onClick={onClose}>
      <div
        className="blur-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default BlurModalOverlay;
