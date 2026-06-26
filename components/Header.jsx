import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user } = useAuth();
  const initials = (user?.userName || 'ES').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();
  const avatarUrl = user?.avatarUrl;

  return (
    <header className="header">
      <a href="/" className="logo">
        <div className="logo-mark"><i className="ti ti-calendar-event"></i></div>
        PlannerAcadémico
      </a>
      <nav className="nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <i className="ti ti-calendar"></i> Calendario
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <i className="ti ti-checklist"></i> Tareas
        </NavLink>
        <NavLink to="/courses" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <i className="ti ti-book-2"></i> Cursos
        </NavLink>
      </nav>
      <div className="header-right">
        <button className="btn btn-primary">
          <i className="ti ti-plus"></i> Nueva tarea
        </button>
        <NavLink to="/profile" className="avatar">
          {avatarUrl ? <img src={avatarUrl} alt="avatar" className="header-avatar-img" /> : initials}
        </NavLink>
      </div>
    </header>
  )
}

export default Header