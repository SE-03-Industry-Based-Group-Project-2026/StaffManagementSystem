import React, { createContext, useState, useContext, useEffect } from 'react';

// Import language files
import en from '../locales/en.json';
import si from '../locales/si.json';
import ta from '../locales/ta.json';

const translations = { en, si, ta };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language === 'si' ? 'si' : language === 'ta' ? 'ta' : 'en';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}