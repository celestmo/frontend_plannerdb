import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("userData");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
    if (userData?.userId) {
      localStorage.setItem("userId", userData.userId);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
