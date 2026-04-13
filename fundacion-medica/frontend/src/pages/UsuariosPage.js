import { useEffect, useMemo, useState } from 'react'
import { FiUser } from 'react-icons/fi'
import Topbar from '../components/Topbar'
import { createApi } from '../services/api'

function UsuariosPage({ token, usuario, onLogout }) {
  const api = useMemo(() => createApi(token), [token])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    documento: ''
  })

  const cargarUsuarios = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/usuarios')
      setUsuarios(data)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar la lista de usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const crearUsuario = async (event) => {
    event.preventDefault()
    setMsg('')
    setError('')

    try {
      await api.post('/usuarios', form)
      setMsg('Usuario creado correctamente. La contraseña inicial es el número de documento.')
      setForm({ nombre: '', email: '', documento: '' })
      await cargarUsuarios()
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el usuario')
    }
  }

  const resetearPassword = async (usuarioItem) => {
    const documento = window.prompt(
      `Ingresa el número de documento para resetear la contraseña de ${usuarioItem.nombre}`
    )

    if (!documento) return

    setMsg('')
    setError('')

    try {
      await api.put(`/usuarios/${usuarioItem.id}/reset-password`, { documento })
      setMsg(`Contraseña reseteada para ${usuarioItem.nombre}. La nueva contraseña es el documento ingresado.`)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo resetear la contraseña')
    }
  }

  const eliminarUsuario = async (usuarioItem) => {
    const confirmed = window.confirm(
      `¿Deseas eliminar el usuario ${usuarioItem.nombre} (${usuarioItem.email})? Esta acción no se puede deshacer.`
    )

    if (!confirmed) return

    setMsg('')
    setError('')

    try {
      await api.delete(`/usuarios/${usuarioItem.id}`)
      setMsg(`Usuario eliminado: ${usuarioItem.nombre}`)
      await cargarUsuarios()
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar el usuario')
    }
  }

  return (
    <div className="app-shell">
      <Topbar usuario={usuario} onLogout={onLogout} />

      <main className="main-content animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">Administración de Usuarios</h1>
            <p className="page-subtitle">Solo administradores pueden crear usuarios del personal médico</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Crear usuario</h2>
          </div>

          <form onSubmit={crearUsuario} className="grid-form two-cols">
            <label>
              Nombre completo
              <input
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </label>

            <label>
              Email (usuario)
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>

            <label>
              Documento (será la contraseña inicial)
              <input
                required
                value={form.documento}
                onChange={(e) => setForm({ ...form, documento: e.target.value })}
              />
            </label>

            <label>
              Tipo de cuenta
              <input value="Médico" disabled />
            </label>

            <div className="full-span">
              <button type="submit" style={{ minWidth: '200px' }}>
                Crear usuario
              </button>
            </div>
          </form>

          {error && (
            <p className="alert error dismissible" onClick={() => setError('')} style={{ marginTop: '14px' }}>
              {error}
            </p>
          )}
          {msg && (
            <p className="alert ok dismissible" onClick={() => setMsg('')} style={{ marginTop: '14px' }}>
              {msg}
            </p>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Usuarios registrados</h2>
            {loading && <span className="small-note">Cargando...</span>}
          </div>

          {usuarios.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-state-icon"><FiUser /></div>
              <p>No hay usuarios registrados.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.nombre}</td>
                      <td>{item.email}</td>
                      <td>
                        <span className={`status-pill ${item.rol === 'admin' ? 'fulfilled' : 'pending'}`}>
                          {item.rol}
                        </span>
                      </td>
                      <td>
                        <div className="action-row">
                          <button
                            type="button"
                            className="btn-outline btn-sm"
                            onClick={() => resetearPassword(item)}
                          >
                            Resetear contraseña
                          </button>
                          <button
                            type="button"
                            className="danger-btn btn-sm"
                            onClick={() => eliminarUsuario(item)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default UsuariosPage
