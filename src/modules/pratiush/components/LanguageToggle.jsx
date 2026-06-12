import { useTranslation, languageLabels } from '../i18n';
import './LanguageToggle.css';

export default function LanguageToggle({ compact = false }) {
  const { language, setLanguage, languages } = useTranslation();

  return (
    <div className={`lang-toggle ${compact ? 'compact' : ''}`} id="language-toggle">
      {languages.map(lang => (
        <button
          key={lang}
          className={`lang-btn ${language === lang ? 'active' : ''}`}
          onClick={() => setLanguage(lang)}
          aria-label={`Switch to ${lang}`}
        >
          {languageLabels[lang]}
        </button>
      ))}
    </div>
  );
}
