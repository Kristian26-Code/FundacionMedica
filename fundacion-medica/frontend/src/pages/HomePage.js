import { Link } from 'react-router-dom'
import { FiActivity, FiCalendar, FiShield, FiUsers } from 'react-icons/fi'
import Topbar from '../components/Topbar'

function HomePage({ usuario, onLogout }) {
  const hoy = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const primerNombre = usuario?.nombre?.split(' ')[0] ?? 'Doctor'
  const isAdmin = usuario?.rol === 'admin'

  return (
    <div className="app-shell">
      <Topbar usuario={usuario} onLogout={onLogout} />

      <main className="main-content animate-in">

        {/* Bienvenida */}
        <div className="dash-welcome">
          <h1>Bienvenido, {primerNombre} </h1>
          <p style={{ textTransform: 'capitalize' }}>{hoy}</p>
        </div>

        {/* Tarjetas de estadísticas decorativas */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon blue"><FiActivity /></div>
            <div>
              <div className="stat-value">—</div>
              <div className="stat-label">Consultas hoy</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon teal"><FiCalendar /></div>
            <div>
              <div className="stat-value">—</div>
              <div className="stat-label">Citas pendientes</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><FiUsers /></div>
            <div>
              <div className="stat-value">—</div>
              <div className="stat-label">Pacientes registrados</div>
            </div>
          </div>
        </div>

        {/* Módulos de acceso rápido */}
        <div className="modules-grid">
          <Link to="/consultas" className="module-card">
            <div className="module-icon"><FiActivity /></div>
            <div>
              <h3>Consultas</h3>
              <p>
                Registra y gestiona historias clínicas completas, diagnósticos,
                planes de manejo y evolución del paciente.
              </p>
              <span className="module-cta">Ir al módulo →</span>
            </div>
          </Link>
          <Link to="/citas" className="module-card">
            <div className="module-icon"><FiCalendar /></div>
            <div>
              <h3>Agenda de Citas</h3>
              <p>
                Programa citas de control, gestiona el estado de cada cita
                y lleva el seguimiento de la agenda clínica.
              </p>
              <span className="module-cta">Ir al módulo →</span>
            </div>
          </Link>
          {isAdmin && (
            <Link to="/usuarios" className="module-card">
              <div className="module-icon"><FiShield /></div>
              <div>
                <h3>Administración de Usuarios</h3>
                <p>
                  Crea cuentas para el personal médico. El usuario es el email
                  y la contraseña inicial es el documento del profesional.
                </p>
                <span className="module-cta">Gestionar usuarios →</span>
              </div>
            </Link>
          )}
        </div>

        {/* Flujo recomendado */}
        <div className="workflow-card">
          <p className="workflow-title">Flujo clínico recomendado</p>
          <div className="workflow-steps">
            <div className="workflow-step">
              <span className="step-num">1</span>
              <span>Buscar o registrar al paciente</span>
            </div>
            <div className="workflow-step">
              <span className="step-num">2</span>
              <span>Completar la historia clínica en Consultas</span>
            </div>
            <div className="workflow-step">
              <span className="step-num">3</span>
              <span>Agendar cita de seguimiento en Citas</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

export default HomePage
