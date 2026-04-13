const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { authRequired } = require('../middleware/auth')

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contrasena son requeridos' })
    }
  
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email])

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' })
    }

    const usuario = result.rows[0]

   
    const passwordValida = await bcrypt.compare(password, usuario.password)

    if (!passwordValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' })
    }
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    })

  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
})

router.get('/me', authRequired, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
})

module.exports = router