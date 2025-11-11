import React from 'react';
import { ActiveScreen } from '../types';
import { Icon } from './Icon';
import { useAppContext } from '../hooks/useAppContext';

interface BottomNavProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
}

interface NavItemProps {
  screen: ActiveScreen;
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ screen, label, icon, isActive, onClick }) => {
    const activeClass = 'text-primary dark:text-secondary-light';
    const inactiveClass = 'text-text-secondary-light dark:text-text-secondary-dark';

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center flex-1 p-2 transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`}
            aria-label={label}
        >
            <Icon name={icon} className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
};


export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  const { t, userRole } = useAppContext();
  
  const navItems = [
    { screen: 'home' as ActiveScreen, label: t('home'), icon: 'home' },
    { screen: 'course' as ActiveScreen, label: t('course'), icon: 'course' },
    { screen: 'solve' as ActiveScreen, label: t('solve'), icon: 'solve' },
    { screen: 'quiz' as ActiveScreen, label: t('quiz'), icon: 'quiz' },
    { screen: 'summaries' as ActiveScreen, label: t('summaries'), icon: 'summaries' },
    { screen: 'formulas' as ActiveScreen, label: t('formulas'), icon: 'formulas' },
    ...(userRole === 'admin' ? [{ screen: 'admin' as ActiveScreen, label: t('admin'), icon: 'admin' }] : []),
    { screen: 'profile' as ActiveScreen, label: t('profile'), icon: 'profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-secondary-dark dark:border-slate-700 flex justify-around shadow-lg">
      {navItems.map((item) => (
        <NavItem
          key={item.screen}
          screen={item.screen}
          label={item.label}
          icon={item.icon}
          isActive={activeScreen === item.screen}
          onClick={() => setActiveScreen(item.screen)}
        />
      ))}
    </nav>
  );
};