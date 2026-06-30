import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NoticeBanner from "../components/NoticeBanner";
const API_BASE = import.meta.env.VITE_API_URL || '';
import "./style_register.css";

function RegisterPage() {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateUserExists = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/users`);
      if (response.ok) {
        const users = await response.json();
        const userIdExists = users.some(u => String(u.userId).toLowerCase() === String(userId).toLowerCase());
        const emailExists = users.some(u => String(u.email).toLowerCase() === String(email).toLowerCase());
        if (userIdExists) { setError("Ese ID de usuario ya existe. Pruebe con su carnet estudiantil o inicia sesión si ya tienes cuenta."); return false; }
        if (emailExists) { setError("Ese correo ya está registrado. Usa otro correo o inicia sesión si ya tienes cuenta."); return false; }
        return true;
      }
    } catch (error) {
      console.error("Error validando usuario:", error);
      setError("No pudimos verificar tus datos en este momento. Revisa tu conexión e inténtalo de nuevo.");
      return false;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!userId.trim() || !userName.trim() || !email.trim() || !password.trim()) {
      setError("Completa todos los campos para continuar.");
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Ingresa un correo electrónico válido con formato como nombre@dominio.com.");
      setLoading(false);
      return;
    }
    const isValid = await validateUserExists();
    if (!isValid) { setLoading(false); return; }

    const newUser = { userId: userId.trim(), userName: userName.trim(), password, email: email.trim() };
    try {
      const response = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        navigate("/login");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "No pudimos crear tu cuenta en este momento. Intenta nuevamente en unos minutos.");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      setError("No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2 className="login-title">Registrar usuario</h2>
        {error && <NoticeBanner type="error" title="No se pudo completar el registro" message={error} onClose={() => setError("")} />}
        <form onSubmit={handleRegister}>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} className="login-input" placeholder="Carnet estudiantil" required disabled={loading} />
          <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="login-input" placeholder="Nombre de usuario" required disabled={loading} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="login-input" placeholder="Email" required disabled={loading} />
          <div style={{ position: 'relative' }}>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="login-input" placeholder="Contraseña" required disabled={loading} style={{ paddingRight: '45px' }} />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',cursor:'pointer',color:'#666',fontSize:'14px'}}>
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
          <button type="submit" className="login-button" disabled={loading}>{loading ? 'Registrando...' : 'Registrar'}</button>
        </form>
        <p className="login-options" style={{ justifyContent: "center" }}>
          ¿Ya tienes cuenta?{" "}<a href="/login"> Ingresa aquí</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;