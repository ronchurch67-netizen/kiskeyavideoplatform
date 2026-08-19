import { createContext, useContext, useState, useMemo } from 'react'
import ht from './ht.json'
import en from './en.json'
import fr from './fr.json'
import es from './es.json'

export const LANGUAGES = [
  { code: 'ht', nativeName: 'Kreyòl Ayisyen' },
  { code: 'en', nativeName: 'English' },
  { code: 'fr', nativeName: 'Français' },
  { code: 'es', nativeName: 'Español' },
]

const TRANSLATIONS = { ht, en, fr, es }

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ht')

  const t = useMemo(() => {
    const dict = TRANSLATIONS[lang]
    return (key) => key.split('.').reduce((obj, part) => obj?.[part], dict) ?? key
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
