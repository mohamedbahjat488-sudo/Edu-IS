import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Language } from '../types';
import { Icon } from '../components/Icon';

export const ProfileScreen: React.FC = () => {
  const { language, setLanguage, theme, toggleTheme, t, logout } = useAppContext();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="p-6">
        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-6">{t('profileTitle')}</h2>
        
        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg shadow-md mb-6">
            <label className="text-lg font-semibold text-text-light dark:text-text-dark">{t('language')}</label>
            <div className="mt-2 flex space-x-2 rtl:space-x-reverse">
                <button 
                    onClick={() => handleLanguageChange('ar')}
                    className={`flex-1 p-3 rounded-md transition-colors ${language === 'ar' ? 'bg-primary text-white' : 'bg-secondary dark:bg-slate-700'}`}
                >
                    {t('arabic')}
                </button>
                <button 
                    onClick={() => handleLanguageChange('en')}
                    className={`flex-1 p-3 rounded-md transition-colors ${language === 'en' ? 'bg-primary text-white' : 'bg-secondary dark:bg-slate-700'}`}
                >
                    {t('english')}
                </button>
            </div>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg shadow-md mb-6">
            <label className="text-lg font-semibold text-text-light dark:text-text-dark">{t('theme')}</label>
            <div className="mt-2 flex items-center justify-between bg-secondary dark:bg-slate-700 rounded-lg p-2">
                <span className="flex items-center text-text-secondary-light dark:text-text-secondary-dark">
                    <Icon name="sun" className="w-5 h-5 me-2"/> {t('light')}
                </span>
                <button
                    onClick={toggleTheme}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}
                >
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'}`}
                    />
                </button>
                 <span className="flex items-center text-text-secondary-light dark:text-text-secondary-dark">
                    <Icon name="moon" className="w-5 h-5 me-2"/> {t('dark')}
                </span>
            </div>
        </div>

        <div className="mt-8">
            <button
                onClick={logout}
                className="w-full flex items-center justify-center p-3 rounded-lg bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors font-semibold"
            >
                <Icon name="logout" className="w-5 h-5 me-2" />
                <span>{t('logout')}</span>
            </button>
        </div>
    </div>
  );
};