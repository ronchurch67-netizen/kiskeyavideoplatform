import Database from 'better-sqlite3'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const db = new Database(path.join(__dirname, 'data.sqlite'))
db.pragma('journal_mode = WAL')

const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
db.exec(schema)
