import 'dotenv/config'

export const PORT = process.env.PORT || 4000
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

export const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET pa konfigire nan .env')
}
