import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("userData");
    return stored ? JSON.parse(stored) : null;
  });
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");

  useEffect(() => {
    if (!welcomeVisible) return;

    const timer = window.setTimeout(() => {
      setWelcomeVisible(false);
      setWelcomeName("");
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [welcomeVisible]);

  const login = (userData, options = {}) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
    if (userData?.userId) {
      localStorage.setItem("userId", userData.userId);
    }

    if (options.showWelcome && userData?.userName) {
      setWelcomeName(userData.userName);
      setWelcomeVisible(true);
    }
  };

  const logout = () => {
    setUser(null);
    setWelcomeVisible(false);
    setWelcomeName("");
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, welcomeVisible, welcomeName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
