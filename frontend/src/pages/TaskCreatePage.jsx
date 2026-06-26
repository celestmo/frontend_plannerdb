import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import "./style_taskCreate.css";

function TaskCreatePage() {
  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState("Media");
  const [state, setState] = useState("Pending");
  const [courseCode, setCourseCode] = useState("");
  const navigate = useNavigate();

  const { user } = useAuth();
  const userId = user?.userId || (() => {
    const raw = localStorage.getItem('userData');
    return raw ? JSON.parse(raw).userId : null;
  })();
  const { resourceId } = useParams();
  const isEdit = Boolean(resourceId);

  const courses = [
    { code: "IF-0001", name: "DESARROLLO DE SOFTWARE" },
    { code: "IF-0002", name: "INTRODUCCIÓN A LA INFORMÁTICA EMPRESARIAL" },
    { code: "IF-0003", name: "MATEMÁTICA BÁSICA PARA INFORMÁTICA EMPRESARIAL" },
    { code: "IF-0004", name: "DESARROLLO DE SOFTWARE II" },
    { code: "IF-0005", name: "MATEMÁTICAS DISCRETAS PARA INFORMÁTICA EMPRESARIAL" },
    { code: "IF-0006", name: "DESARROLLO DE SOFTWARE III" },
    { code: "IF-0007", name: "BASES DE DATOS I" },
    { code: "IF-0008", name: "CÁLCULO I PARA INFORMÁTICA EMPRESARIAL" },
    { code: "IF-3001", name: "ALGORITMOS Y ESTRUCTURAS DE DATOS" },
    { code: "IF-0009", name: "DESARROLLO DE SOFTWARE IV" },
    { code: "IF-0010", name: "BASES DE DATOS II" },
    { code: "IF-0011", name: "REDES DE COMPUTADORAS" },
    { code: "IF-0012", name: "ÁLGEBRA LINEAL PARA INFORMÁTICA EMPRESARIAL" },
    { code: "IF-0015", name: "INTRODUCCIÓN A LA ADMINISTRACIÓN DE NEGOCIOS" },
    { code: "IF-0016", name: "INTRODUCCIÓN A LA ESTADÍSTICA Y ANÁLISIS DE DATOS" },
    { code: "IF-0017", name: "MÉTODOS NUMÉRICOS Y ANÁLISIS COMPUTACIONAL" },
    { code: "IF-0019", name: "SEGURIDAD EN SISTEMAS INFORMÁTICOS" },
    { code: "IF-7201", name: "GESTIÓN DE PROYECTOS" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newTask = {
      taskName,
      createdDate: new Date().toISOString(),
      dueDate: dueDate + "T00:00:00",
      done: false,
      details,
      state,
      priority,
      course: { courseCode },   
      userId                   
    };

    try {
      let response;
      if (isEdit) {
        response = await fetch(`/api/tasks/${resourceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        });
      } else {
        response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        });
      }

      if (response.ok) {
        alert(isEdit ? "Tarea actualizada con éxito" : "Tarea creada con éxito");
        try { window.dispatchEvent(new CustomEvent('tasksUpdated')); } catch (err) {}
        navigate("/tasks");
      } else {
        alert("Error al guardar tarea");
      }
    } catch (error) {
      console.error("Error creando tarea:", error);
      alert("No se pudo conectar con el servidor");
    }
  };

  useEffect(() => {
    if (!isEdit) return;
    const loadTask = async () => {
      try {
        const res = await fetch('/api/tasks');
        if (!res.ok) return;
        const list = await res.json();
        const t = list.find(x => x.resourceId === resourceId || x.resourceId === resourceId);
        if (!t) return;
        setTaskName(t.taskName || '');
        setDueDate(t.dueDate ? t.dueDate.slice(0,10) : '');
        setDetails(t.details || '');
        setPriority(t.priority || 'Media');
        setState(t.state || 'Pending');
        setCourseCode(t.course?.courseCode || '');
      } catch (err) {
        console.error('Error loading task for edit', err);
      }
    };
    loadTask();
  }, [isEdit, resourceId]);

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      const res = await fetch(`/api/tasks/${resourceId}`, { method: 'DELETE' });
      if (res.ok) {
        try { window.dispatchEvent(new CustomEvent('tasksUpdated')); } catch (err) {}
        navigate('/tasks');
      } else {
        alert('Error al eliminar');
      }
    } catch (err) {
      console.error('Error deleting task', err);
      alert('No se pudo conectar con el servidor');
    }
  };

  return (
    <div className="task-page">
      <div className="task-box">
        <h2 className="task-title">Agregar nueva tarea</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="task-input"
            placeholder="Nombre de la tarea"
            required
          />

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="task-input"
            required
          />

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="task-input"
            placeholder="Detalles"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="task-input"
          >
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
            <option value="Examen / Quiz">Examen / Quiz</option>
            <option value="Proyecto">Proyecto</option>
          </select>

          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="task-input"
          >
            <option value="Pending">Pendiente</option>
            <option value="In Progress">En progreso</option>
            <option value="Completed">Completada</option>
          </select>

          <select
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            className="task-input"
            required
          >
            <option value="">Seleccione un curso</option>
            {courses.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.name}
              </option>
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
