import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Ou dwe konekte pou fè sa.' })
  }

  try {
    const token = header.slice('Bearer '.length)
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ error: 'Sesyon ou ekspire oswa envalid — konekte ankò.' })
  }
}
