// src/modules/auth/hooks/useAuth.js
// ── Hook de autenticación ──
import { useState, useCallback } from "react";
import { loginUser } from "shared/services/authApi";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await loginUser(credentials);
      sessionStorage.setItem("user", JSON.stringify(data));
      if (data.token) {
        sessionStorage.setItem("token", data.token);
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || "Error al iniciar sesión";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    window.location.href = "/login";
  }, []);

  return { login, logout, loading, error };
};

export default useAuth;
