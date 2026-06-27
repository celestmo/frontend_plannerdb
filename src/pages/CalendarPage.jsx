import { useEffect, useState, useCallback } from "react";
import { useAuth } from '../context/AuthContext';
import API_BASE from "../config";

function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [viewMode, setViewMode] = useState('month');
  const [selectedDate, setSelectedDate] = useState(null);
  const { user } = useAuth();

  const fetchTasks = useCallback(async () => {
    try {
      if (!user?.userId) { setTasks([]); return; }
      const res = await fetch(`${API_BASE}/api/tasks`);
      if (res.ok) {
        const all = await res.json();
        const filtered = all.filter(t => String(t.userId) === String(user.userId));
        setTasks(filtered);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
    const handler = () => fetchTasks();
    window.addEventListener('tasksUpdated', handler);
    return () => window.removeEventListener('tasksUpdated', handler);
  }, [fetchTasks]);

  const tasksByDate = tasks.reduce((acc, t) => {
    if (!t.dueDate) return acc;
    const key = new Date(t.dueDate).toISOString().slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const courseSummary = Object.values(tasks.reduce((acc, t) => {
    const code = t.courseCode || t.course?.courseCode || 'Sin curso';
    if (!acc[code]) acc[code] = { courseCode: code, courseName: t.course?.courseName || '', count: 0 };
    acc[code].count += 1;
    return acc;
  }, {})).sort((a, b) => b.count - a.count);

  const miniCells = (() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1);
    const prevMonthDays = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = 0; i < prevMonthDays; i += 1) {
      const dayNum = prevMonthLast - prevMonthDays + 1 + i;
      cells.push({ day: dayNum, other: true, date: new Date(year, month - 1, dayNum) });
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      const dateObj = new Date(year, month, d);
      const key = dateObj.toISOString().slice(0, 10);
      cells.push({ day: d, other: false, date: dateObj, hasTask: Boolean(tasksByDate[key]) });
    }
    let nextDay = 1;
    while (cells.length < 42) {
      cells.push({ day: nextDay, other: true, date: new Date(year, month + 1, nextDay) });
      nextDay += 1;
    }
    const todayKey = new Date().toISOString().slice(0, 10);
    return cells.map((cell) => ({ ...cell, isToday: cell.date.toISOString().slice(0, 10) === todayKey }));
  })();

  return (
    <section className="page-section">
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-block">
            <p className="sidebar-label">{current.toLocaleString(undefined, { month: 'long' })} {current.getFullYear()}</p>
            <div className="mini-cal">
              <div className="mini-cal-header">
                <span className="mini-month-title">{current.toLocaleString(undefined, { month: 'long' })} {current.getFullYear()}</span>
                <div className="mini-nav">
                  <button className="mini-nav-btn" onClick={() => setCurrent(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}><i className="ti ti-chevron-left"></i></button>
                  <button className="mini-nav-btn" onClick={() => setCurrent(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}><i className="ti ti-chevron-right"></i></button>
                </div>
              </div>
              <div className="mini-grid">
                <span className="mini-dname">Lu</span><span className="mini-dname">Ma</span>
                <span className="mini-dname">Mi</span><span className="mini-dname">Ju</span>
                <span className="mini-dname">Vi</span><span className="mini-dname">Sá</span>
                <span className="mini-dname">Do</span>
                {miniCells.map((cell, idx) => (
                  <span key={idx} className={`mini-day ${cell.other ? 'dim' : ''} ${cell.hasTask ? 'has-task' : ''} ${cell.isToday ? 'today' : ''}`}
                    onClick={() => !cell.other && setSelectedDate(cell.date)} style={{cursor: 'pointer'}}>
                    {cell.day}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="sidebar-block">
            <p className="sidebar-label">Tipo / Prioridad</p>
            <ul className="legend">
              <li><span className="ldot high"></span> Alta prioridad</li>
              <li><span className="ldot mid"></span> Media prioridad</li>
              <li><span className="ldot low"></span> Baja prioridad</li>
              <li><span className="ldot exam"></span> Examen / Quiz</li>
              <li><span className="ldot project"></span> Proyecto</li>
            </ul>
          </div>
          <div className="sidebar-block">
            <p className="sidebar-label">Mis cursos</p>
            <ul className="course-list">
              {courseSummary.length === 0 && <li className="course-item">No hay cursos con tareas</li>}
              {courseSummary.map((course, index) => (
                <li key={course.courseCode} className="course-item">
                  <span className="cdot" style={{background: ['#378ADD', '#D4537E', '#1D9E75', '#5B4FD4', '#D97B1A'][index % 5]}}></span>
                  {course.courseCode} {course.courseName && `- ${course.courseName}`}<span className="cbadge">{course.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="sidebar-block">
            <p className="sidebar-label">Próximas tareas</p>
            <ul className="course-list">
              {tasks.slice(0,5).map(t => (
                <li key={t.taskId} className="course-item">
                  <span className="cdot" style={{background:'#378ADD'}}></span> {t.taskName} <span className="cbadge">{new Date(t.dueDate).toLocaleDateString()}</span>
                </li>
              ))}
              {tasks.length === 0 && <li className="course-item">No hay tareas</li>}
            </ul>
          </div>
        </aside>

        <main className="cal-main">
          <div className="cal-toolbar">
            <div className="cal-toolbar-left">
              <div className="cal-nav-group">
                <button className="btn btn-icon" onClick={() => setCurrent(prev => new Date(prev.getFullYear(), prev.getMonth()-1, 1))}><i className="ti ti-chevron-left"></i></button>
                <button className="btn" onClick={() => setCurrent(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Hoy</button>
                <button className="btn btn-icon" onClick={() => setCurrent(prev => new Date(prev.getFullYear(), prev.getMonth()+1, 1))}><i className="ti ti-chevron-right"></i></button>
              </div>
              <h2 className="cal-title">{current.toLocaleString(undefined, { month: 'long' })} {current.getFullYear()}</h2>
            </div>
            <div className="view-toggle">
              <button className={`view-btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => { setViewMode('month'); setSelectedDate(null); }}>Mes</button>
              <button className={`view-btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Semana</button>
            </div>
          </div>

          <div className="month-grid">
            {viewMode === 'month' ? (
              <>
                <div className="month-head">
                  <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
                </div>
                <div className="month-body">
                  {(() => {
                    const year = current.getFullYear();
                    const month = current.getMonth();
                    const firstDay = new Date(year, month, 1);
                    const startOffset = (firstDay.getDay() + 6) % 7;
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const cells = [];
                    const prevMonthDays = startOffset;
                    const prevMonthLast = new Date(year, month, 0).getDate();
                    for (let i = 0; i < prevMonthDays; i++) {
                      cells.push({ date: new Date(year, month - 1, prevMonthLast - prevMonthDays + 1 + i), other: true });
                    }
                    for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d), other: false });
                    while (cells.length < 42) {
                      cells.push({ date: new Date(year, month + 1, cells.length - (prevMonthDays + daysInMonth) + 1), other: true });
                    }
                    const tbd = {};
                    tasks.forEach(t => {
                      if (!t.dueDate) return;
                      const key = new Date(t.dueDate).toISOString().slice(0,10);
                      tbd[key] = tbd[key] || [];
                      tbd[key].push(t);
                    });
                    const todayKey = new Date().toISOString().slice(0,10);
                    const pillClass = t => t.priority === 'Alta' ? 'high' : t.priority === 'Baja' ? 'low' : t.priority === 'Examen' ? 'exam' : t.priority === 'Proyecto' ? 'project' : 'mid';
                    return cells.map((cell, idx) => {
                      const key = cell.date.toISOString().slice(0,10);
                      const dayTasks = tbd[key] || [];
                      return (
                        <div key={idx} className={`mcell ${cell.other ? 'other' : ''} ${key === todayKey ? 'today' : ''}`}>
                          <div className="mcell-num">{cell.date.getDate()}</div>
                          {dayTasks.slice(0,3).map((t,i) => (
                            <div key={t.taskId || i} className={`task-pill ${pillClass(t)}`}>{t.taskName}</div>
                          ))}
                        </div>
                      );
                    });
                  })()}
                </div>
              </>
            ) : (
              <>
                <div className="month-head">
                  <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
                </div>
                <div className="month-body">
                  {(() => {
                    const refDate = selectedDate || new Date();
                    const getMonday = (d) => {
                      const date = new Date(d);
                      const day = date.getDay();
                      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                      return new Date(date.setDate(diff));
                    };
                    const monday = getMonday(refDate);
                    const week = [];
                    for (let i = 0; i < 7; i++) {
                      const d = new Date(monday);
                      d.setDate(d.getDate() + i);
                      week.push(d);
                    }
                    const tbd = {};
                    tasks.forEach(t => {
                      if (!t.dueDate) return;
                      const key = new Date(t.dueDate).toISOString().slice(0, 10);
                      tbd[key] = tbd[key] || [];
                      tbd[key].push(t);
                    });
                    const todayKey = new Date().toISOString().slice(0, 10);
                    const pillClass = t => t.priority === 'Alta' ? 'high' : t.priority === 'Baja' ? 'low' : t.priority === 'Examen' ? 'exam' : t.priority === 'Proyecto' ? 'project' : 'mid';
                    return week.map((d, idx) => {
                      const key = d.toISOString().slice(0, 10);
                      const dayTasks = tbd[key] || [];
                      return (
                        <div key={idx} className={`mcell ${key === todayKey ? 'today' : ''}`} style={{minHeight: '150px'}}>
                          <div className="mcell-num">{d.getDate()}</div>
                          {dayTasks.map((t, i) => (
                            <div key={t.taskId || i} className={`task-pill ${pillClass(t)}`}>{t.taskName}</div>
                          ))}
                        </div>
                      );
                    });
                  })()}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </section>
  );
}

export default CalendarPage;