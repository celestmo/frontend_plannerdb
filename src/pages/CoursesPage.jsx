import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AVAILABLE_COURSES, COURSE_COLORS } from '../constants/courses';
import NoticeBanner from '../components/NoticeBanner';
const API_BASE = import.meta.env.VITE_API_URL || '';

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notice, setNotice] = useState(null);
  const [courseCodeInput, setCourseCodeInput] = useState('');
  const [courseNameInput, setCourseNameInput] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const getStoredUserCourses = useCallback((userId) => {
    if (!userId) return [];
    try {
      const raw = localStorage.getItem(`userCourses:${userId}`);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Error reading user courses', err);
      return [];
    }
  }, []);

  const saveStoredUserCourses = useCallback((userId, list) => {
    if (!userId) return;
    localStorage.setItem(`userCourses:${userId}`, JSON.stringify(list));
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const storedCourses = getStoredUserCourses(user?.userId);
      const courseMap = {};

      storedCourses.forEach((course) => {
        const courseCode = String(course.courseCode || '').trim().toUpperCase();
        if (!courseCode) return;
        courseMap[courseCode] = {
          courseCode,
          courseName: course.courseName || '',
          tasks: [],
          isCustom: true,
        };
      });

      const res = await fetch(`${API_BASE}/api/tasks`);
      if (res.ok) {
        const allTasks = await res.json();
        const userTasks = allTasks.filter(t => String(t.userId).trim() === String(user?.userId).trim());
        userTasks.forEach(task => {
          const courseCode = String(task.courseCode || task.course?.courseCode || '').trim().toUpperCase();
          if (!courseCode) return;
          if (!courseMap[courseCode]) {
            courseMap[courseCode] = {
              courseCode,
              courseName: task.courseName || task.course?.courseName || AVAILABLE_COURSES.find(c => c.code === courseCode)?.name || '',
              tasks: [],
              isCustom: false,
            };
          }
          courseMap[courseCode].tasks.push(task);
        });
      }

      const coursesData = Object.values(courseMap).map((course) => {
        const urgentCount = course.tasks.filter(t => t.priority === 'Alta').length;
        const colors = COURSE_COLORS[course.courseCode] || { icon: 'ti-book', color: '#378ADD', bgColor: '#E6F1FB', borderColor: '#B5D4F4' };
        return { ...course, ...colors, taskCount: course.tasks.length, urgentCount, status: urgentCount > 0 ? 'urgent' : 'ok' };
      });
      setCourses(coursesData);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setNotice({ type: 'error', title: 'Problema de conexión', message: 'No fue posible cargar tus cursos. Revisa tu conexión e inténtalo de nuevo.' });
    }
  }, [getStoredUserCourses, user?.userId]);

  useEffect(() => {
    fetchCourses();
    const onUpdate = () => fetchCourses();
    window.addEventListener('tasksUpdated', onUpdate);
    return () => window.removeEventListener('tasksUpdated', onUpdate);
  }, [fetchCourses]);

  const handleAddCourse = () => {
    setEditingCourse(null);
    setCourseCodeInput('');
    setCourseNameInput('');
    setShowAddModal(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseCodeInput(course.courseCode || '');
    setCourseNameInput(course.courseName || '');
    setShowEditModal(true);
  };

  const handleSelectCourse = (courseCode) => {
    localStorage.setItem('selectedCourseForTask', courseCode);
    setShowAddModal(false);
    navigate('/crear-tarea');
  };

  const getAvailableCoursesToAdd = () => {
    const activeCourses = courses.map(c => c.courseCode);
    return AVAILABLE_COURSES.filter(c => !activeCourses.includes(c.code));
  };

  const handleDeleteCourse = (courseCode) => {
    const course = courses.find(c => c.courseCode === courseCode);
    if (!course) return;
    if (window.confirm(`¿Estás seguro de que deseas eliminar el curso ${course.courseCode}?`)) {
      const storedCourses = getStoredUserCourses(user?.userId).filter(c => String(c.courseCode).toUpperCase() !== String(courseCode).toUpperCase());
      saveStoredUserCourses(user?.userId, storedCourses);
      setCourses(courses.filter(c => String(c.courseCode).toUpperCase() !== String(courseCode).toUpperCase()));
      setNotice({ type: 'success', title: 'Curso eliminado', message: `El curso ${course.courseCode} ya no aparece en tu lista.` });
    }
  };

  return (
    <section className="page-section">
      <div className="inner-page">
        <div className="page-header">
          <div>
            <h2 className="page-title">Mis Cursos</h2>
          </div>
        </div>

        {notice && <NoticeBanner {...notice} onClose={() => setNotice(null)} />}
        {courses.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px 20px', color: '#666'}}>
          </div>
        ) : (
          <div className="course-grid">
            {courses.map((course) => (
              <div key={course.courseCode} className="course-card">
                <div className="course-card-top" style={{background: course.bgColor, borderColor: course.borderColor}}>
                  <div className="course-icon" style={{background: course.color}}><i className={`ti ${course.icon}`}></i></div>
                  <div className="course-actions">
                    {course.isCustom && (
                      <button className="icon-btn" onClick={() => handleEditCourse(course)}><i className="ti ti-edit"></i></button>
                    )}
                    <button className="icon-btn danger" onClick={() => handleDeleteCourse(course.courseCode)}><i className="ti ti-trash"></i></button>
                  </div>
                </div>
                <div className="course-card-body">
                  <p className="course-sigla">{course.courseCode}</p>
                  <p className="course-name">{course.courseName || 'Sin nombre'}</p>
                  <div className="course-stats">
                    <span><i className="ti ti-checklist"></i> {course.taskCount} {course.taskCount === 1 ? 'tarea' : 'tareas'}</span>
                    {course.status === 'urgent' ? (
                      <span><i className="ti ti-alert-circle" style={{color:'#E24B4A'}}></i> {course.urgentCount} {course.urgentCount === 1 ? 'urgente' : 'urgentes'}</span>
                    ) : (
                      <span><i className="ti ti-circle-check" style={{color:'#1D9E75'}}></i> Al día</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(showAddModal || showEditModal) && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'white',borderRadius:'8px',padding:'30px',maxWidth:'520px',width:'90%',maxHeight:'75vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h2 style={{margin:0}}>{editingCourse ? 'Editar curso' : 'Agregar curso'}</h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); setEditingCourse(null); }} style={{background:'none',border:'none',fontSize:'24px',cursor:'pointer',color:'#666'}}>×</button>
            </div>

            <form onSubmit={handleCreateCourse} style={{marginBottom:'20px'}}>
              <label style={{display:'block',marginBottom:'6px',fontWeight:600}}>Sigla del curso</label>
              <input className="task-input" value={courseCodeInput} onChange={(e) => setCourseCodeInput(e.target.value)} placeholder="Ej: AB-101" style={{marginBottom:'12px'}} />
              <label style={{display:'block',marginBottom:'6px',fontWeight:600}}>Nombre del curso</label>
              <input className="task-input" value={courseNameInput} onChange={(e) => setCourseNameInput(e.target.value)} placeholder="Ej: Matemática Básica" style={{marginBottom:'12px'}} />
              <button type="submit" className="btn btn-primary">{editingCourse ? 'Actualizar curso' : 'Guardar curso'}</button>
            </form>

            <div>
              <p style={{color:'#999',marginBottom:'12px'}}>O elige uno de los cursos sugeridos para crear tu primera tarea:</p>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {getAvailableCoursesToAdd().map((course) => {
                  const colors = COURSE_COLORS[course.code] || { icon:'ti-book', color:'#378ADD', bgColor:'#E6F1FB', borderColor:'#B5D4F4' };
                  return (
                    <button key={course.code} onClick={() => handleSelectCourse(course.code)}
                      style={{padding:'12px 15px',border:`2px solid ${colors.borderColor}`,background:colors.bgColor,borderRadius:'6px',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
                      onMouseEnter={(e) => e.target.style.background = colors.borderColor}
                      onMouseLeave={(e) => e.target.style.background = colors.bgColor}
                    >
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <i className={`ti ${colors.icon}`} style={{color:colors.color,fontSize:'20px'}}></i>
                        <div>
                          <strong>{course.code}</strong>
                          <div style={{fontSize:'12px',color:'#666'}}>{course.name}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CoursesPage;