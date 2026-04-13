const bcrypt = require('bcryptjs')
const db = require('../config/db')

async function crearAdmin() {
  const nombre = process.argv[2] || 'Administrador Principal'
  const email = process.argv[3] || 'admin@fundacion.com'
  const documento = process.argv[4] || '1234567890'

  try {
    const password = await bcrypt.hash(String(documento), 10)

    await db.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
      [nombre, email, password, 'admin']
    )

    console.log('Admin creado correctamente')
    console.log(`Email: ${email}`)
    console.log(`Contrasena inicial (documento): ${documento}`)
    process.exit(0)
  } catch (err) {
    if (err.code === '23505') {
      console.error('Ya existe un usuario con ese email')
    } else {
      console.error('No se pudo crear el admin:', err.message)
    }
    process.exit(1)
  }
}

crearAdmin()
