import React from 'react';
import { useI18n } from './I18nContext';

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { language, setLanguage } = useI18n();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-300">Language:</span>
      <div className="flex bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setLanguage('bg')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            language === 'bg'
              ? 'bg-yellow-500 text-gray-900'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          BG
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            language === 'en'
              ? 'bg-yellow-500 text-gray-900'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;