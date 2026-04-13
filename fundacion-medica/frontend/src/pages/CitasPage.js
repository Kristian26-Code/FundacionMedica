import { useEffect, useMemo, useState } from 'react'
import { FiCalendar } from 'react-icons/fi'
import PacienteSelector from '../components/PacienteSelector'
import Topbar from '../components/Topbar'
import { createApi } from '../services/api'

function CitasPage({ token, usuario, onLogout }) {
  const api = useMemo(() => createApi(token), [token])
  const [paciente, setPaciente] = useState(null)
  const [citasPaciente, setCitasPaciente] = useState([])
  const [loadingCitas, setLoadingCitas] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fecha_cita: '',
    motivo: 'Cita de control'
  })

  const agendar = async (event) => {
    event.preventDefault()
    setMsg('')
    setError('')

    if (!paciente) {
      setError('Debes seleccionar un paciente antes de agendar cita')
      return
    }

    try {
      await api.post('/citas', {
        ...form,
        paciente_id: paciente.id
      })
      setMsg('Cita de control agendada correctamente')
      setForm({ fecha_cita: '', motivo: 'Cita de control' })
      await cargarCitasPaciente(paciente.id)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo agendar la cita')
    }
  }

  const cargarCitasPaciente = async (pacienteId) => {
    setLoadingCitas(true)
    try {
      const { data } = await api.get(`/citas/paciente/${pacienteId}`)
      setCitasPaciente(data)
    } catch (err) {
      setCitasPaciente([])
      setError(err.response?.data?.error || 'No se pudieron cargar las citas del paciente')
    } finally {
      setLoadingCitas(false)
    }
  }

  const cancelarCita = async (citaId) => {
    setMsg('')
    setError('')

    try {
      await api.put(`/citas/${citaId}/no-asistida`)
      setMsg('Cita marcada como no asistida')
      await cargarCitasPaciente(paciente.id)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo marcar como no asistida')
    }
  }

  const cumplirCita = async (citaId) => {
    setMsg('')
    setError('')

    try {
      await api.put(`/citas/${citaId}/cumplir`)
      setMsg('Cita marcada como cumplida')
      await cargarCitasPaciente(paciente.id)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo marcar la cita como cumplida')
    }
  }

  const eliminarHistorial = async () => {
    if (!paciente) return

    const confirmed = window.confirm(
      `Se eliminaran todas las citas de ${paciente.nombre}. Esta accion no se puede deshacer. ¿Deseas continuar?`
    )

    if (!confirmed) return

    setMsg('')
    setError('')

    try {
      const { data } = await api.delete(`/citas/paciente/${paciente.id}/historial`)
      setMsg(`${data.mensaje}. Registros eliminados: ${data.eliminadas}`)
      await cargarCitasPaciente(paciente.id)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar el historial de citas')
    }
  }

 // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  if (paciente?.id) {
    cargarCitasPaciente(paciente.id)
    return
  }

  setCitasPaciente([])
}, [paciente])

  const formatFecha = (fechaIso) => {
    return new Date(fechaIso).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  return (
    <div className="app-shell">
      <Topbar usuario={usuario} onLogout={onLogout} />

      <main className="main-content animate-in">

        {/* Encabezado de página */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Agenda de Citas</h1>
            <p className="page-subtitle">Programación y seguimiento de controles médicos</p>
          </div>
        </div>

        {/* Selector de paciente */}
        <PacienteSelector api={api} onSelect={setPaciente} />

        {/* Formulario de nueva cita */}
        <div className="card">
          <div className="card-header">
            <h2>Registrar nueva cita</h2>
          </div>

          <form onSubmit={agendar} className="grid-form two-cols">
            <label>
              Fecha y hora
              <input
                type="datetime-local"
                required
                value={form.fecha_cita}
                onChange={(e) => setForm({ ...form, fecha_cita: e.target.value })}
              />
            </label>
            <label>
              Motivo de la cita
              <input
                required
                placeholder="Ej: Cita de control, seguimiento"
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              />
            </label>
            <div className="full-span">
              <button type="submit" style={{ minWidth: '180px' }}>
                Agendar cita
              </button>
            </div>
          </form>

          {error && (
            <p className="alert error dismissible" style={{ marginTop: '14px' }} onClick={() => setError('')}>
              {error}
            </p>
          )}
          {msg && (
            <p className="alert ok dismissible" style={{ marginTop: '14px' }} onClick={() => setMsg('')}>
              {msg}
            </p>
          )}
        </div>

        {/* Tabla de citas del paciente */}
        {paciente && (
          <div className="card">
            <div className="card-header">
              <div>
                <h2>Citas de {paciente.nombre}</h2>
                {loadingCitas && (
                  <span className="small-note" style={{ marginTop: '2px', display: 'block' }}>Cargando...</span>
                )}
              </div>
              <button type="button" className="danger-btn btn-sm" onClick={eliminarHistorial}>
                Eliminar historial
              </button>
            </div>

            {citasPaciente.length === 0 && !loadingCitas ? (
              <div className="empty-state">
                <div className="empty-state-icon"><FiCalendar /></div>
                <p>Este paciente no tiene citas registradas.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha y hora</th>
                      <th>Motivo</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citasPaciente.map((cita) => (
                      <tr key={cita.id}>
                        <td style={{ fontWeight: 500 }}>{formatFecha(cita.fecha_cita)}</td>
                        <td>{cita.motivo}</td>
                        <td>
                          <span className={`status-pill ${
                            cita.estado === 'pendiente'
                              ? 'pending'
                              : cita.estado === 'cumplida'
                                ? 'fulfilled'
                                : 'missed'
                          }`}>
                            {cita.estado}
                          </span>
                        </td>
                        <td>
                          <div className="action-row">
                            <button
                              type="button"
                              className="success-btn btn-sm"
                              onClick={() => cumplirCita(cita.id)}
                            >
                              Cumplida
                            </button>
                            <button
                              type="button"
                              className="danger-btn btn-sm"
                              onClick={() => cancelarCita(cita.id)}
                            >
                              No asistida
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
        )}

      </main>
    </div>
  )
}

export default CitasPage
