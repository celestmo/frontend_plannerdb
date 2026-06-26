import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css'

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

  const storedUserData = (() => {
    const raw = localStorage.getItem('userData');
    return raw ? JSON.parse(raw) : null;
  })();

  useEffect(() => {
    const userId = user?.userId || storedUserData?.userId;
    if (!userId) {
      navigate('/login');
      return;
    }

    if (user) {
      setData({
        fullName: user.userName || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || ''
      });
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/users/by-userid/${userId}`);
        if (res.ok) {
          const d = await res.json();
          setData({
            fullName: d.userName || '',
            email: d.email || '',
            avatarUrl: d.avatarUrl || ''
          });
          if (!user) {
            login({
              userId: d.userId,
              userName: d.userName,
              email: d.email,
              avatarUrl: d.avatarUrl,
              resourceId_User: d.resourceIdUser,
              password: storedUserData?.password || ''
            });
          }
        }
      } catch (err) {
        console.error('Error loading profile', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const userData = storedUserData || user;
    const userId = userData?.userId;
    const resourceId = userData?.resourceId_User || user?.resourceId_User;
    const answer = prompt('Para confirmar los cambios escribe tu userId:');
    if (answer === null) return;
    if (String(answer).trim() !== String(userId)) {
      alert('UserId no coincide. Cambios cancelados.');
      return;
    }
    if (!resourceId) {
      alert('No se encontró el perfil para actualizar. Vuelve a iniciar sesión.');
      return;
    }
    try {
      const payload = {
        userId,
        userName: data.fullName,
        email: data.email,
        password: userData?.password || '',
        avatarUrl: data.avatarUrl
      };
      const res = await fetch(`/api/users/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        const updatedUser = {
          userId: updated.userId,
          userName: updated.userName,
          email: updated.email,
          avatarUrl: updated.avatarUrl,
          resourceId_User: userData?.resourceId_User || user?.resourceId_User,
          password: payload.password
        };
        login(updatedUser);
        alert('Datos actualizados');
      } else {
        alert('Error al actualizar datos');
      }
    } catch (err) {
      console.error('Error updating profile', err);
      alert('No se pudo conectar con el servidor');
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
                  <button
                    key={url}
                    type="button"
                    className={`avatar-option ${data.avatarUrl === url ? 'selected' : ''}`}
                    onClick={() => setData(prev => ({ ...prev, avatarUrl: url }))}
                  >
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

              <label>URL del avatar</label>
              <input className="task-input" type="url" value={data.avatarUrl} onChange={e => setData({ ...data, avatarUrl: e.target.value })} placeholder="Pega una URL de avatar" />

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
