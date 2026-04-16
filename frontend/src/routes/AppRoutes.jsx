import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../features/shared/contexts";
import { STORE_ROUTES, ADMIN_ROUTES } from "./config";
import { AdminLayout, AccessDenied } from "../features/shared/services";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'transparent' }} />}>
      <Routes>
      {/* 🏠 RUTAS DE LA TIENDA */}
      {STORE_ROUTES.map((route) => {
        const sensitivePaths = ['/perfil', '/carrito', '/mis-pedidos'];
        const isSensitive = sensitivePaths.includes(route.path);
        
        return (
          <Route 
            key={route.path} 
            path={route.path} 
            element={
              isSensitive ? (
                <ProtectedRoute requireStaff={false}>
                  {route.element}
                </ProtectedRoute>
              ) : route.element
            } 
          />
        );
      })}

      {/* 🔐 RUTAS DE ADMINISTRACIÓN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {ADMIN_ROUTES.map((route, index) => {
          const props = route.index ? { index: true } : { path: route.path };
          return (
            <Route
              key={route.path || "index"}
              {...props}
              element={typeof route.element === 'function' ? route.element(user) : route.element}
            />
          );
        })}
      </Route>

      {/* ❌ RUTAS DE ERROR / FALLBACK */}
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
