/* === RUTAS DE BACKEND === 
   Define las URLs expuestas de la API para este módulo. 
   Aplica los middlewares de protección (como la validación de tokens JWT) antes de ceder el control al Controlador. */

// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/shared/contexts';

const ProtectedRoute = ({ children, requireStaff = true }) => {
  const { user, isStaff, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#000',
        color: '#F5C81B'
      }}>
        Cargando...
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Si requiere ser Staff y no lo es, denegar
  if (requireStaff && !isStaff) {
    return <Navigate to="/access-denied" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
