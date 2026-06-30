import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { AVAILABLE_COURSES } from '../constants/courses';
import NoticeBanner from '../components/NoticeBanner';
const API_BASE = import.meta.env.VITE_API_URL || '';
import "./style_taskCreate.css";

function TaskCreatePage() {
  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState("Media");
  const [state, setState] = useState("Pending");
  const [courseCode, setCourseCode] = useState("");
  const [notice, setNotice] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.userId || (() => {
    const raw = localStorage.getItem('userData');
    return raw ? JSON.parse(raw).userId : null;
  })();
  const { resourceId } = useParams();
  const isEdit = Boolean(resourceId);

  useEffect(() => {
    const selectedCourse = localStorage.getItem('selectedCourseForTask');
    if (selectedCourse) {
      setCourseCode(selectedCourse);
      localStorage.removeItem('selectedCourseForTask');
    }
  }, []);

  useEffect(() => {
    const storedCourses = (() => {
      if (!userId) return [];
      try {
        const raw = localStorage.getItem(`userCourses:${userId}`);
        return raw ? JSON.parse(raw) : [];
      } catch (err) {
        console.error('Error reading user courses for task form', err);
        return [];
      }
    })();

    const mergedCourses = [
      ...storedCourses.map((course) => ({ code: String(course.courseCode).toUpperCase(), name: course.courseName || 'Curso personalizado' })),
      ...AVAILABLE_COURSES.map((course) => ({ code: course.code, name: course.name }))
    ];

    const uniqueCourses = [];
    const seen = new Set();
    mergedCourses.forEach((course) => {
      if (!seen.has(course.code)) {
        seen.add(course.code);
        uniqueCourses.push(course);
      }
    });

    setAvailableCourses(uniqueCourses);
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice(null);

    const trimmedName = taskName.trim();
    const selectedDate = dueDate ? new Date(`${dueDate}T00:00:00`) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!trimmedName) {
      setNotice({ type: 'error', title: 'Nombre requerido', message: 'El nombre de la tarea no puede estar vacío.' });
      return;
    }

    if (!dueDate) {
      setNotice({ type: 'error', title: 'Fecha requerida', message: 'Debes seleccionar una fecha para la tarea.' });
      return;
    }

    if (selectedDate < today) {
      setNotice({ type: 'error', title: 'Fecha inválida', message: 'La fecha tiene que ser futura o igual al día actual.' });
      return;
    }

    if (!courseCode) {
      setNotice({ type: 'error', title: 'Curso requerido', message: 'Selecciona un curso para guardar la tarea.' });
      return;
    }

    const newTask = {
      taskName,
      createdDate: new Date().toISOString(),
      dueDate: dueDate + "T00:00:00",
      done: false,
      details,
      state,
      priority,
      courseCode,
      userId
    };
    try {
      let response;
      if (isEdit) {
        response = await fetch(`${API_BASE}/api/tasks/${resourceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        });
      } else {
        response = await fetch(`${API_BASE}/api/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        });
      }
      if (response.ok) {
        setNotice({ type: 'success', title: isEdit ? 'Tarea actualizada' : 'Tarea creada', message: isEdit ? 'Los cambios quedaron guardados correctamente.' : 'Tu tarea quedó registrada y aparece en la lista.' });
        try { window.dispatchEvent(new CustomEvent('tasksUpdated')); } catch (err) {}
        navigate("/tasks");
      } else {
        setNotice({ type: 'error', title: 'No se pudo guardar la tarea', message: 'El nombre no puede estar vacío, la fecha tiene que ser futura y la descripción puede quedar vacía.' });
      }
    } catch (error) {
      console.error("Error creando tarea:", error);
      setNotice({ type: 'error', title: 'Problema de conexión', message: 'No se pudo guardar la tarea. Verifica tu conexión e inténtalo de nuevo.' });
    }
  };

  useEffect(() => {
    if (!isEdit) return;
    const loadTask = async () => {
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
        setState(t.state || 'Pending');
        setCourseCode(t.courseCode || t.course?.courseCode || '');
      } catch (err) {
        console.error('Error loading task for edit', err);
      }
    };
    loadTask();
  }, [isEdit, resourceId]);

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${resourceId}`, { method: 'DELETE' });
      if (res.ok) {
        try { window.dispatchEvent(new CustomEvent('tasksUpdated')); } catch (err) {}
        navigate('/tasks');
      } else {
        setNotice({ type: 'error', title: 'No se pudo eliminar', message: 'El servidor no pudo borrar la tarea. Intenta nuevamente.' });
      }
    } catch (err) {
      console.error('Error deleting task', err);
      setNotice({ type: 'error', title: 'Problema de conexión', message: 'No se pudo eliminar la tarea. Verifica tu conexión e inténtalo de nuevo.' });
    }
  };

  return (
    <div className="task-page">
      <div className="task-box">
        <h2 className="task-title">Agregar nueva tarea</h2>
        {notice && <NoticeBanner {...notice} onClose={() => setNotice(null)} />}
        <form onSubmit={handleSubmit}>
          <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} className="task-input" placeholder="Nombre de la tarea" required />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="task-input" required />
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} className="task-input" placeholder="Detalles" />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="task-input">
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
            <option value="Examen / Quiz">Examen / Quiz</option>
            <option value="Proyecto">Proyecto</option>
          </select>
          <select value={state} onChange={(e) => setState(e.target.value)} className="task-input">
            <option value="Pending">Pendiente</option>
            <option value="In Progress">En progreso</option>
            <option value="Completed">Completada</option>
          </select>
          <select value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="task-input" required>
            <option value="">Seleccione un curso</option>
            {availableCourses.map((c) => (
              <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
            ))}
          </select>
          <div style={{display:'flex', gap:8}}>
            <button type="submit" className="task-button">{isEdit ? 'ACTUALIZAR' : 'GUARDAR'}</button>
            {isEdit && <button type="button" onClick={handleDelete} className="task-button" style={{background:'#ff6b6b'}}>ELIMINAR</button>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskCreatePage;