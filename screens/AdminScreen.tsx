import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Icon } from '../components/Icon';

interface LoginAttempt {
    username: string;
    password: string;
    timestamp: string;
}

export const AdminScreen: React.FC = () => {
    const { t, language } = useAppContext();
    const [attempts, setAttempts] = useState<LoginAttempt[]>([]);

    useEffect(() => {
        try {
            const storedAttempts = localStorage.getItem('studentLoginAttempts');
            if (storedAttempts) {
                setAttempts(JSON.parse(storedAttempts));
            }
        } catch (error) {
            console.error("Failed to load login attempts:", error);
        }
    }, []);

    const handleClearLogins = () => {
        localStorage.removeItem('studentLoginAttempts');
        setAttempts([]);
    };
    
    return (
        <div className="p-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">{t('adminTitle')}</h2>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">{t('adminIntro')}</p>
            </div>

            <div className="max-w-4xl mx-auto bg-surface-light dark:bg-surface-dark p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-text-light dark:text-text-dark">{t('loginAttempts')}</h3>
                    {attempts.length > 0 && (
                        <button onClick={handleClearLogins} className="flex items-center text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">
                            <Icon name="trash" className="w-4 h-4 me-1" />
                            {t('clearLogins')}
                        </button>
                    )}
                </div>
                {attempts.length === 0 ? (
                    <p className="text-center text-text-secondary-light dark:text-text-secondary-dark py-8">{t('noLoginAttempts')}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left rtl:text-right text-text-secondary-light dark:text-text-secondary-dark">
                            <thead className="text-xs text-text-light dark:text-text-dark uppercase bg-secondary dark:bg-slate-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('username')}</th>
                                    <th scope="col" className="px-6 py-3">{t('password')}</th>
                                    <th scope="col" className="px-6 py-3">{t('timestamp')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attempts.map((attempt, index) => (
                                    <tr key={index} className="bg-surface-light dark:bg-surface-dark border-b dark:border-slate-700">
                                        <td className="px-6 py-4 font-medium text-text-light dark:text-text-dark">{attempt.username}</td>
                                        <td className="px-6 py-4">{attempt.password}</td>
                                        <td className="px-6 py-4">{new Date(attempt.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};