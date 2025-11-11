import React, { useState } from 'react';
import { DailyChallenge } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import { evaluateChallengeAnswer } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Icon } from '../components/Icon';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: DailyChallenge | null;
}

interface Feedback {
  isCorrect: boolean;
  feedback: string;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({ isOpen, onClose, challenge }) => {
  const { t, language } = useAppContext();
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!userAnswer.trim() || !challenge) return;
    setIsEvaluating(true);
    setError(null);
    setFeedback(null);

    try {
      const result = await evaluateChallengeAnswer(challenge.question, userAnswer, language);
      setFeedback(result);
    } catch (err) {
      setError(t('error'));
    } finally {
      setIsEvaluating(false);
    }
  };
  
  const handleClose = () => {
    // Reset state on close for next time modal opens
    setUserAnswer('');
    setFeedback(null);
    setError(null);
    onClose();
  };

  if (!isOpen || !challenge) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={handleClose}>
      <div 
        className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl p-6 w-full max-w-lg relative transform transition-all animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-3 right-3 rtl:right-auto rtl:left-3 p-1 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-secondary dark:hover:bg-slate-700">
            <Icon name="x-mark" className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-center text-primary dark:text-secondary-light mb-4">{t('dailyChallengeTitle')}</h2>
        
        <p className="text-text-light dark:text-text-dark text-lg mb-6 text-center leading-relaxed">{challenge.question}</p>

        {!feedback && (
          <>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={t('submitYourAnswer')}
              className="w-full h-28 p-3 border border-secondary-dark dark:border-slate-600 rounded-lg bg-secondary dark:bg-slate-700 text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none transition"
              rows={4}
              disabled={isEvaluating}
            />
            <button
              onClick={handleSubmit}
              disabled={isEvaluating || !userAnswer.trim()}
              className="w-full mt-4 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark disabled:bg-blue-300 dark:disabled:bg-slate-600 flex items-center justify-center transition-transform transform active:scale-95"
            >
              {isEvaluating ? <LoadingSpinner /> : t('submit')}
            </button>
          </>
        )}

        {feedback && (
          <div className="mt-4 p-4 rounded-lg bg-secondary dark:bg-slate-700/50">
            <h3 className="font-bold text-lg mb-2">{t('feedback')}</h3>
            <p className={`font-bold mb-2 ${feedback.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {feedback.isCorrect ? t('correct') : t('incorrect')}
            </p>
            <p className="text-text-secondary-light dark:text-text-secondary-dark whitespace-pre-wrap">{feedback.feedback}</p>
             <button
              onClick={handleClose}
              className="w-full mt-6 bg-primary/20 text-primary dark:bg-secondary/20 dark:text-secondary-light font-bold py-2 px-4 rounded-lg hover:bg-primary/30"
            >
              {t('close')}
            </button>
          </div>
        )}

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
       <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};
