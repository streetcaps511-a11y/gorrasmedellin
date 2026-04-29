// src/App.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import {
  SearchProvider,
  CartProvider,
} from "./features/shared/contexts";
import { Header, Footer } from "./features/shared/services";
import AppRoutes from "./routes/AppRoutes";

/**
 * ⚡ APLICACIÓN PRINCIPAL
 * Estructura limpia y organizada.
 */
const AppContent = () => {
  const location = useLocation();
  
  // Decide si mostrar el header (Tienda) o no (Admin/Login)
  const showHeader =
    !location.pathname.startsWith("/admin") &&
    location.pathname !== "/login" &&
    location.pathname !== "/reset-password";

  return (
    <div className="app-root-container">
      {showHeader && <Header />}
      <main className="app-main-content">
        <AppRoutes />
      </main>
      {showHeader && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <SearchProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </SearchProvider>
  );
}