const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
})

pool.connect()
  .then(() => console.log('Conectado a la base de datos ✓'))
  .catch(err => console.error('Error conectando a la BD:', err))

module.exports = pool