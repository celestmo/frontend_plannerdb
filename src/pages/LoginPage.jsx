import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./style_login.css";

function LoginPage() {
  const { login } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId || !password) {
      alert("Credenciales inválidas");
      return;
    }
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
      });
      if (!res.ok) {
        alert('Credenciales inválidas');
        return;
      }
      const userData = await res.json();
      login(userData);
      navigate('/');
    } catch (err) {
      console.error('Login error', err);
      alert('No se pudo conectar con el servidor');
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2 className="login-title">Iniciar sesión</h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="login-input"
            placeholder="Digite su id"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            placeholder="Digite su contraseña"
            required
          />

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
