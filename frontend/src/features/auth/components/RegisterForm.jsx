/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import '../styles/AuthForms.css';

const RegisterForm = ({ 
  registerData, 
  setRegisterData, 
  handleRegister, 
  showRegPass, 
  setShowRegPass, 
  loading 
}) => {
  return (
    <form onSubmit={handleRegister} className="form-logic-gate">
      <div className="form-inline-row">
        <div className="input-field-group width-30">
          <label>Tipo</label>
          <select 
            value={registerData.documentType} 
            onChange={(e) => setRegisterData({...registerData, documentType: e.target.value})}
          >
            <option>C.C</option>
            <option>C.E</option>
          </select>
        </div>
        <div className="input-field-group width-70">
          <label>Documento</label>
          <input 
            type="text" 
            placeholder="1000..." 
            required 
            value={registerData.documentNumber} 
            onChange={(e) => setRegisterData({...registerData, documentNumber: e.target.value})} 
          />
        </div>
      </div>
      <div className="input-field-group">
        <label>Nombre y Apellidos</label>
        <input 
          type="text" 
          placeholder="Juan Valdéz" 
          required 
          value={registerData.name} 
          onChange={(e) => setRegisterData({...registerData, name: e.target.value})} 
        />
      </div>
      <div className="input-field-group">
        <label>Correo Electrónico</label>
        <input 
          type="email" 
          placeholder="tu@email.com" 
          required 
          value={registerData.email} 
          onChange={(e) => setRegisterData({...registerData, email: e.target.value})} 
        />
      </div>
      <div className="input-field-group">
        <label>Contraseña</label>
        <div className="input-decorated">
          <input 
            type={showRegPass ? "text" : "password"} 
            placeholder="••••••••" 
            required 
            value={registerData.password} 
            onChange={(e) => setRegisterData({...registerData, password: e.target.value})} 
          />
          <button type="button" className="eye-action-btn" onClick={() => setShowRegPass(!showRegPass)}>
            {showRegPass ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>
      <div className="input-field-group">
        <label>Confirmación</label>
        <input 
          type="password" 
          placeholder="••••••••" 
          required 
          value={registerData.confirmPassword} 
          onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})} 
        />
      </div>
      <button type="submit" className="button-main-auth" disabled={loading}>
        {loading ? "Procesando..." : "Registrarme Ahora"}
      </button>
    </form>
  );
};

export default RegisterForm;
