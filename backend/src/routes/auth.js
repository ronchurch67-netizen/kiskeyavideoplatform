import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../../../database/db.js'
import { JWT_SECRET } from '../config/env.js'
import { authLimiter } from '../middleware/rateLimit.js'

const router = Router()
router.use(authLimiter)

function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

router.post('/register', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Imel obligatwa, modpas dwe gen omwen 8 karaktè.' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    return res.status(409).json({ error: 'Gen yon kont ki deja itilize imel sa a.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const result = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, passwordHash)

  const token = createToken(result.lastInsertRowid)
  res.status(201).json({ token, user: { id: result.lastInsertRowid, email } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Imel ak modpas obligatwa.' })
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user) {
    return res.status(401).json({ error: 'Imel oswa modpas pa kòrèk.' })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: 'Imel oswa modpas pa kòrèk.' })
  }

  const token = createToken(user.id)
  res.json({ token, user: { id: user.id, email: user.email } })
})

export default router
