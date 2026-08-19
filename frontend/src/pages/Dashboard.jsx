import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n'
import { listProjects } from '../services/api'

export default function Dashboard() {
  const { t } = useLanguage()
  const [projects, setProjects] = useState([])
  const [status, setStatus] = useState('loading') // loading | done | error
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    listProjects()
      .then((data) => {
        setProjects(data)
        setStatus('done')
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setStatus('error')
      })
  }, [])

  return (
    <section className="page">
      <h1>{t('dashboard.title')}</h1>

      {status === 'loading' && <p className="empty-state">{t('dashboard.loading')}</p>}
      {status === 'error' && <p className="generation-error">{errorMessage}</p>}
      {status === 'done' && projects.length === 0 && <p className="empty-state">{t('dashboard.empty')}</p>}

      {status === 'done' && projects.length > 0 && (
        <ul className="project-list">
          {projects.map((project) => (
            <li key={project.id} className="project-card">
              <Link to={`/projects/${project.id}`} className="project-card-link">
                <span className="project-card-title">{project.title}</span>
                <span className={`status-badge status-${project.status}`}>
                  {t(`dashboard.status.${project.status}`)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
