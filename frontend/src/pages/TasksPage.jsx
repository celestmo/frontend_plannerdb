import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';

function TasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter(t => String(t.userId) === String(user?.userId));
          if (mounted) setTasks(filtered);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };
    fetchTasks();

    const onUpdate = () => fetchTasks();
    window.addEventListener('tasksUpdated', onUpdate);
    return () => { mounted = false; window.removeEventListener('tasksUpdated', onUpdate); };
  }, [user]);

  const handleDelete = async (task) => {
    const answer = prompt(`Deseas eliminar la tarea "${task.taskName}"? Escribe tu userId para confirmar:`);
    if (answer === null) return; // cancelled
    if (String(task.userId) !== String(answer).trim()) {
      alert('UserId incorrecto. Eliminación cancelada.');
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${task.resourceId}`, { method: 'DELETE' });
      if (res.ok) {
        // remove locally
        setTasks(prev => prev.filter(t => t.taskId !== task.taskId));
        try { window.dispatchEvent(new CustomEvent('tasksUpdated')); } catch (err) {}
      } else {
        alert('Error eliminando la tarea');
      }
    } catch (err) {
      console.error('Error deleting task', err);
      alert('No se pudo conectar con el servidor');
    }
  };

  const handleEdit = (task) => {
    navigate(`/update/${task.resourceId}`);
  };

  return (
    <section className="page-section">
      <div className="inner-page">

        <div className="page-header">
          <div>
            <h2 className="page-title">Mis Tareas</h2>
            <p className="page-sub">Lista de tareas sincronizada con el servidor</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate("/crear-tarea")}
          >
            <i className="ti ti-plus"></i> Nueva tarea
          </button>
        </div>

        <div className="task-list">
          {tasks.length === 0 && <p>No hay tareas.</p>}
          {tasks.map((t) => {
            const priorityClass = t.priority === 'Alta'
              ? 'high'
              : t.priority === 'Baja'
              ? 'low'
              : t.priority === 'Examen' || t.priority === 'Examen / Quiz'
              ? 'exam'
              : t.priority === 'Proyecto'
              ? 'project'
              : 'mid';
            return (
              <div key={t.taskId} className={`task-card border-${priorityClass}`}>
                  <div className="task-check" style={{cursor:'pointer'}} onClick={() => setExpanded(prev => prev === t.resourceId ? null : t.resourceId)}></div>
                <div className="task-body">
                  <p className="task-name">{t.taskName}</p>
                  <div className="task-tags">
                    <span className="tag tag-course">{t.course?.courseCode}</span>
                    <span className="tag tag-date"><i className="ti ti-calendar"></i> {new Date(t.dueDate).toLocaleDateString()}</span>
                    <span className={`tag ${priorityClass}`}>{t.priority}</span>
                  </div>
                </div>
                  {expanded === t.resourceId && (
                    <div className="task-details" style={{padding:'8px 16px', background:'#fafafa', borderTop:'1px solid #eee'}}>
                      <p><strong>Detalles:</strong> {t.details || '—'}</p>
                      <p><strong>Estado:</strong> {t.state || '—'}</p>
                      <p><strong>Creado:</strong> {t.createdDate ? new Date(t.createdDate).toLocaleString() : '—'}</p>
                      <p><strong>UserId:</strong> {t.userId || '—'}</p>
                      <p style={{fontSize:12,color:'#666'}}><strong>ResourceId:</strong> {t.resourceId}</p>
                    </div>
                  )}
                <div className="task-end">
                  <button className="icon-btn" onClick={() => handleEdit(t)}><i className="ti ti-edit"></i></button>
                  <button className="icon-btn danger" onClick={() => handleDelete(t)}><i className="ti ti-trash"></i></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}

export default TasksPage;
