import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      const response = await fetch("/api/users");
      if (response.ok) {
        const users = await response.json();
        
        const userIdExists = users.some(u => String(u.userId).toLowerCase() === String(userId).toLowerCase());
        const emailExists = users.some(u => String(u.email).toLowerCase() === String(email).toLowerCase());
        
        if (userIdExists) {
          setError("El ID de usuario ya está registrado en el sistema");
          return false;
        }
        
        if (emailExists) {
          setError("El correo electrónico ya está registrado en el sistema");
          return false;
        }
        
        return true;
      }
    } catch (error) {
      console.error("Error validando usuario:", error);
      setError("No se pudo validar los datos con el servidor");
      return false;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validación de campos
    if (!userId.trim() || !userName.trim() || !email.trim() || !password.trim()) {
      setError("Todos los campos son requeridos");
      setLoading(false);
      return;
    }

    // Validación de email 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      setLoading(false);
      return;
    }

    // Validar que el usuario no exista
    const isValid = await validateUserExists();
    if (!isValid) {
      setLoading(false);
      return;
    }

    const newUser = { userId: userId.trim(), userName: userName.trim(), password, email: email.trim() };

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        alert("Usuario registrado con éxito");
        navigate("/login");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Error al registrar usuario");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2 className="login-title">Registrar usuario</h2>

        {error && (
          <div style={{
            background: '#ffe6e6',
            border: '1px solid #ff6b6b',
            color: '#c92a2a',
            padding: '12px 15px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="login-input"
            placeholder="User ID"
            required
            disabled={loading}
          />

          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="login-input"
            placeholder="Username"
            required
            disabled={loading}
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            placeholder="Email"
            required
            disabled={loading}
          />

          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="Password"
              required
              disabled={loading}
              style={{ paddingRight: '45px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#666',
                fontSize: '14px'
              }}
            >
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>

        <p className="login-options" style={{ justifyContent: "center" }}>
          ¿Ya tienes cuenta?{" "}
          <a href="/login"> Ingresa aquí</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
