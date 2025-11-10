import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Translations } from '../types/translations';
import { englishTranslations } from './translations/en';
import { bulgarianTranslations } from './translations/bg';

type Language = 'en' | 'bg';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const translations: Record<Language, Translations> = {
  en: englishTranslations,
  bg: bulgarianTranslations,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('bg'); // Default to Bulgarian

  useEffect(() => {
    const savedLanguage = localStorage.getItem('tournament-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'bg')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('tournament-language', lang);
  };

  const t = translations[language];

  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};