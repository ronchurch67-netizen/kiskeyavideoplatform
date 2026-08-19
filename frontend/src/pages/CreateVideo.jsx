import { useEffect, useState } from 'react'
import { useLanguage, LANGUAGES } from '../i18n'
import { PLANS, getPlan } from '../config/plans'
import { createProject, generateScript, generateVideo, VIDEO_BASE_URL } from '../services/api'

export default function CreateVideo() {
  const { t } = useLanguage()
  const [contentLanguage, setContentLanguage] = useState('ht')
  const [planId, setPlanId] = useState(PLANS[0].id)
  const [duration, setDuration] = useState(PLANS[0].minDuration)
  const [style, setStyle] = useState('realistic')
  const [prompt, setPrompt] = useState('')

  const [status, setStatus] = useState('idle') // idle | generating | done | error
  const [videoUrl, setVideoUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const plan = getPlan(planId)

  useEffect(() => {
    setDuration((d) => Math.min(Math.max(d, plan.minDuration), plan.maxDuration))
  }, [plan])

  async function handleGenerate(e) {
    e.preventDefault()
    setStatus('generating')
    setErrorMessage('')
    setVideoUrl('')

    try {
      const project = await createProject({
        ideaText: prompt,
        contentLanguage,
        style,
        durationSeconds: duration,
      })
      await generateScript(project.id)
      const finished = await generateVideo(project.id)

      setVideoUrl(`${VIDEO_BASE_URL}/${finished.videoFileName}`)
      setStatus('done')
    } catch (error) {
      setErrorMessage(error.message)
      setStatus('error')
    }
  }

  return (
    <section className="page">
      <h1>{t('createVideo.title')}</h1>
      <form className="create-video-form" onSubmit={handleGenerate}>
        <label>
          {t('createVideo.promptLabel')}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('createVideo.promptPlaceholder')}
            rows={5}
          />
        </label>

        <label>
          {t('createVideo.languageLabel')}
          <select value={contentLanguage} onChange={(e) => setContentLanguage(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="plan-picker">
          <legend>{t('createVideo.planLabel')}</legend>
          <div className="plan-options">
            {PLANS.map((p) => (
              <label key={p.id} className="plan-option">
                <input
                  type="radio"
                  name="plan"
                  value={p.id}
                  checked={planId === p.id}
                  onChange={(e) => setPlanId(e.target.value)}
                />
                {t(p.labelKey)} ({p.minDuration}–{p.maxDuration} {t('createVideo.secondsUnit')})
              </label>
            ))}
          </div>
          <p className="field-hint">{t('createVideo.planNote')}</p>
        </fieldset>

        <label>
          {t('createVideo.durationLabel')} — {duration} {t('createVideo.secondsUnit')}
          <input
            type="range"
            min={plan.minDuration}
            max={plan.maxDuration}
            step={1}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </label>

        <label>
          {t('createVideo.styleLabel')}
          <select value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="realistic">{t('createVideo.styleRealistic')}</option>
            <option value="animated">{t('createVideo.styleAnimated')}</option>
            <option value="cinematic">{t('createVideo.styleCinematic')}</option>
            <option value="whiteboard">{t('createVideo.styleWhiteboard')}</option>
          </select>
        </label>

        <button type="submit" disabled={status === 'generating'}>
          {status === 'generating' ? t('createVideo.generating') : t('createVideo.generateButton')}
        </button>
      </form>

      {status === 'generating' && <p className="generation-status">{t('createVideo.generatingHint')}</p>}
      {status === 'error' && <p className="generation-error">{errorMessage}</p>}
      {status === 'done' && (
        <div className="video-preview">
          <video controls src={videoUrl} />
        </div>
      )}
    </section>
  )
}
