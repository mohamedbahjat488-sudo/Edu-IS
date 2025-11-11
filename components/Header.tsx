
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Icon } from './Icon';

interface HeaderProps {
    title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { theme, toggleTheme, t } = useAppContext();

  return (
    <header className="bg-surface-light dark:bg-surface-dark shadow-sm sticky top-0 z-10 p-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-primary dark:text-secondary-light">{title}</h1>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-secondary dark:hover:bg-slate-700 transition-colors"
        aria-label={t('theme')}
      >
        <Icon name={theme === 'light' ? 'moon' : 'sun'} className="w-6 h-6" />
      </button>
    </header>
  );
};
