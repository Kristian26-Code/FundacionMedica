const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../config/db')
const { authRequired, requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.use(authRequired, requireAdmin)

router.get('/', async (_req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nombre, email, rol FROM usuarios ORDER BY id DESC'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'No se pudo listar los usuarios' })
  }
})

router.post('/', async (req, res) => {
  const { nombre, email, documento } = req.body

  if (!nombre || !email || !documento) {
    return res.status(400).json({
      error: 'Nombre, email y documento son requeridos'
    })
  }

  try {
    const passwordHash = await bcrypt.hash(String(documento), 10)

    const result = await db.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol',
      [nombre, email, passwordHash, 'medico']
    )

    res.status(201).json({
      mensaje: 'Usuario creado correctamente',
      usuario: result.rows[0]
    })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' })
    }

    res.status(500).json({ error: 'No se pudo crear el usuario' })
  }
})

router.put('/:id/reset-password', async (req, res) => {
  const { id } = req.params
  const { documento } = req.body

  if (!documento) {
    return res.status(400).json({ error: 'El documento es requerido para resetear la contraseña' })
  }

  try {
    const passwordHash = await bcrypt.hash(String(documento), 10)

    const result = await db.query(
      'UPDATE usuarios SET password = $1 WHERE id = $2 RETURNING id, nombre, email, rol',
      [passwordHash, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json({
      mensaje: 'Contraseña reseteada correctamente',
      usuario: result.rows[0]
    })
  } catch (err) {
    res.status(500).json({ error: 'No se pudo resetear la contraseña' })
  }
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params

  if (String(req.user.id) === String(id)) {
    return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' })
  }

  try {
    const result = await db.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id, nombre, email, rol',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json({
      mensaje: 'Usuario eliminado correctamente',
      usuario: result.rows[0]
    })
  } catch (err) {
    res.status(500).json({ error: 'No se pudo eliminar el usuario' })
  }
})

module.exports = router
