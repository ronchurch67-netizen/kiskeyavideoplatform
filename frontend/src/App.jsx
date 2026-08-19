import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './i18n'
import { AuthProvider, useAuth } from './auth'
import LanguageSelector from './components/LanguageSelector'
import Dashboard from './pages/Dashboard'
import CreateVideo from './pages/CreateVideo'
import ProjectDetail from './pages/ProjectDetail'
import Login from './pages/Login'
import Register from './pages/Register'

function RequireAuth({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

function Header() {
  const { t } = useLanguage()
  const { user, logout } = useAuth()

  return (
    <header className="app-header">
      <span className="app-name">{t('app.name')}</span>
      {user && (
        <nav>
          <NavLink to="/" end>
            {t('nav.dashboard')}
          </NavLink>
          <NavLink to="/create">{t('nav.createVideo')}</NavLink>
        </nav>
      )}
      <LanguageSelector />
      {user ? (
        <button type="button" className="logout-button" onClick={logout}>
          {t('auth.logoutButton')}
        </button>
      ) : (
        <NavLink to="/login">{t('auth.loginButton')}</NavLink>
      )}
    </header>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/create"
                element={
                  <RequireAuth>
                    <CreateVideo />
                  </RequireAuth>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <RequireAuth>
                    <ProjectDetail />
                  </RequireAuth>
                }
              />
            </Routes>
          </main>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
