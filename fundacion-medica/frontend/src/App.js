import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'
import CitasPage from './pages/CitasPage'
import ConsultasPage from './pages/ConsultasPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import UsuariosPage from './pages/UsuariosPage'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [usuario, setUsuario] = useState(() => {
    const raw = localStorage.getItem('usuario')
    return raw ? JSON.parse(raw) : null
  })

  const onLogin = ({ token: newToken, usuario: newUsuario }) => {
    setToken(newToken)
    setUsuario(newUsuario)
    localStorage.setItem('token', newToken)
    localStorage.setItem('usuario', JSON.stringify(newUsuario))
  }

  const cerrarSesion = () => {
    setToken('')
    setUsuario(null)
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/home" replace /> : <LoginPage onLogin={onLogin} />}
        />
        <Route
          path="/home"
          element={(
            <ProtectedRoute token={token} usuario={usuario}>
              <HomePage usuario={usuario} onLogout={cerrarSesion} />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/consultas"
          element={(
            <ProtectedRoute token={token} usuario={usuario}>
              <ConsultasPage token={token} usuario={usuario} onLogout={cerrarSesion} />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/citas"
          element={(
            <ProtectedRoute token={token} usuario={usuario}>
              <CitasPage token={token} usuario={usuario} onLogout={cerrarSesion} />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/usuarios"
          element={(
            <ProtectedRoute token={token} usuario={usuario} allowedRoles={['admin']}>
              <UsuariosPage token={token} usuario={usuario} onLogout={cerrarSesion} />
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<Navigate to={token ? '/home' : '/'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App