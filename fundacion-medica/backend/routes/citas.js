const express = require('express')
const router = express.Router()
const db = require('../db')
const { authRequired, requireMedico } = require('../middleware/auth')

router.use(authRequired, requireMedico)

// Agendar cita
router.post('/', async (req, res) => {
  try {
    const { paciente_id, fecha_cita, motivo } = req.body

    if (!paciente_id || !fecha_cita || !motivo) {
      return res.status(400).json({ error: 'paciente_id, fecha_cita y motivo son requeridos' })
    }

    const medicoId = req.user.id

    const result = await db.query(
      `INSERT INTO citas (paciente_id, usuario_id, fecha_cita, motivo) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [paciente_id, medicoId, fecha_cita, motivo]
    )



    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
})


router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT citas.*, pacientes.nombre AS paciente, pacientes.email AS email_paciente,
              usuarios.nombre AS medico
       FROM citas
       JOIN pacientes ON citas.paciente_id = pacientes.id
       JOIN usuarios ON citas.usuario_id = usuarios.id
       ORDER BY fecha_cita ASC`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
})


router.get('/paciente/:paciente_id', async (req, res) => {
  try {
    const { paciente_id } = req.params
    const result = await db.query(
      `SELECT citas.*, usuarios.nombre AS medico
       FROM citas
       JOIN usuarios ON citas.usuario_id = usuarios.id
       WHERE citas.paciente_id = $1
       ORDER BY fecha_cita ASC`,
      [paciente_id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
})


router.put('/:id/cancelar', async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query(
      `UPDATE citas SET estado = 'cancelada' WHERE id = $1 RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' })
    }

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
})

router.put('/:id/cumplir', async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query(
      `UPDATE citas
       SET estado = 'cumplida'
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' })
    }

    return res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
})

router.put('/:id/no-asistida', async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query(
      `UPDATE citas
       SET estado = 'no asistida'
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' })
    }

    return res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
})

router.delete('/paciente/:paciente_id/historial', async (req, res) => {
  try {
    const { paciente_id } = req.params

    const result = await db.query(
      `DELETE FROM citas WHERE paciente_id = $1`,
      [paciente_id]
    )

    return res.json({
      mensaje: 'Historial de citas eliminado correctamente',
      eliminadas: result.rowCount
    })
  } catch (err) {
    return res.status(500).json({ error: 'Error en el servidor' })
  }
})

module.exports = router