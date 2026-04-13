require('./db')
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Permite recibir JSON y peticiones desde React
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
app.use(express.json())
const authRoutes = require('./routes/auth')
app.use('/api/auth', authRoutes)
const pacientesRoutes = require('./routes/pacientes')
app.use('/api/pacientes', pacientesRoutes)
const consultasRoutes = require('./routes/consultas')
app.use('/api/consultas', consultasRoutes)
const citasRoutes = require('./routes/citas')
app.use('/api/citas', citasRoutes)
const usuariosRoutes = require('./routes/usuarios')
app.use('/api/usuarios', usuariosRoutes)

app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor funcionando correctamente' })
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
