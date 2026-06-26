import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style_register.css"; 

function RegisterPage() {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const newUser = { userId, userName, password, email };

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
        alert("Error al registrar usuario");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      alert("No se pudo conectar con el servidor");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2 className="login-title">Registrar usuario</h2>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="login-input"
            placeholder="User ID"
            required
          />

          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="login-input"
            placeholder="Username"
            required
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            placeholder="Email"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            placeholder="Password"
            required
          />

          <button type="submit" className="login-button">Registrar</button>
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
