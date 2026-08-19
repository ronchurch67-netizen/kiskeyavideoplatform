import { Router } from 'express'
import { generateScript } from '../../../services/ai-provider/claudeProvider.js'
import { runVideoPipeline } from '../pipeline/generateVideo.js'
import { requireAuth } from '../middleware/auth.js'
import { generationLimiter } from '../middleware/rateLimit.js'
import { db } from '../../../database/db.js'

const router = Router()

// Kling (Video Provider aktif la) pa aksepte klip pi kout pase 3 segond.
const MIN_DURATION_SECONDS = 3

// Tout wout pwojè yo mande yon itilizatè konekte, e chak pwojè mare ak
// user_id li — pa gen aksè kwaze ant kont.
router.use(requireAuth)

function mapRow(row) {
  return {
    id: String(row.id),
    title: row.title,
    ideaText: row.idea_text,
    contentLanguage: row.content_language,
    style: row.style,
    durationSeconds: row.duration_seconds,
    status: row.status,
    scenes: row.scenes_json ? JSON.parse(row.scenes_json) : undefined,
    videoFileName: row.video_file_name || undefined,
  }
}

function findOwnedProject(id, userId) {
  return db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(id, userId)
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC').all(req.userId)
  res.json(rows.map(mapRow))
})

router.post('/', (req, res) => {
  const { title, ideaText, contentLanguage, style, durationSeconds } = req.body

  if (!ideaText || !contentLanguage || !durationSeconds) {
    return res.status(400).json({ error: 'ideaText, contentLanguage, ak durationSeconds obligatwa.' })
  }

  if (durationSeconds < MIN_DURATION_SECONDS) {
    return res.status(400).json({ error: `durationSeconds dwe omwen ${MIN_DURATION_SECONDS} segond.` })
  }

  const result = db
    .prepare(
      `INSERT INTO projects (user_id, title, idea_text, content_language, style, duration_seconds, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`
    )
    .run(req.userId, title || ideaText.slice(0, 40), ideaText, contentLanguage, style || 'realistic', durationSeconds)

  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(mapRow(row))
})

router.get('/:id', (req, res) => {
  const row = findOwnedProject(req.params.id, req.userId)

  if (!row) {
    return res.status(404).json({ error: 'Pwojè a pa jwenn.' })
  }

  res.json(mapRow(row))
})

router.post('/:id/script', generationLimiter, async (req, res) => {
  const row = findOwnedProject(req.params.id, req.userId)

  if (!row) {
    return res.status(404).json({ error: 'Pwojè a pa jwenn.' })
  }

  try {
    const { title, scenes } = await generateScript({
      ideaText: row.idea_text,
      contentLanguage: row.content_language,
      durationSeconds: row.duration_seconds,
      style: row.style,
    })

    db.prepare(
      `UPDATE projects SET title = ?, scenes_json = ?, status = 'script_ready', updated_at = datetime('now')
       WHERE id = ?`
    ).run(title, JSON.stringify(scenes), row.id)

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(row.id)
    res.json(mapRow(updated))
  } catch (error) {
    console.error(error)
    res.status(502).json({ error: error.message })
  }
})

router.post('/:id/generate', generationLimiter, async (req, res) => {
  const row = findOwnedProject(req.params.id, req.userId)

  if (!row) {
    return res.status(404).json({ error: 'Pwojè a pa jwenn.' })
  }

  if (!row.scenes_json) {
    return res.status(400).json({ error: 'Jenere script anvan (POST .../script) anvan ou lanse pipeline a.' })
  }

  db.prepare("UPDATE projects SET status = 'processing', updated_at = datetime('now') WHERE id = ?").run(row.id)

  try {
    const { fileName } = await runVideoPipeline(mapRow(row))

    db.prepare(
      `UPDATE projects SET status = 'completed', video_file_name = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(fileName, row.id)

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(row.id)
    res.json(mapRow(updated))
  } catch (error) {
    console.error(error)
    db.prepare("UPDATE projects SET status = 'failed', updated_at = datetime('now') WHERE id = ?").run(row.id)
    res.status(502).json({ error: error.message })
  }
})

export default router
