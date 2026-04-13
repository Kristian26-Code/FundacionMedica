const express = require('express')
const router = express.Router()
const db = require('../config/db')
const { authRequired, requireMedico } = require('../middleware/auth')

router.use(authRequired, requireMedico)

// Crear consulta
router.post('/', async (req, res) => {
  try {
    const {
      paciente_id,
      motivo_consulta,
      antecedentes,
      examen_fisico,
      diagnostico,
      tratamiento,
      observaciones
    } = req.body

    if (!paciente_id || !motivo_consulta || !diagnostico || !tratamiento) {
      return res.status(400).json({
        error: 'paciente_id, motivo_consulta, diagnostico y tratamiento son requeridos'
      })
    }

    const medicoId = req.user.id

    const result = await db.query(
      `INSERT INTO consultas 
        (paciente_id, usuario_id, motivo_consulta, antecedentes, examen_fisico, diagnostico, tratamiento, observaciones) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [paciente_id, medicoId, motivo_consulta, antecedentes, examen_fisico, diagnostico, tratamiento, observaciones]
    )

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
})


router.get('/paciente/:paciente_id', async (req, res) => {
  try {
    const { paciente_id } = req.params

    const result = await db.query(
      `SELECT consultas.*, pacientes.nombre AS paciente, usuarios.nombre AS medico
       FROM consultas
       JOIN pacientes ON consultas.paciente_id = pacientes.id
       JOIN usuarios ON consultas.usuario_id = usuarios.id
       WHERE consultas.paciente_id = $1
       ORDER BY fecha DESC`,
      [paciente_id]
    )

    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
})


router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query(
      `SELECT consultas.*, pacientes.nombre AS paciente, pacientes.cedula,
              usuarios.nombre AS medico
       FROM consultas
       JOIN pacientes ON consultas.paciente_id = pacientes.id
       JOIN usuarios ON consultas.usuario_id = usuarios.id
       WHERE consultas.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consulta no encontrada' })
    }

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
})

module.exports = router