import React, { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { SolveScreen } from './screens/SolveScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { CourseScreen } from './screens/LearnScreen';
import { QuizScreen } from './screens/PracticeScreen';
import { SummariesScreen } from './screens/SummariesScreen';
import { FormulasScreen } from './screens/FormulasScreen';
import { AdminScreen } from './screens/AdminScreen';
import { ActiveScreen } from './types';
import { useAppContext } from './hooks/useAppContext';


const AppContent: React.FC = () => {
    const { t, isAuthenticated, userRole } = useAppContext();
    const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');

    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    const screenTitles: Record<ActiveScreen, string> = {
        home: t('appName'),
        course: t('course'),
        solve: t('solve'),
        quiz: t('quiz'),
        summaries: t('summaries'),
        formulas: t('formulas'),
        admin: t('admin'),
        profile: t('profile'),
    };

    const renderScreen = () => {
        switch (activeScreen) {
            case 'home':
                return <HomeScreen setActiveScreen={setActiveScreen} />;
            case 'course':
                return <CourseScreen />;
            case 'solve':
                return <SolveScreen />;
            case 'quiz':
                return <QuizScreen />;
            case 'summaries':
                return <SummariesScreen />;
            case 'formulas':
                return <FormulasScreen />;
            case 'admin':
                return userRole === 'admin' ? <AdminScreen /> : <HomeScreen setActiveScreen={setActiveScreen} />;
            case 'profile':
                return <ProfileScreen />;
            default:
                return <HomeScreen setActiveScreen={setActiveScreen} />;
        }
    };

    return (
        <div className="flex flex-col h-screen font-sans bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
            <Header title={screenTitles[activeScreen]} />
            <main className="flex-1 overflow-y-auto pb-20">
                {renderScreen()}
            </main>
            <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;