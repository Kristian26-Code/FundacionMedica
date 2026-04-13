const jwt = require('jsonwebtoken')

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token invalido o expirado' })
  }
}

function requireMedico(req, res, next) {
  if (!req.user || req.user.rol !== 'medico') {
    return res.status(403).json({ error: 'Solo medicos autorizados' })
  }

  next()
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores autorizados' })
  }

  next()
}

module.exports = { authRequired, requireMedico, requireAdmin }
