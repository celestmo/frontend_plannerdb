import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import CalendarPage from './pages/CalendarPage'
import TasksPage from './pages/TasksPage'
import CoursesPage from './pages/CoursesPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TaskCreatePage from './pages/TaskCreatePage'
import UpdatePage from './pages/UpdatePage'
import ProfilePage from './pages/ProfilePage'

import { useAuth } from './context/AuthContext';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppLayout() {
  const location = useLocation();
  const hideHeader = location.pathname === "/login" || location.pathname === "/register";
  const { welcomeVisible, welcomeName } = useAuth();

  return (
    <>
      {!hideHeader && <Header />}
      {welcomeVisible && (
        <div className="welcome-toast" role="status" aria-live="polite">
          <div className="welcome-toast-icon">
            <i className="ti ti-sparkles"></i>
          </div>
          <div>
            <p className="welcome-toast-title">¡Bienvenido!</p>
            <p className="welcome-toast-name">{welcomeName || 'usuario'}</p>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><TasksPage /></PrivateRoute>} />
        <Route path="/courses" element={<PrivateRoute><CoursesPage /></PrivateRoute>} />
        <Route path="/crear-tarea" element={<PrivateRoute><TaskCreatePage /></PrivateRoute>} />
        <Route path="/update/:resourceId" element={<PrivateRoute><UpdatePage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      </Routes>
      {!hideHeader && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
