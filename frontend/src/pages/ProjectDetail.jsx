import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../i18n'
import { getProject, VIDEO_BASE_URL } from '../services/api'

export default function ProjectDetail() {
  const { t } = useLanguage()
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [status, setStatus] = useState('loading') // loading | done | error
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setStatus('loading')
    getProject(id)
      .then((data) => {
        setProject(data)
        setStatus('done')
      })
      .catch((error) => {
        setErrorMessage(error.message)
        setStatus('error')
      })
  }, [id])

  return (
    <section className="page">
      <Link to="/" className="back-link">
        ← {t('nav.dashboard')}
      </Link>

      {status === 'loading' && <p className="empty-state">{t('dashboard.loading')}</p>}
      {status === 'error' && <p className="generation-error">{errorMessage}</p>}

      {status === 'done' && project && (
        <>
          <h1>{project.title}</h1>
          <span className={`status-badge status-${project.status}`}>
            {t(`dashboard.status.${project.status}`)}
          </span>
          <p className="project-idea">{project.ideaText}</p>

          {project.videoFileName ? (
            <div className="video-preview">
              <video controls src={`${VIDEO_BASE_URL}/${project.videoFileName}`} />
            </div>
          ) : (
            <p className="empty-state">{t('projectDetail.noVideo')}</p>
          )}
        </>
      )}
    </section>
  )
}
