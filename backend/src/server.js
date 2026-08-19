import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { PORT, FRONTEND_URL } from './config/env.js'
import projectsRouter from './routes/projects.js'
import authRouter from './routes/auth.js'
import { generalLimiter } from './middleware/rateLimit.js'

const app = express()

app.use(cors({ origin: FRONTEND_URL }))
// Limit ogmante paske foto itilizatè (image-to-video) voye an base64 nan JSON.
app.use(express.json({ limit: '15mb' }))
app.use('/api', generalLimiter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/projects', projectsRouter)

// Sèvi videyo final yo dirèkteman pou Frontend lan ka preview yo.
app.use('/media/videos', express.static(path.resolve('../storage/videos')))

app.listen(PORT, () => {
  console.log(`Backend ap koute sou pò ${PORT}`)
})
