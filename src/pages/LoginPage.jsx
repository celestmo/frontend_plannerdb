import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NoticeBanner from "../components/NoticeBanner";
const API_BASE = import.meta.env.VITE_API_URL || '';
import "./style_login.css";

function LoginPage() {
  const { login } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setNotice(null);
    if (!userId || !password) {
      setNotice({ type: 'error', title: 'Faltan datos', message: 'Ingresa tu ID de usuario y contraseña para continuar.' });
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
      });
      if (!res.ok) {
        setNotice({ type: 'error', title: 'Credenciales incorrectas', message: 'Revisa tu ID y contraseña. Si todavía no tienes cuenta, regístrate primero.' });
        return;
      }
      const userData = await res.json();
      login(userData, { showWelcome: true });
      navigate('/');
    } catch (err) {
      console.error('Login error', err);
      setNotice({ type: 'error', title: 'No se pudo iniciar sesión', message: 'Verifica tu conexión a internet o intenta nuevamente en unos minutos.' });
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2 className="login-title">Iniciar sesión</h2>
        {notice && <NoticeBanner {...notice} onClose={() => setNotice(null)} />}
        <form onSubmit={handleLogin}>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} className="login-input" placeholder="Digite su id" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="login-input" placeholder="Digite su contraseña" required />
          <button type="submit" className="login-button">Ingresar</button>
        </form>
        <p className="login-register">
          ¿No tienes cuenta?{" "}
          <a href="/register"> Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;