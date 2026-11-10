import React, { createContext, useContext, useState, useEffect } from 'react';
import { INDIAN_LANGUAGES } from '../i18n/languages';
import { TRANSLATIONS } from '../i18n/translations';
import { EXTRA_TRANSLATIONS } from '../i18n/extraTranslations';

// Merge extra translations into TRANSLATIONS once
for (const lang of Object.keys(EXTRA_TRANSLATIONS)) {
  if (!TRANSLATIONS[lang]) TRANSLATIONS[lang] = {};
  for (const section of Object.keys(EXTRA_TRANSLATIONS[lang])) {
    TRANSLATIONS[lang][section] = {
      ...(TRANSLATIONS[lang][section] || {}),
      ...EXTRA_TRANSLATIONS[lang][section]
    };
  }
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [currentCode, setCurrentCode] = useState(() => {
    try {
      const saved = localStorage.getItem('irctc_lang');
      if (saved && INDIAN_LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
    } catch (e) {
      // localStorage disabled or SSR
    }
    return 'en';
  });

  const selectedLang = INDIAN_LANGUAGES.find(l => l.code === currentCode) || INDIAN_LANGUAGES[0];

  const setLanguage = (langOrCode) => {
    const code = typeof langOrCode === 'string' ? langOrCode : langOrCode?.code;
    if (code && INDIAN_LANGUAGES.some(l => l.code === code)) {
      setCurrentCode(code);
      try {
        localStorage.setItem('irctc_lang', code);
      } catch (e) {
        // Ignore storage errors
      }
    }
  };

  /**
   * Helper function to get translation by dot notation path
   * e.g. t('hero.heading', 'Default fallback')
   */
  const t = (path, fallback = '') => {
    if (!path) return fallback;
    const parts = path.split('.');

    // Try current language first
    const langDict = TRANSLATIONS[currentCode] || {};
    let val = langDict;
    for (const part of parts) {
      if (val && typeof val === 'object' && part in val) {
        val = val[part];
      } else {
        val = null;
        break;
      }
    }

    if (val !== null && val !== undefined) {
      return val;
    }

    // Fall back to English
    const enDict = TRANSLATIONS.en || {};
    let enVal = enDict;
    for (const part of parts) {
      if (enVal && typeof enVal === 'object' && part in enVal) {
        enVal = enVal[part];
      } else {
        enVal = null;
        break;
      }
    }

    if (enVal !== null && enVal !== undefined) {
      return enVal;
    }

    return fallback || path;
  };

  return (
    <LanguageContext.Provider value={{
      language: currentCode,
      selectedLang,
      setLanguage,
      t,
      languages: INDIAN_LANGUAGES
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
