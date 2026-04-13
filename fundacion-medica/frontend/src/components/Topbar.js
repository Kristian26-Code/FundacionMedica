import { Link, useLocation } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'

function Topbar({ usuario, onLogout }) {
  const { pathname } = useLocation()
  const link = (to) => `topbar-link${pathname === to ? ' active' : ''}`

  const primerNombre = usuario?.nombre?.split(' ')[0] ?? 'Usuario'
  const isAdmin = usuario?.rol === 'admin'
  const rolLabel = isAdmin ? 'Administrador' : 'Médico'

  return (
    <header className="topbar">
      <Link to="/home" className="topbar-brand">
        <span className="topbar-logo"><FiHeart /></span>
        <span className="topbar-name">Fundación Médica</span>
      </Link>

      <div className="topbar-divider" />

      <nav className="topbar-nav">
        <Link to="/home"      className={link('/home')}>Inicio</Link>
        <Link to="/consultas" className={link('/consultas')}>Consultas</Link>
        <Link to="/citas"     className={link('/citas')}>Citas</Link>
        {isAdmin && <Link to="/usuarios" className={link('/usuarios')}>Usuarios</Link>}
      </nav>

      <div className="topbar-right">
        <div>
          <span className="topbar-user-name">{primerNombre}</span>
          <span className="topbar-user-role">{rolLabel}</span>
        </div>
        {onLogout && (
          <button type="button" className="btn-ghost" onClick={onLogout}>
            Cerrar sesión
          </button>
        )}
      </div>
    </header>
  )
}

export default Topbar
