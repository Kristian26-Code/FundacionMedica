import { Navigate } from 'react-router-dom'

function ProtectedRoute({ token, usuario, allowedRoles, children }) {
  if (!token) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles?.length > 0) {
    const rol = usuario?.rol
    if (!rol || !allowedRoles.includes(rol)) {
      return <Navigate to="/home" replace />
    }
  }

  return children
}

export default ProtectedRoute
