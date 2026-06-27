import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import API_BASE from "../config";
import "./style_taskCreate.css";

function UpdatePage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const resolveTaskState = (task) => {
    if (task?.done) return 'Completed';
    if (task?.state === 'In Progress' || task?.state === 'En progreso') return 'In Progress';
    return 'Pending';
  };

  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState("Media");
  const [state, setState] = useState("Pending");
  const [courseCode, setCourseCode] = useState("");
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tasks`);
        if (!res.ok) return;
        const list = await res.json();
        const t = list.find(x => x.resourceId === resourceId);
        if (!t) return;
        setTaskName(t.taskName || '');
        setDueDate(t.dueDate ? t.dueDate.slice(0,10) : '');
        setDetails(t.details || '');
        setPriority(t.priority || 'Media');
        setState(resolveTaskState(t));
        setCourseCode(t.courseCode || t.course?.courseCode || '');
      } catch (err) {
        console.error('Error loading task', err);
      }
    };
    load();
  }, [resourceId]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/courses`);
        if (!res.ok) return;
        const list = await res.json();
        setCourses(list || []);
      } catch (err) {
        console.error('Error loading courses', err);
      }
    };
    loadCourses();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!taskName || !dueDate || !courseCode) {
      alert('Completa todos los campos requeridos');
      return;
    }
    const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
    const updated = {
      taskName,
      createdDate: new Date().toISOString(),
      dueDate: dueDate + 'T00:00:00',
      done: state === 'Completed',
      details: details.trim(),
      state,
      priority,
      courseCode,
      userId: user?.userId || userData?.userId || ''
    };
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        alert('Tarea actualizada con éxito');
        try { window.dispatchEvent(new CustomEvent('tasksUpdated')); } catch (err) {}
        navigate('/tasks');
      } else {
        alert('Error al actualizar la tarea');
      }
    } catch (err) {
      console.error('Error updating task', err);
      alert('No se pudo conectar con el servidor');
    }
  };

  const handleDelete = async () => {
    const answer = prompt('¿Eliminar esta tarea? Escribe tu userId para confirmar:');
    if (answer === null) return;
    const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
    const userId = userData?.userId || localStorage.getItem('userId');
    if (String(answer).trim() !== String(userId)) {
      alert('UserId no coincide. Eliminación cancelada.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${resourceId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Tarea eliminada con éxito');
        try { window.dispatchEvent(new CustomEvent('tasksUpdated')); } catch (err) {}
        navigate('/tasks');
      } else {
        alert('Error al eliminar la tarea');
      }
    } catch (err) {
      console.error('Error deleting', err);
      alert('No se pudo conectar con el servidor');
    }
  };

  return (
    <div className="task-page">
      <div className="task-box">
        <h2 className="task-title">Actualizar tarea</h2>
        <form onSubmit={handleUpdate}>
          <input type="text" value={taskName} onChange={e=>setTaskName(e.target.value)} className="task-input" placeholder="Nombre de la tarea" required />
          <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="task-input" required />
          <textarea value={details} onChange={e=>setDetails(e.target.value)} className="task-input" placeholder="Detalles" />
          <select value={priority} onChange={e=>setPriority(e.target.value)} className="task-input">
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
            <option value="Examen / Quiz">Examen / Quiz</option>
            <option value="Proyecto">Proyecto</option>
          </select>
          <select value={state} onChange={e=>setState(e.target.value)} className="task-input">
            <option value="Pending">Pendiente</option>
            <option value="In Progress">En progreso</option>
            <option value="Completed">Completada</option>
          </select>
          <select value={courseCode} onChange={e=>setCourseCode(e.target.value)} className="task-input" required>
            <option value="">Selecciona un curso</option>
            {courses.map(c => (
              <option key={c.courseCode} value={c.courseCode}>
                {c.courseCode}{c.courseName ? ` - ${c.courseName}` : ''}
              </option>
            ))}
          </select>
          <div style={{display:'flex', gap:8}}>
            <button type="submit" className="task-button">ACTUALIZAR</button>
            <button type="button" onClick={handleDelete} className="task-button" style={{background:'#ff6b6b'}}>ELIMINAR</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdatePage;