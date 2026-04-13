import { useMemo, useState } from 'react'
import { FiDownload } from 'react-icons/fi'
import { jsPDF } from 'jspdf'
import PacienteSelector from '../components/PacienteSelector'
import Topbar from '../components/Topbar'
import { createApi } from '../services/api'

function ConsultasPage({ token, usuario, onLogout }) {
  const api = useMemo(() => createApi(token), [token])
  const [paciente, setPaciente] = useState(null)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [ultimaHistoria, setUltimaHistoria] = useState(null)
  const [form, setForm] = useState({
    motivo_consulta: '',
    enfermedad_actual: '',
    antecedentes_personales: '',
    antecedentes_familiares: '',
    alergias: '',
    medicamentos_actuales: '',
    signos_vitales: '',
    examen_fisico: '',
    diagnostico: '',
    plan_manejo: '',
    ordenes_recomendaciones: '',
    evolucion_observaciones: ''
  })

  const medico = (() => {
    const raw = localStorage.getItem('usuario')
    return raw ? JSON.parse(raw) : null
  })()

  const formatearHistoriaParaApi = () => {
    const antecedentes = [
      `Antecedentes personales: ${form.antecedentes_personales || 'No refiere'}`,
      `Antecedentes familiares: ${form.antecedentes_familiares || 'No refiere'}`,
      `Alergias: ${form.alergias || 'No refiere'}`,
      `Medicamentos actuales: ${form.medicamentos_actuales || 'No refiere'}`
    ].join('\n')

    const examenFisico = [
      `Signos vitales: ${form.signos_vitales || 'No registrados'}`,
      `Examen físico: ${form.examen_fisico || 'No registrado'}`
    ].join('\n')

    const observaciones = [
      `Enfermedad actual: ${form.enfermedad_actual || 'No especificada'}`,
      `Órdenes y recomendaciones: ${form.ordenes_recomendaciones || 'Sin órdenes adicionales'}`,
      `Evolución/observaciones: ${form.evolucion_observaciones || 'Sin observaciones'}`
    ].join('\n')

    return {
      motivo_consulta: form.motivo_consulta,
      antecedentes,
      examen_fisico: examenFisico,
      diagnostico: form.diagnostico,
      tratamiento: form.plan_manejo,
      observaciones
    }
  }

  const guardarConsulta = async (event) => {
    event.preventDefault()
    setMsg('')
    setError('')

    if (!paciente) {
      setError('Debes seleccionar un paciente antes de guardar la consulta')
      return
    }

    try {
      const payload = formatearHistoriaParaApi()
      await api.post('/consultas', {
        ...payload,
        paciente_id: paciente.id
      })

      setUltimaHistoria({
        ...form,
        paciente,
        medico: medico?.nombre || 'Médico tratante',
        fecha: new Date().toISOString()
      })

      setMsg('Historia clinica guardada correctamente')
      setForm({
        motivo_consulta: '',
        enfermedad_actual: '',
        antecedentes_personales: '',
        antecedentes_familiares: '',
        alergias: '',
        medicamentos_actuales: '',
        signos_vitales: '',
        examen_fisico: '',
        diagnostico: '',
        plan_manejo: '',
        ordenes_recomendaciones: '',
        evolucion_observaciones: ''
      })
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar la consulta')
    }
  }

  const descargarPdfHistoria = () => {
    const historia = ultimaHistoria || {
      ...form,
      paciente,
      medico: medico?.nombre || 'Médico tratante',
      fecha: new Date().toISOString()
    }

    if (!historia?.paciente) {
      setError('Debes seleccionar un paciente para generar el PDF')
      return
    }

    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 16

    const addTitle = (text) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.text(text, 14, y)
      y += 8
    }

    const addField = (label, value) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(`${label}:`, 14, y)
      y += 5

      doc.setFont('helvetica', 'normal')
      const wrapped = doc.splitTextToSize(value || 'No registrado', pageWidth - 28)
      doc.text(wrapped, 14, y)
      y += (wrapped.length * 4.8) + 2

      if (y > 270) {
        doc.addPage()
        y = 16
      }
    }

    const fechaDocumento = new Date(historia.fecha).toLocaleString('es-CO')

    addTitle('Fundación Médica - Historia Clínica')
    addField('Fecha y hora', fechaDocumento)
    addField('Médico tratante', historia.medico)
    addField('Paciente', historia.paciente.nombre)
    addField('Documento', historia.paciente.cedula)
    addField('Fecha de nacimiento', historia.paciente.fecha_nacimiento ? new Date(historia.paciente.fecha_nacimiento).toLocaleDateString('es-CO') : 'No registrada')
    addField('Teléfono', historia.paciente.telefono || 'No registrado')
    addField('Email', historia.paciente.email || 'No registrado')

    addTitle('Anamnesis')
    addField('Motivo de consulta', historia.motivo_consulta)
    addField('Enfermedad actual', historia.enfermedad_actual)
    addField('Antecedentes personales', historia.antecedentes_personales)
    addField('Antecedentes familiares', historia.antecedentes_familiares)
    addField('Alergias', historia.alergias)
    addField('Medicamentos actuales', historia.medicamentos_actuales)

    addTitle('Examen y análisis')
    addField('Signos vitales', historia.signos_vitales)
    addField('Examen físico', historia.examen_fisico)
    addField('Diagnóstico', historia.diagnostico)

    addTitle('Plan terapéutico')
    addField('Plan de manejo', historia.plan_manejo)
    addField('Órdenes y recomendaciones', historia.ordenes_recomendaciones)
    addField('Evolución y observaciones', historia.evolucion_observaciones)

    doc.save(`historia-clinica-${historia.paciente.cedula}.pdf`)
    setMsg('PDF de historia clínica generado correctamente')
  }

  const pdfDisponible = Boolean(
    paciente &&
    (ultimaHistoria || (form.motivo_consulta && form.diagnostico && form.plan_manejo))
  )

  return (
    <div className="app-shell">
      <Topbar usuario={usuario} onLogout={onLogout} />

      <main className="main-content animate-in">

        {/* Encabezado de página */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Historia Clínica</h1>
            <p className="page-subtitle">Registro y seguimiento clínico del paciente</p>
          </div>
          <button
            type="button"
            className="btn-outline"
            disabled={!pdfDisponible}
            onClick={descargarPdfHistoria}
          >
            <FiDownload /> Descargar PDF
          </button>
        </div>

        {/* Selector de paciente */}
        <PacienteSelector api={api} onSelect={setPaciente} />

        {/* Formulario de historia clínica */}
        <div className="card">
          <div className="card-header">
            <h2>Formato estructurado — Historia Clínica</h2>
            {paciente && (
              <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontStyle: 'italic' }}>
                Paciente: {paciente.nombre}
              </span>
            )}
          </div>

          <form onSubmit={guardarConsulta} className="clinical-grid">

            {/* Anamnesis */}
            <div className="clinical-section full-span">
              <p className="clinical-section-title">Anamnesis</p>
              <div className="two-cols" style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(2,1fr)' }}>
                <label>
                  Motivo de consulta *
                  <textarea
                    required
                    placeholder="Describa el motivo principal de la consulta"
                    value={form.motivo_consulta}
                    onChange={(e) => setForm({ ...form, motivo_consulta: e.target.value })}
                  />
                </label>
                <label>
                  Enfermedad actual
                  <textarea
                    placeholder="Descripción cronológica del estado actual"
                    value={form.enfermedad_actual}
                    onChange={(e) => setForm({ ...form, enfermedad_actual: e.target.value })}
                  />
                </label>
              </div>
            </div>

            {/* Antecedentes */}
            <div className="clinical-section">
              <p className="clinical-section-title">Antecedentes</p>
              <label>
                Personales
                <textarea
                  placeholder="Enfermedades previas, cirugías, hospitalizaciones"
                  value={form.antecedentes_personales}
                  onChange={(e) => setForm({ ...form, antecedentes_personales: e.target.value })}
                />
              </label>
              <label>
                Familiares
                <textarea
                  placeholder="Enfermedades hereditarias relevantes"
                  value={form.antecedentes_familiares}
                  onChange={(e) => setForm({ ...form, antecedentes_familiares: e.target.value })}
                />
              </label>
            </div>

            {/* Riesgos y medicación */}
            <div className="clinical-section">
              <p className="clinical-section-title">Riesgos y medicación</p>
              <label>
                Alergias
                <textarea
                  placeholder="Alergias a medicamentos, alimentos u otros"
                  value={form.alergias}
                  onChange={(e) => setForm({ ...form, alergias: e.target.value })}
                />
              </label>
              <label>
                Medicamentos actuales
                <textarea
                  placeholder="Nombre, dosis y frecuencia"
                  value={form.medicamentos_actuales}
                  onChange={(e) => setForm({ ...form, medicamentos_actuales: e.target.value })}
                />
              </label>
            </div>

            {/* Examen clínico */}
            <div className="clinical-section">
              <p className="clinical-section-title">Examen clínico</p>
              <label>
                Signos vitales
                <textarea
                  placeholder="Ej: TA 120/80, FC 78 lpm, FR 16 rpm, T 36.7°C, SpO2 98%"
                  value={form.signos_vitales}
                  onChange={(e) => setForm({ ...form, signos_vitales: e.target.value })}
                />
              </label>
              <label>
                Examen físico
                <textarea
                  placeholder="Hallazgos por sistemas"
                  value={form.examen_fisico}
                  onChange={(e) => setForm({ ...form, examen_fisico: e.target.value })}
                />
              </label>
            </div>

            {/* Diagnóstico y plan */}
            <div className="clinical-section">
              <p className="clinical-section-title">Impresión diagnóstica y plan</p>
              <label>
                Diagnóstico *
                <textarea
                  required
                  placeholder="CIE-10 o descripción diagnóstica"
                  value={form.diagnostico}
                  onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
                />
              </label>
              <label>
                Plan de manejo / tratamiento *
                <textarea
                  required
                  placeholder="Tratamiento farmacológico y no farmacológico"
                  value={form.plan_manejo}
                  onChange={(e) => setForm({ ...form, plan_manejo: e.target.value })}
                />
              </label>
            </div>

            {/* Seguimiento */}
            <div className="clinical-section full-span">
              <p className="clinical-section-title">Seguimiento</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
                <label>
                  Órdenes y recomendaciones
                  <textarea
                    placeholder="Paraclínicos, interconsultas, recomendaciones"
                    value={form.ordenes_recomendaciones}
                    onChange={(e) => setForm({ ...form, ordenes_recomendaciones: e.target.value })}
                  />
                </label>
                <label>
                  Evolución y observaciones
                  <textarea
                    placeholder="Notas de evolución y observaciones adicionales"
                    value={form.evolucion_observaciones}
                    onChange={(e) => setForm({ ...form, evolucion_observaciones: e.target.value })}
                  />
                </label>
              </div>
            </div>

            {/* Botón guardar */}
            <div className="full-span" style={{ paddingTop: '4px' }}>
              <button type="submit" style={{ minWidth: '200px', padding: '12px 24px' }}>
                Guardar historia clínica
              </button>
            </div>

          </form>

          {error && (
            <p className="alert error dismissible" style={{ marginTop: '16px' }} onClick={() => setError('')}>
              {error}
            </p>
          )}
          {msg && (
            <p className="alert ok dismissible" style={{ marginTop: '16px' }} onClick={() => setMsg('')}>
              {msg}
            </p>
          )}
        </div>

      </main>
    </div>
  )
}

export default ConsultasPage
