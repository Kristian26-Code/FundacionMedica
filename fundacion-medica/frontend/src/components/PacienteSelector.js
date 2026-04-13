import { useState } from 'react'

function PacienteSelector({ api, onSelect }) {
  const [cedulaBusqueda, setCedulaBusqueda] = useState('')
  const [paciente, setPaciente] = useState(null)
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    cedula: '',
    fecha_nacimiento: '',
    telefono: '',
    email: ''
  })
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const toInputDate = (value) => {
    if (!value) return ''
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return ''
    return parsed.toISOString().slice(0, 10)
  }

  const buscarPaciente = async (event) => {
    event.preventDefault()
    setError('')
    setMsg('')

    try {
      const { data } = await api.get(`/pacientes/cedula/${cedulaBusqueda}`)
      setPaciente(data)
      setNuevoPaciente({
        nombre: data.nombre || '',
        cedula: data.cedula || '',
        fecha_nacimiento: toInputDate(data.fecha_nacimiento),
        telefono: data.telefono || '',
        email: data.email || ''
      })
      setMsg(`Paciente encontrado: ${data.nombre}`)
      onSelect(data)
    } catch (err) {
      setPaciente(null)
      setError(err.response?.data?.error || 'No se pudo buscar paciente')
      onSelect(null)
    }
  }

  const crearPaciente = async (event) => {
    event.preventDefault()
    setError('')
    setMsg('')

    try {
      const { data } = await api.post('/pacientes', nuevoPaciente)
      setPaciente(data)
      setCedulaBusqueda(data.cedula)
      setMsg('Paciente creado correctamente')
      onSelect(data)
    } catch (err) {
      const apiError = err.response?.data?.error || 'No se pudo crear paciente'
      setError(apiError)

      if (apiError.toLowerCase().includes('documento') || apiError.toLowerCase().includes('cedula')) {
        window.alert(apiError)
      }
    }
  }

  return (
    <div className="patient-card">
      <p className="patient-card-header">Paciente</p>

      {/* Búsqueda */}
      <form onSubmit={buscarPaciente} className="inline-form" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          required
          placeholder="Buscar paciente por número de documento"
          value={cedulaBusqueda}
          onChange={(e) => setCedulaBusqueda(e.target.value)}
        />
        <button type="submit" style={{ whiteSpace: 'nowrap' }}>Buscar</button>
      </form>

      {/* Formulario crear / editar */}
      <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--slate-400)', marginBottom: '12px' }}>
        Datos del paciente
      </p>
      <form onSubmit={crearPaciente} className="grid-form two-cols" style={{ marginBottom: '4px' }}>
        <label>
          Nombre completo
          <input
            required
            placeholder="Nombre y apellidos"
            value={nuevoPaciente.nombre}
            onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })}
          />
        </label>
        <label>
          Documento
          <input
            required
            placeholder="Número de identificación"
            value={nuevoPaciente.cedula}
            onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, cedula: e.target.value })}
          />
        </label>
        <label>
          Fecha nacimiento
          <input
            type="date"
            required
            value={nuevoPaciente.fecha_nacimiento}
            onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, fecha_nacimiento: e.target.value })}
          />
        </label>
        <label>
          Teléfono
          <input
            placeholder="Número de contacto"
            value={nuevoPaciente.telefono}
            onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, telefono: e.target.value })}
          />
        </label>
        <label style={{ gridColumn: '1 / -1' }}>
          Correo electrónico
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={nuevoPaciente.email}
            onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, email: e.target.value })}
          />
        </label>
        <div className="full-span">
          <button type="submit">Registrar paciente</button>
        </div>
      </form>

      {error && (
        <p className="alert error dismissible" onClick={() => setError('')}>
          {error}
        </p>
      )}
      {msg && (
        <p className="alert ok dismissible" onClick={() => setMsg('')}>
          {msg}
        </p>
      )}

      {paciente && (
        <div className="patient-found-chip">
          {paciente.nombre} &nbsp;·&nbsp; Doc: {paciente.cedula}
        </div>
      )}
    </div>
  )
}

export default PacienteSelector
