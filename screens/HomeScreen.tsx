import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { useAppContext } from '../hooks/useAppContext';
import { ActiveScreen, DailyChallenge } from '../types';
import { generateDailyChallenge } from '../services/geminiService';
import { DailyChallengeModal } from './PlaceholderScreen';
import { LoadingSpinner } from '../components/LoadingSpinner';


interface HomeScreenProps {
    setActiveScreen: (screen: ActiveScreen) => void;
}

interface ActionCardProps {
    title: string;
    icon: string;
    onClick: () => void;
    color: string;
    disabled?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, icon, onClick, color, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition-transform transform hover:scale-105 active:scale-95 ${color} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <Icon name={icon} className="w-12 h-12 mb-3 text-white" />
            <h3 className="text-lg font-bold text-white">{title}</h3>
        </button>
    )
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveScreen }) => {
  const { t, language } = useAppContext();
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [isChallengeLoading, setIsChallengeLoading] = useState(false);
  const [challengeError, setChallengeError] = useState<string | null>(null);

  const handleDailyChallengeClick = async () => {
    setIsChallengeLoading(true);
    setChallengeError(null);
    
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const storedChallengeString = localStorage.getItem('dailyChallenge');
      let challengeData: DailyChallenge | null = null;
      
      if (storedChallengeString) {
          const storedChallenge = JSON.parse(storedChallengeString);
          if (storedChallenge.date === today) {
              challengeData = storedChallenge;
          }
      }
      
      if (!challengeData) {
        const { question, idealAnswer } = await generateDailyChallenge(language);
        challengeData = { date: today, question, idealAnswer };
        localStorage.setItem('dailyChallenge', JSON.stringify(challengeData));
      }

      setDailyChallenge(challengeData);
      setIsChallengeModalOpen(true);
    } catch (err) {
        setChallengeError(t('error'));
        // Fallback to old behavior on error
        const topics = [
            t('topic_depreciation'),
            t('topic_inventory'),
            t('topic_adjustments'),
            t('topic_financial_statements'),
            t('topic_receivables')
        ];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        sessionStorage.setItem('dailyChallengeTopic', randomTopic);
        setActiveScreen('quiz');
    } finally {
      setIsChallengeLoading(false);
    }
  };

  return (
    <>
      <div className="p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">{t('homeWelcome')}</h1>
          <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark mt-2">{t('homeTagline')}</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4 flex items-center">
              <Icon name="bolt" className="w-6 h-6 me-2 text-primary dark:text-secondary-light"/>
              {t('quickActions')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionCard title={t('startSolving')} icon="solve" onClick={() => setActiveScreen('solve')} color="bg-primary hover:bg-primary-dark" />
            <ActionCard title={t('browseLessons')} icon="course" onClick={() => setActiveScreen('course')} color="bg-blue-400 dark:bg-blue-500 hover:bg-blue-500 dark:hover:bg-blue-600" />
            <ActionCard title={t('tryExercises')} icon="quiz" onClick={() => setActiveScreen('quiz')} color="bg-sky-400 dark:bg-sky-500 hover:bg-sky-500 dark:hover:bg-sky-600" />
            <ActionCard 
              title={t('dailyChallenge')} 
              icon="bolt" 
              onClick={handleDailyChallengeClick}
              disabled={isChallengeLoading}
              color="bg-amber-400 dark:bg-amber-500 hover:bg-amber-500 dark:hover:bg-amber-600" 
            />
          </div>
          {isChallengeLoading && <div className="text-center mt-4 flex items-center justify-center gap-2 text-text-secondary-light dark:text-text-secondary-dark"><LoadingSpinner/> <p>{t('challengeLoading')}</p></div>}
          {challengeError && <p className="text-red-500 text-center mt-4">{challengeError}</p>}
        </div>
        
        {/* You can add recent history here later */}

      </div>
      <DailyChallengeModal 
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        challenge={dailyChallenge}
      />
    </>
  );
};