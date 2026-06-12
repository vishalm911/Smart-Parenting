import { createContext, useContext, useState, useCallback } from 'react';
import en from './en';
import hi from './hi';
import mr from './mr';

const translations = { en, hi, mr };
const LANG_KEY = 'spacece_language';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLang] = useState(() => {
    try {
      return localStorage.getItem(LANG_KEY) || 'en';
    } catch { return 'en'; }
  });

  const setLanguage = useCallback((lang) => {
    setLang(lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch {}
  }, []);

  /**
   * Translate key with optional interpolation.
   * t('greeting', { name: 'Arjun' }) → "Hello, Arjun!"
   */
  const t = useCallback((key, params) => {
    const dict = translations[language] || translations.en;
    let text = dict[key] ?? translations.en[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }
    return text;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, languages: ['en', 'hi', 'mr'] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
}

export const languageLabels = { en: 'EN', hi: 'हि', mr: 'मर' };
export const languageNames = { en: 'English', hi: 'हिन्दी', mr: 'मराठी' };
