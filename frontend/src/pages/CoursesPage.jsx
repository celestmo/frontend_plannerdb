function CoursesPage() {
  return (
    <section className="page-section">
      <div className="inner-page">

        <div className="page-header">
          <div>
            <h2 className="page-title">Mis Cursos</h2>
            <p className="page-sub">5 cursos activos este semestre</p>
          </div>
          <button className="btn btn-primary"><i className="ti ti-plus"></i> Agregar curso</button>
        </div>

        <div className="course-grid">

          <div className="course-card">
            <div className="course-card-top" style={{background:'#E6F1FB', borderColor:'#B5D4F4'}}>
              <div className="course-icon" style={{background:'#378ADD'}}><i className="ti ti-database"></i></div>
              <div className="course-actions">
                <button className="icon-btn"><i className="ti ti-edit"></i></button>
                <button className="icon-btn danger"><i className="ti ti-trash"></i></button>
              </div>
            </div>
            <div className="course-card-body">
              <p className="course-sigla">BD-2025</p>
              <p className="course-name">Bases de Datos</p>
              <div className="course-stats">
                <span><i className="ti ti-checklist"></i> 3 tareas</span>
                <span><i className="ti ti-alert-circle" style={{color:'#E24B4A'}}></i> 1 urgente</span>
              </div>
            </div>
          </div>

          <div className="course-card">
            <div className="course-card-top" style={{background:'#fff0f5', borderColor:'#f4bad0'}}>
              <div className="course-icon" style={{background:'#D4537E'}}><i className="ti ti-binary-tree"></i></div>
              <div className="course-actions">
                <button className="icon-btn"><i className="ti ti-edit"></i></button>
                <button className="icon-btn danger"><i className="ti ti-trash"></i></button>
              </div>
            </div>
            <div className="course-card-body">
              <p className="course-sigla">AE-2024</p>
              <p className="course-name">Algoritmos y Estructuras</p>
              <div className="course-stats">
                <span><i className="ti ti-checklist"></i> 2 tareas</span>
                <span><i className="ti ti-circle-check" style={{color:'#1D9E75'}}></i> Al día</span>
              </div>
            </div>
          </div>

          <div className="course-card">
            <div className="course-card-top" style={{background:'#edfaf4', borderColor:'#9fe1cb'}}>
              <div className="course-icon" style={{background:'#1D9E75'}}><i className="ti ti-network"></i></div>
              <div className="course-actions">
                <button className="icon-btn"><i className="ti ti-edit"></i></button>
                <button className="icon-btn danger"><i className="ti ti-trash"></i></button>
              </div>
            </div>
            <div className="course-card-body">
              <p className="course-sigla">RC-2025</p>
              <p className="course-name">Seminario</p>
              <div className="course-stats">
                <span><i className="ti ti-checklist"></i> 2 tareas</span>
                <span><i className="ti ti-circle-check" style={{color:'#1D9E75'}}></i> Al día</span>
              </div>
            </div>
          </div>

          <div className="course-card">
            <div className="course-card-top" style={{background:'#f0eeff', borderColor:'#c4bef5'}}>
              <div className="course-icon" style={{background:'#5B4FD4'}}><i className="ti ti-math-function"></i></div>
              <div className="course-actions">
                <button className="icon-btn"><i className="ti ti-edit"></i></button>
                <button className="icon-btn danger"><i className="ti ti-trash"></i></button>
              </div>
            </div>
            <div className="course-card-body">
              <p className="course-sigla">MD-2023</p>
              <p className="course-name">Calculo</p>
              <div className="course-stats">
                <span><i className="ti ti-checklist"></i> 1 tarea</span>
                <span><i className="ti ti-alert-circle" style={{color:'#E24B4A'}}></i> 1 urgente</span>
              </div>
            </div>
          </div>

          <div className="course-card">
            <div className="course-card-top" style={{background:'#fff8ec', borderColor:'#f5d8a0'}}>
              <div className="course-icon" style={{background:'#D97B1A'}}><i className="ti ti-code"></i></div>
              <div className="course-actions">
                <button className="icon-btn"><i className="ti ti-edit"></i></button>
                <button className="icon-btn danger"><i className="ti ti-trash"></i></button>
              </div>
            </div>
            <div className="course-card-body">
              <p className="course-sigla">POO-2025</p>
              <p className="course-name">Desarrollo 3</p>
              <div className="course-stats">
                <span><i className="ti ti-checklist"></i> 1 tarea</span>
                <span><i className="ti ti-circle-check" style={{color:'#1D9E75'}}></i> Al día</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default CoursesPage