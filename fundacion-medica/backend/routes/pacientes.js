const express = require('express')
const router = express.Router()
const db = require('../config/db')
const { authRequired, requireMedico } = require('../middleware/auth')

router.use(authRequired, requireMedico)

// Buscar paciente por cédula
router.get('/cedula/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params
    const result = await db.query('SELECT * FROM pacientes WHERE cedula = $1', [cedula])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' })
    }

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
})


router.post('/', async (req, res) => {
  try {
    const { nombre, cedula, fecha_nacimiento, telefono, email } = req.body

    if (!nombre || !cedula || !fecha_nacimiento) {
      return res.status(400).json({
        error: 'nombre, cedula y fecha_nacimiento son requeridos'
      })
    }

    const result = await db.query(
      'INSERT INTO pacientes (nombre, cedula, fecha_nacimiento, telefono, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, cedula, fecha_nacimiento, telefono, email]
    )

    res.json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Ya existe un paciente con ese documento' })
    } else {
      res.status(500).json({ error: 'Error en el servidor' })
    }
  }
})

module.exports = router