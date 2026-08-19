import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n'
import { useAuth } from '../auth'
import { login as loginRequest } from '../services/api'

export default function Login() {
  const { t } = useLanguage()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginRequest({ email, password })
      login(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page">
      <h1>{t('auth.loginTitle')}</h1>
      <form className="create-video-form" onSubmit={handleSubmit}>
        <label>
          {t('auth.emailLabel')}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          {t('auth.passwordLabel')}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={loading}>
          {t('auth.loginButton')}
        </button>
      </form>
      {error && <p className="generation-error">{error}</p>}
      <p className="field-hint">
        {t('auth.noAccount')} <Link to="/register">{t('auth.registerLink')}</Link>
      </p>
    </section>
  )
}
