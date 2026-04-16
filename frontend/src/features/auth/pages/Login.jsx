// src/features/auth/pages/Login.jsx
import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import { useAuth } from "../../shared/contexts";
import SessionConflictModal from "../../shared/components/SessionConflictModal";
import api, { API_BASE_URL } from "../../shared/services/api";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ─── Estados ─────────────────────────────────────
  const [activeTab, setActiveTab] = useState("login");
  const [view, setView] = useState("auth");
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false); // 🔐 Estado para el modal

  // ─── Datos de Login ──────────────────────────────
  const [loginData, setLoginData] = useState({
    correo: "",
    clave: ""
  });

  // ─── Datos de Registro ───────────────────────────
  const [registerData, setRegisterData] = useState({
    documentType: "Cédula de Ciudadanía",
    documentNumber: "",
    fullName: "",
    correo: "",
    clave: "",
    confirmarClave: ""
  });

  // ─── Visibilidad de contraseñas ──────────────────
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState(false);

  // ─── Recuperación de cuenta ──────────────────────
  const [recoverEmail, setRecoverEmail] = useState("");

  // ─── Helpers ─────────────────────────────────────
  const resetMessages = () => {
    setError("");
    setInfoMsg("");
  };

  // ─── Estilos ─────────────────────────────────────
  const styles = useMemo(() => ({
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
    heroSection: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      zIndex: 2,
      padding: "40px",
      animation: "fadeIn 1s ease"
    },
    logoImg: {
      width: "240px",
      height: "auto",
      marginBottom: "15px",
      filter: "drop-shadow(0 4px 15px rgba(0,0,0,0.6))"
    },
    bannerTitle: {
      fontSize: "26px",
      fontWeight: "800",
      color: "#FFC107",
      letterSpacing: "1px",
      margin: "0",
      textShadow: "0 2px 10px rgba(0,0,0,0.8)"
    },
    bannerSubtitle: {
      fontSize: "17px",
      color: "#fff",
      maxWidth: "360px",
      marginTop: "15px",
      lineHeight: "1.4",
      textShadow: "0 2px 8px rgba(0,0,0,0.8)"
    },
    formWrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
      paddingRight: "40px",
      position: "relative"
    },
    backLink: {
      position: "absolute",
      top: "30px",
      left: "40px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#FFC107",
      textDecoration: "none",
      fontSize: "15px",
      opacity: 0.9,
      transition: "0.2s",
      zIndex: 10
    },
    formCard: {
      width: "100%",
      maxWidth: "400px",
      backgroundColor: "rgba(15,17,21,0.96)",
      padding: "25px 35px",
      borderRadius: "14px",
      border: "1px solid rgba(255,193,7,0.15)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
      animation: "slideInRight 0.8s ease"
    },
    tabWrapper: {
      display: "flex",
      backgroundColor: "#1e222a",
      padding: "4px",
      borderRadius: "14px",
      marginBottom: "20px",
      gap: "4px"
    },
    tabBtn: (active) => ({
      flex: 1,
      padding: "8px",
      borderRadius: "10px",
      border: "none",
      fontSize: "13px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "0.3s",
      backgroundColor: active ? "#FFC107" : "transparent",
      color: active ? "#000" : "#fff"
    }),
    formTitle: { fontSize: "28px", fontWeight: "800", marginBottom: "5px" },
    formSubtitle: { fontSize: "14px", color: "#888", marginBottom: "25px" },
    label: {
      display: "block",
      fontSize: "12px",
      color: "#aaa",
      marginBottom: "7px",
      letterSpacing: "0.5px"
    },
    input: {
      width: "100%",
      padding: "8px 12px",
      borderRadius: "8px",
      backgroundColor: "#171a21",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
      marginBottom: "16px",
      boxSizing: "border-box"
    },
    inputWrap: { position: "relative", width: "100%" },
    eyeBtn: {
      position: "absolute",
      right: "14px",
      top: "44%",
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
      marginTop: "10px",
      transition: "0.3s"
    },
    error: {
      color: "#ff6b6b",
      fontSize: "12px",
      marginBottom: "15px",
      marginTop: "5px",
      textAlign: "center"
    },
    info: {
      color: "#FFC107",
      fontSize: "12px",
      marginBottom: "15px",
      marginTop: "5px",
      textAlign: "center"
    }
  }), []);

  // ═══════════════════════════════════════════════
  // 🔐 HANDLER: LOGIN
  // ═══════════════════════════════════════════════
  const handleLogin = async (e, isForced = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting && !isForced) return;
    resetMessages();
    setIsSubmitting(true);

    const useForce = isForced || loginData.force || false;

    console.log(`🔵 Intentando Login ${useForce ? '[FORZADO]' : ''}:`, loginData.correo);

    if (!loginData.correo?.trim() || !loginData.clave?.trim()) {
      setError("Por favor completa correo y contraseña.");
      setIsSubmitting(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await api.post("/api/auth/login", {
        correo: loginData.correo.trim().toLowerCase(),
        clave: loginData.clave.trim(),
        force: useForce
      }, { signal: controller.signal });

      clearTimeout(timeoutId);

      const result = response.data;
      if (result.success === true && result.data?.usuario) {
        const token = result.data.token || result.data.Token;
        const { usuario } = result.data;

        const userData = {
          id: usuario.id,
          IdUsuario: usuario.id,
          IdCliente: usuario.IdCliente,
          nombre: usuario.nombre,
          Correo: usuario.email,
          IdRol: usuario.idRol,
          Rol: usuario.rol || usuario.rolData?.nombre || 'Cliente',
          rol: usuario.rol || usuario.rolData?.nombre || 'Cliente',
          Estado: usuario.estado,
          avatarUrl: usuario.avatarUrl,
          sessionId: usuario.sessionId,
          permisos: usuario.permisos || [],
          mustChangePassword: usuario.mustChangePassword === true || usuario.MustChangePassword === true,
          token: token,
          userType: (
            usuario.rolData?.nombre === "Administrador" ||
            usuario.idRol === 1 ||
            (usuario.rolData?.nombre?.toLowerCase() !== "cliente" && usuario.rolData?.nombre !== undefined)
          ) ? "admin" : "cliente"
        };

        login(userData);

        const from = location.state?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else if (userData.userType === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (err) {
      clearTimeout(timeoutId);
      
      // 🔐 MANEJO DE CONFLICTO DE SESIÓN (409)
      if (err.response?.status === 409 && err.response.data?.needsForce) {
        setIsSubmitting(false); 
        setShowConflictModal(true); // 🔐 Mostrar el modal personalizado en lugar de SweetAlert
        return;
      }

      console.error("🔴 Error de conexión: ", err);
      if (err.name === 'AbortError') {
        setError("La petición tardó demasiado. Verifica tu conexión.");
      } else if (err.response) {
        setError(err.response.data?.message || "Credenciales incorrectas");
      } else {
        setError("Error al iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════
  // 📝 HANDLER: REGISTRO
  // ═══════════════════════════════════════════════
  const handleRegister = async (e) => {
    e.preventDefault();
    resetMessages();
    const requiredFields = [
      { field: registerData.documentNumber, msg: "Número de documento" },
      { field: registerData.fullName, msg: "Nombre completo" },
      { field: registerData.correo, msg: "Correo" },
      { field: registerData.clave, msg: "Contraseña" }
    ];

    for (const { field, msg } of requiredFields) {
      if (!field?.trim()) {
        setError(`Falta el campo: ${msg}`);
        return;
      }
    }

    if (registerData.clave.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(registerData.clave)) {
      setError("La contraseña debe tener al menos un carácter especial (!@#...).");
      return;
    }

    if (registerData.clave !== registerData.confirmarClave) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: registerData.fullName.trim(),
          correo: registerData.correo.trim().toLowerCase(),
          clave: registerData.clave.trim(),
          esCliente: true,
          datosCliente: {
            document_type: registerData.documentType,
            document_number: registerData.documentNumber
          }
        })
      });

      const result = await response.json();

      if (result.success === true) {
        setInfoMsg("¡Cuenta creada! Ya puedes iniciar sesión.");
        setActiveTab("login");
      } else {
        setError(result.message || "No se pudo crear la cuenta");
      }

    } catch {
      setError("Error de conexión al registrar.");
    }
  };

  // ═══════════════════════════════════════════════
  // 🔁 HANDLER: RECUPERAR CONTRASEÑA
  // ═══════════════════════════════════════════════
  const handleRecover = async () => {
    resetMessages();
    if (!recoverEmail?.trim()) {
      setError("Por favor, ingresa tu correo electrónico.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoverEmail)) {
      setError("Por favor ingresa un correo con formato válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/api/auth/forgot-password", {
        email: recoverEmail.trim().toLowerCase()
      });

      if (response.data.success) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          width: '350px',
          title: '<span style="font-size:15px">¡Correo enviado!</span>',
          html: `<span style="font-size:13px">Hemos enviado instrucciones a <b>${recoverEmail}</b>. Revisa tu bandeja de entrada o spam.</span>`,
          icon: 'success',
          background: "#111418",
          color: "#fff",
          showConfirmButton: false,
          timer: 6000,
          customClass: { popup: 'gm-swal-popup' }
        });
        setRecoverEmail("");
        setView("auth");
      } else {
        setError(response.data.message || "No se pudo enviar el correo de recuperación");
      }
    } catch (err) {
      console.error("🔴 Error en recuperación:", err);
      setError(err.response?.data?.message || "No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════
  return (
    <div style={styles.container} className="login-container-root">
      <div style={styles.overlay} />
      <Link
        to="/"
        style={styles.backLink}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "0.9"}
      >
        <FaArrowLeft size={15} color="#FFC107" /> Volver a la tienda
      </Link>

      <div style={styles.heroSection} className="login-hero-section">
        <img src="/logo.png" alt="GM Caps" style={styles.logoImg} />
        <h1 style={styles.bannerTitle}>Gorras Medellín Caps</h1>
        <p style={styles.bannerSubtitle}>
          Exclusividad y estilo en cada prenda. Únete a la comunidad de gorras más grande de la ciudad.
        </p>
      </div>

      <div style={styles.formWrapper} className="login-form-wrapper">
        <div style={styles.formCard} className="login-form-card">

          {view === "auth" && (
            <>
              <h2 style={styles.formTitle}>
                {activeTab === "login" ? "¡Hola de nuevo!" : "Crear cuenta"}
              </h2>
              <p style={styles.formSubtitle}>
                {activeTab === "login"
                  ? "Ingresa para continuar comprando"
                  : "Empieza tu colección de nivel ahora"}
              </p>

              <div style={styles.tabWrapper}>
                <button
                  style={styles.tabBtn(activeTab === "login")}
                  onClick={() => { setActiveTab("login"); resetMessages(); }}
                >
                  Login
                </button>
                <button
                  style={styles.tabBtn(activeTab === "register")}
                  onClick={() => { setActiveTab("register"); resetMessages(); }}
                >
                  Registro
                </button>
              </div>

              {activeTab === "login" ? (
                <form onSubmit={handleLogin} noValidate onChange={resetMessages}>
                  <label style={styles.label}>Correo electrónico</label>
                  <input
                    style={styles.input}
                    type="email"
                    placeholder="ejemplo@correo.com"
                    required
                    value={loginData.correo}
                    onChange={(e) => setLoginData({ ...loginData, correo: e.target.value })}
                  />

                  <label style={styles.label}>Contraseña</label>
                  <div style={styles.inputWrap}>
                    <input
                      style={styles.input}
                      type={showLoginPass ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={loginData.clave}
                      onChange={(e) => setLoginData({ ...loginData, clave: e.target.value })}
                    />
                    <button
                      type="button"
                      style={styles.eyeBtn}
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      aria-label={showLoginPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showLoginPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>

                  {error && <div style={styles.error}>{error}</div>}
                  {infoMsg && <div style={styles.info}>{infoMsg}</div>}

                  <button type="submit" style={styles.mainBtn} disabled={isSubmitting}>
                    {isSubmitting ? "Cargando..." : "Iniciar Sesión"}
                  </button>

                  <div style={{ textAlign: "center", marginTop: "15px" }}>
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#FFC107",
                        fontSize: "14px",
                        cursor: "pointer",
                        fontWeight: "600",
                        textDecoration: "underline"
                      }}
                      onClick={() => setView("recover")}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} noValidate onChange={resetMessages}>
                  
                  <div className="login-input-row">
                    <div style={{ flex: 1.15 }}>
                      <label style={styles.label}>Tipo de documento</label>
                      <select
                        style={styles.input}
                        value={registerData.documentType}
                        onChange={(e) => setRegisterData({ ...registerData, documentType: e.target.value })}
                      >
                        <option>Cédula de Ciudadanía</option>
                        <option>Cédula de Extranjería</option>
                        <option>Permiso Especial (PEP)</option>
                        <option>Permiso Temporal (PPT)</option>
                        <option>Pasaporte</option>
                        <option>NIT</option>
                      </select>
                    </div>
                    <div style={{ flex: 0.85 }}>
                      <label style={styles.label}>Número</label>
                      <input
                        style={styles.input}
                        type="text"
                        placeholder="1234567"
                        required
                        value={registerData.documentNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^[0-9]+$/.test(val)) {
                            setRegisterData({ ...registerData, documentNumber: val });
                          }
                        }}
                      />
                    </div>
                  </div>

                  <label style={styles.label}>Nombre completo</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Tu nombre y apellido completos"
                    required
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                  />

                  <label style={styles.label}>Correo electrónico</label>
                  <input
                    style={styles.input}
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={registerData.correo}
                    onChange={(e) => setRegisterData({ ...registerData, correo: e.target.value })}
                  />

                  <div className="login-input-row">
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Contraseña</label>
                      <div style={styles.inputWrap}>
                        <input
                          style={styles.input}
                          type={showRegPass ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          value={registerData.clave}
                          onChange={(e) => setRegisterData({ ...registerData, clave: e.target.value })}
                        />
                        <button type="button" style={styles.eyeBtn} onClick={() => setShowRegPass(!showRegPass)}>
                          {showRegPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Confirmar contraseña</label>
                      <div style={styles.inputWrap}>
                        <input
                          style={styles.input}
                          type={showRegConfirmPass ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          value={registerData.confirmarClave}
                          onChange={(e) => setRegisterData({ ...registerData, confirmarClave: e.target.value })}
                        />
                        <button type="button" style={styles.eyeBtn} onClick={() => setShowRegConfirmPass(!showRegConfirmPass)}>
                          {showRegConfirmPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && <div style={styles.error}>{error}</div>}
                  {infoMsg && <div style={styles.info}>{infoMsg}</div>}

                  <button type="submit" style={styles.mainBtn}>Crear Cuenta</button>
                </form>
              )}
            </>
          )}

          {view === "recover" && (
            <div onChange={resetMessages}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "5px" }}>
                <button
                  onClick={() => setView("auth")}
                  style={{
                    background: "rgba(255,193,7,0.1)",
                    border: "1px solid rgba(255,193,7,0.25)",
                    color: "#FFC107",
                    cursor: "pointer",
                    display: "flex",
                    padding: "8px",
                    borderRadius: "50%"
                  }}
                  aria-label="Volver"
                >
                  <FaArrowLeft size={16} />
                </button>
                <h2 style={{ ...styles.formTitle, marginBottom: 0 }}>Recuperar Cuenta</h2>
              </div>
              <p style={styles.formSubtitle}>Te enviaremos un código de seguridad</p>

              <label style={styles.label}>Tu correo</label>
              <input
                style={styles.input}
                type="email"
                placeholder="usuario@correo.com"
                value={recoverEmail}
                onChange={(e) => { setRecoverEmail(e.target.value); resetMessages(); }}
              />

              {error && <div style={styles.error}>{error}</div>}
              {infoMsg && <div style={styles.info}>{infoMsg}</div>}

              <button style={styles.mainBtn} onClick={handleRecover}>Enviar Código</button>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        
        .login-container-root {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background-size: cover;
          background-position: center;
          font-family: 'Inter', sans-serif;
          color: #fff;
          position: relative;
          overflow-x: hidden;
        }

        .gm-swal-popup {
          border: 1px solid rgba(255, 193, 7, 0.4) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
          padding: 8px !important;
        }

        .login-hero-section { flex: 0 0 45%; }
        .login-form-wrapper { flex: 0 0 55%; }
        .login-form-card { width: 100%; max-width: 400px; }
        .login-input-row { display: flex; gap: 12px; width: 100%; }

        @media (max-width: 900px) {
          .login-input-row { flex-direction: column; gap: 0; }
          .login-container-root { flex-direction: column !important; overflow-y: auto !important; }
          .login-hero-section { flex: 0 0 auto !important; padding: 60px 20px 30px 20px !important; }
          .login-form-wrapper { flex: 0 0 auto !important; padding-right: 0 !important; padding-bottom: 50px !important; }
          .login-form-card { max-width: 90% !important; padding: 20px 25px !important; }
        }
      `}</style>
      {showConflictModal && (
        <SessionConflictModal 
          title="SESIÓN YA ACTIVA"
          description="Tu cuenta ya tiene una sesión abierta en otro lugar. ¿Deseas cerrarla e ingresar aquí?"
          infoText="Al continuar, se cerrarán todas las sesiones previas en otros dispositivos."
          showUseHere={true}
          onUseHere={() => {
            setShowConflictModal(false);
            handleLogin(null, true);
          }}
          onClose={() => setShowConflictModal(false)}
        />
      )}
    </div>
  );
};

export default Login;