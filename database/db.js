import Database from 'better-sqlite3'
import { readFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Lokalman, fichye a rete la a menm (database/data.sqlite). Sou Railway,
// DATA_DIR pwente sou yon disk pèsistan ki pa efase chak deplwaman.
const dataDir = process.env.DATA_DIR || __dirname
mkdirSync(dataDir, { recursive: true })

export const db = new Database(path.join(dataDir, 'data.sqlite'))
db.pragma('journal_mode = WAL')

const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
db.exec(schema)
