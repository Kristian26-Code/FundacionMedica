import { useState } from 'react'
import axios from 'axios'
import { BASE_URL } from '../services/api'

function LoginPage({ onLogin }) {
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/login`, loginData)
      onLogin(data)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-layout">
      {/* Panel de marca */}
      <div className="login-brand">
        <div className="brand-logo">⚕</div>
        <h1>Fundación Médica</h1>
        <p>
          Sistema integrado de gestión clínica para profesionales de la salud.
          Seguro, rápido y diseñado para el flujo real del consultorio.
        </p>
        <div className="brand-features">
          <div className="brand-feature">
            <span className="brand-feature-icon">✓</span>
            Historias clínicas digitales estructuradas
          </div>
          <div className="brand-feature">
            <span className="brand-feature-icon">✓</span>
            Agenda y seguimiento de citas
          </div>
          <div className="brand-feature">
            <span className="brand-feature-icon">✓</span>
            Generación de reportes en PDF
          </div>
        </div>
      </div>

      {/* Panel de formulario */}
      <div className="login-form-panel">
        <div className="login-form-wrap animate-in">
          <div className="login-heading">
            <h2>Iniciar sesión</h2>
            <p>Ingresa tus credenciales para acceder al sistema</p>
          </div>

          <form onSubmit={submit} className="grid-form">
            <label>
              Correo electrónico
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="medico@fundacion.com"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="documento de identificación"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', marginTop: '4px', fontSize: '0.95rem' }}
            >
              {loading ? 'Verificando...' : 'Ingresar al sistema'}
            </button>
          </form>

          {error && (
            <p
              className="alert error dismissible"
              style={{ marginTop: '14px' }}
              onClick={() => setError('')}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
