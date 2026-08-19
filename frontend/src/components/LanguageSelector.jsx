import { useLanguage, LANGUAGES } from '../i18n'

export default function LanguageSelector() {
  const { lang, setLang, t } = useLanguage()

  return (
    <label className="language-selector">
      <span className="visually-hidden">{t('languageSelector.label')}</span>
      <select value={lang} onChange={(e) => setLang(e.target.value)}>
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeName}
          </option>
        ))}
      </select>
    </label>
  )
}
