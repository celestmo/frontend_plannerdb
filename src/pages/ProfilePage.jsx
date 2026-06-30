import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NoticeBanner from '../components/NoticeBanner';
const API_BASE = import.meta.env.VITE_API_URL || '';
import './style_profile.css';

const avatarOptions = [
  'https://api.dicebear.com/6.x/thumbs/svg?seed=Slack1',
  'https://api.dicebear.com/6.x/thumbs/svg?seed=Slack2',
  'https://api.dicebear.com/6.x/thumbs/svg?seed=Slack3',
  'https://api.dicebear.com/6.x/thumbs/svg?seed=Slack4',
  'https://api.dicebear.com/6.x/thumbs/svg?seed=Slack5',
  'https://api.dicebear.com/6.x/thumbs/svg?seed=Slack6',
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ fullName: '', email: '', avatarUrl: '' });
  const [notice, setNotice] = useState(null);

  const storedUserData = (() => {
    const raw = localStorage.getItem('userData');
    return raw ? JSON.parse(raw) : null;
  })();

  useEffect(() => {
    const userId = user?.userId || storedUserData?.userId;
    if (!userId) { navigate('/login'); return; }
    if (user) setData({ fullName: user.userName || '', email: user.email || '', avatarUrl: user.avatarUrl || '' });
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/by-userid/${userId}`);
        if (res.ok) {
          const d = await res.json();
          setData({ fullName: d.userName || '', email: d.email || '', avatarUrl: d.avatarUrl || '' });
          if (!user) {
            login({ userId: d.userId, userName: d.userName, email: d.email, avatarUrl: d.avatarUrl, resourceId_User: d.resourceIdUser, password: storedUserData?.password || '' });
          }
        } else {
          setNotice({ type: 'error', title: 'No se pudo cargar el perfil', message: 'Intenta recargar la página. Si el problema continúa, vuelve a iniciar sesión.' });
        }
      } catch (err) {
        console.error('Error loading profile', err);
        setNotice({ type: 'error', title: 'Problema de conexión', message: 'No fue posible cargar tu perfil. Revisa tu conexión e inténtalo de nuevo.' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleSave = async (e) => {
    e.preventDefault();
    const userData = storedUserData || user;
    const userId = userData?.userId;
    const resourceId = userData?.resourceId_User || user?.resourceId_User;
    const answer = prompt('Para confirmar los cambios escribe tu userId:');
    if (answer === null) return;
    if (String(answer).trim() !== String(userId)) { setNotice({ type: 'error', title: 'Confirmación inválida', message: 'Escribe correctamente tu UserId para guardar los cambios.' }); return; }
    if (!resourceId) { setNotice({ type: 'error', title: 'Sesión incompleta', message: 'No se encontró tu perfil para actualizar. Inicia sesión nuevamente.' }); return; }
    try {
      const payload = { userId, userName: data.fullName, email: data.email, password: userData?.password || '', avatarUrl: data.avatarUrl };
      const res = await fetch(`${API_BASE}/api/users/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        login({ userId: updated.userId, userName: updated.userName, email: updated.email, avatarUrl: updated.avatarUrl, resourceId_User: userData?.resourceId_User || user?.resourceId_User, password: payload.password });
        setNotice({ type: 'success', title: 'Cambios guardados', message: 'Tu información se actualizó correctamente.' });
      } else {
        setNotice({ type: 'error', title: 'No se pudieron guardar los cambios', message: 'El servidor rechazó la actualización. Revisa tus datos e intenta de nuevo.' });
      }
    } catch (err) {
      console.error('Error updating profile', err);
      setNotice({ type: 'error', title: 'Problema de conexión', message: 'No se pudo guardar tu información. Verifica tu conexión y vuelve a intentarlo.' });
    }
  };

  if (loading) return <div className="page-section"><div className="inner-page">Cargando perfil...</div></div>;

  const initials = (data.fullName || 'Usuario').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();
  const displayUserId = storedUserData?.userId || user?.userId || '—';

  return (
    <section className="page-section profile-page">
      <div className="inner-page">
        <div className="page-header">
          <h2 className="page-title">Mi perfil</h2>
          <p className="page-sub">Elige un avatar y actualiza tus datos personales.</p>
        </div>
        {notice && <NoticeBanner {...notice} onClose={() => setNotice(null)} />}
        <div className="profile-card">
          <div className="profile-left">
            <div className="profile-avatar preview">
              {data.avatarUrl ? <img src={data.avatarUrl} alt="Avatar" /> : initials}
            </div>
            <div className="profile-meta">
              <h3 className="profile-name">{data.fullName || 'Sin nombre'}</h3>
              <div className="profile-id">UserId: <span className="muted">{displayUserId}</span></div>
              <div className="profile-email">{data.email || 'Sin email'}</div>
            </div>
            <div className="avatar-picker">
              <p className="section-label">Selecciona tu avatar</p>
              <div className="avatar-grid">
                {avatarOptions.map((url) => (
                  <button key={url} type="button" className={`avatar-option ${data.avatarUrl === url ? 'selected' : ''}`} onClick={() => setData(prev => ({ ...prev, avatarUrl: url }))}>
                    <img src={url} alt="Avatar option" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="profile-right">
            <form onSubmit={handleSave} className="profile-form">
              <label>Nombre completo</label>
              <input className="task-input" value={data.fullName} onChange={e => setData({ ...data, fullName: e.target.value })} required />
              <label>Email</label>
              <input className="task-input" type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} required />
              <div className="profile-actions">
                <button className="btn btn-primary" type="submit">Guardar cambios</button>
                <button type="button" className="btn" onClick={handleLogout}>Salir</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}