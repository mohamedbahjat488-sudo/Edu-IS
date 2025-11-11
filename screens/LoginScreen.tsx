import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Icon } from '../components/Icon';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const LoginScreen: React.FC = () => {
  const { t, login } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(username, password);
      // On success, AppContext will update state and App.tsx will re-render
    } catch (err) {
      setError(t('loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <Icon name="solve" className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">{t('appName')}</h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">{t('loginWelcome')}</p>
        </div>
        
        <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-2xl shadow-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                {t('username')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-text-secondary-light dark:text-text-secondary-dark">
                    <Icon name="user" className="w-5 h-5"/>
                </span>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full ps-10 p-3 border border-secondary-dark dark:border-slate-600 rounded-lg bg-secondary dark:bg-slate-700 text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none transition"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="password"  className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                {t('password')}
              </label>
              <div className="relative">
                 <span className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-text-secondary-light dark:text-text-secondary-dark">
                    <Icon name="lock" className="w-5 h-5"/>
                </span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full ps-10 p-3 border border-secondary-dark dark:border-slate-600 rounded-lg bg-secondary dark:bg-slate-700 text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none transition"
                  required
                />
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark disabled:bg-blue-300 dark:disabled:bg-slate-600 flex items-center justify-center transition-transform transform active:scale-95"
            >
              {isLoading ? <LoadingSpinner /> : t('loginButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
