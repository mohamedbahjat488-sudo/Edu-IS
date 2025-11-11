import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppContextType, Language, Theme, UserRole } from '../types';
import { translations } from '../constants/translations';

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('light');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    try {
      const storedAuth = sessionStorage.getItem('auth');
      if (storedAuth) {
        const { isAuthenticated, userRole } = JSON.parse(storedAuth);
        if (isAuthenticated) {
          setIsAuthenticated(true);
          setUserRole(userRole);
        }
      }
    } catch (error) {
        console.error("Failed to parse auth from sessionStorage", error);
        sessionStorage.removeItem('auth');
    }

    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
       const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
       setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // FIX: Update `t` function to handle placeholder replacements.
  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    let translation = translations[language][key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([rKey, value]) => {
        translation = translation.replace(new RegExp(`\\{${rKey}\\}`, 'g'), String(value));
      });
    }
    return translation;
  }, [language]);

  const login = async (username: string, password: string): Promise<void> => {
    const adminUser = 'Broce';
    const adminPass = '1964';
    
    const trimmedUsername = username.trim();

    // Admin login
    if (trimmedUsername.toLowerCase() === adminUser.toLowerCase() && password === adminPass) {
      const role: UserRole = 'admin';
      setUserRole(role);
      setIsAuthenticated(true);
      sessionStorage.setItem('auth', JSON.stringify({ isAuthenticated: true, userRole: role }));
      return;
    }
    
    // Student login: any username (except admin) and non-empty password will work
    if (trimmedUsername.toLowerCase() !== adminUser.toLowerCase() && trimmedUsername !== '' && password !== '') {
      try {
        const attempts = JSON.parse(localStorage.getItem('studentLoginAttempts') || '[]');
        const newAttempt = { username: trimmedUsername, password, timestamp: new Date().toISOString() };
        attempts.unshift(newAttempt); // Add to the beginning
        localStorage.setItem('studentLoginAttempts', JSON.stringify(attempts.slice(0, 100))); // Store max 100 attempts
      } catch (e) {
        console.error("Could not save student login attempt:", e);
      }

      const role: UserRole = 'student';
      setUserRole(role);
      setIsAuthenticated(true);
      sessionStorage.setItem('auth', JSON.stringify({ isAuthenticated: true, userRole: role }));
      return;
    }
    
    throw new Error('Invalid credentials');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    sessionStorage.removeItem('auth');
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, toggleTheme, t, isAuthenticated, userRole, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};