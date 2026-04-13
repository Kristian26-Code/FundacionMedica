const bcrypt = require('bcryptjs')
const db = require('../config/db')

async function crearUsuario() {
  const password = await bcrypt.hash('admin1234', 10)
  
  await db.query(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
    ['Dr. García', 'doctor@fundacion.com', password, 'medico']
  )
  
  console.log('Usuario creado correctamente ✓')
  process.exit()
}

crearUsuario()