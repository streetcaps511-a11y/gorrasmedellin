// src/features/auth/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../../shared/services/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // Estados
  const [clave, setClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirigir si no hay token
  useEffect(() => {
    if (!token) {
      Swal.fire("Error", "Enlace de recuperación inválido", "error");
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (clave.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (clave !== confirmarClave) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/api/auth/reset-password", {
        token,
        clave
      });

      if (response.data.success) {
        setIsSuccess(true);
        Swal.fire({
          icon: 'success',
          title: '¡Contraseña actualizada!',
          text: 'Ya puedes iniciar sesión con tu nueva clave.',
          confirmButtonColor: '#FFC107',
          background: "#111418",
          color: "#fff"
        }).then(() => {
          navigate("/login");
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Ocurrió un error al restablecer la contraseña.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estilos (Copiados del tema de Login para consistencia)
  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      width: "100%",
      backgroundImage: `url('https://res.cloudinary.com/dxc5qqsjd/image/upload/v1774320932/WhatsApp_Image_2026-03-23_at_9.54.36_PM_pxd6fe.jpg')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      fontFamily: "'Inter', sans-serif",
      color: "#fff",
      overflow: "hidden",
      position: "relative"
    },
    overlay: {
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.2))",
      zIndex: 1
    },
    formWrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      zIndex: 2
    },
    formCard: {
      width: "90%",
      maxWidth: "400px",
      backgroundColor: "rgba(15,17,21,0.96)",
      padding: "35px",
      borderRadius: "14px",
      border: "1px solid rgba(255,193,7,0.15)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
      textAlign: "center"
    },
    label: {
      display: "block",
      fontSize: "12px",
      color: "#aaa",
      textAlign: "left",
      marginBottom: "7px",
      marginTop: "15px"
    },
    inputWrap: { position: "relative", width: "100%" },
    input: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "8px",
      backgroundColor: "#171a21",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box"
    },
    eyeBtn: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      border: "none",
      background: "none",
      cursor: "pointer",
      color: "#666"
    },
    mainBtn: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      backgroundColor: "#FFC107",
      color: "#000",
      border: "none",
      fontSize: "14px",
      fontWeight: "800",
      cursor: "pointer",
      marginTop: "25px",
      transition: "0.3s"
    },
    error: {
      color: "#ff6b6b",
      fontSize: "13px",
      marginTop: "15px"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay} />
      
      <div style={styles.formWrapper}>
        <div style={styles.formCard}>
          <img src="/logo.png" alt="Logo" style={{ width: "120px", display: "block", margin: "0 auto 20px" }} />
          
          {!isSuccess ? (
            <>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "5px" }}>Nueva Contraseña</h2>
              <p style={{ fontSize: "14px", color: "#888", marginBottom: "20px" }}>Ingresa tu nueva clave de acceso</p>

              <form onSubmit={handleSubmit}>
                <label style={styles.label}>Contraseña Nueva</label>
                <div style={styles.inputWrap}>
                  <input
                    style={styles.input}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                  />
                  <button type="button" style={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>

                <label style={styles.label}>Confirmar Contraseña</label>
                <div style={styles.inputWrap}>
                  <input
                    style={styles.input}
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmarClave}
                    onChange={(e) => setConfirmarClave(e.target.value)}
                  />
                  <button type="button" style={styles.eyeBtn} onClick={() => setShowConfirmPass(!showConfirmPass)}>
                    {showConfirmPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>

                {error && <div style={styles.error}>{error}</div>}

                <button type="submit" style={styles.mainBtn} disabled={isSubmitting}>
                  {isSubmitting ? "Cambiando..." : "Actualizar Contraseña"}
                </button>
              </form>
            </>
          ) : (
            <div style={{ padding: "40px 0" }}>
              <FaCheckCircle size={60} color="#FFC107" style={{ marginBottom: "20px" }} />
              <h2 style={{ fontSize: "24px", fontWeight: "800" }}>¡Todo listo!</h2>
              <p style={{ color: "#888", marginTop: "10px" }}>Tu contraseña ha sido actualizada.</p>
              <Link to="/login" style={{ ...styles.mainBtn, display: "block", textDecoration: "none", lineHeight: "12px", marginTop: "30px" }}>
                Ir al Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
