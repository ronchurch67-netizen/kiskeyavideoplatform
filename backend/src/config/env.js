import 'dotenv/config'
import path from 'node:path'

export const PORT = process.env.PORT || 4000
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

export const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET pa konfigire nan .env')
}

// Lokalman, storage/ se yon dosye frè backend/ (../storage). Sou Railway,
// DATA_DIR pwente sou yon disk pèsistan ki pa efase chak deplwaman.
const DATA_DIR = process.env.DATA_DIR

export function storagePath(...segments) {
  const base = DATA_DIR ? path.join(DATA_DIR, 'storage') : path.resolve('../storage')
  return path.join(base, ...segments)
}
