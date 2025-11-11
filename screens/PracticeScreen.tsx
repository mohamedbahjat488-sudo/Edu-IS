import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { useAppContext } from '../hooks/useAppContext';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

const QuizScreen: React.FC = () => {
    const { t, language } = useAppContext();
    const [topic, setTopic] = useState('');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const dailyChallengeTopic = sessionStorage.getItem('dailyChallengeTopic');
        if (dailyChallengeTopic) {
            sessionStorage.removeItem('dailyChallengeTopic');
            setTopic(dailyChallengeTopic);
            handleGenerateQuiz(dailyChallengeTopic);
        }
    }, []);

    const handleGenerateQuiz = async (quizTopic = topic) => {
        if (!quizTopic.trim()) return;
        setIsLoading(true);
        setError(null);
        setQuestions([]);
        try {
            const generatedQuestions = await generateQuiz(quizTopic, language);
            if (generatedQuestions.length === 0) throw new Error("No questions generated.");
            setQuestions(generatedQuestions);
            resetQuizState();
        } catch (err) {
            setError(t('error'));
        } finally {
            setIsLoading(false);
        }
    };

    const resetQuizState = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setScore(0);
    }

    const handleAnswerSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedAnswer(index);
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return;
        
        setIsAnswered(true);
        if (selectedAnswer === questions[currentQuestionIndex].correctAnswerIndex) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        setIsAnswered(false);
        setSelectedAnswer(null);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const handlePlayAgain = () => {
        setQuestions([]);
        setTopic('');
        resetQuizState();
    }

    const renderQuizContent = () => {
        if (isLoading) {
            return <div className="text-center"><LoadingSpinner /><p className="mt-2">{t('generatingQuiz')}</p></div>;
        }
        if (error) {
            return <p className="text-red-500 text-center">{error}</p>;
        }

        if (questions.length === 0) {
            return renderTopicSelection();
        }

        if (currentQuestionIndex >= questions.length) {
            return renderQuizResults();
        }

        return renderQuestion();
    };

    const renderTopicSelection = () => (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">{t('quizSectionTitle')}</h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2 mb-6 max-w-2xl mx-auto">{t('quizIntro')}</p>
            <div className="max-w-md mx-auto">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={t('enterTopicPlaceholder')}
                    className="w-full p-3 border border-secondary-dark dark:border-slate-600 rounded-lg bg-secondary dark:bg-slate-700 focus:ring-2 focus:ring-primary"
                />
                <button
                    onClick={() => handleGenerateQuiz()}
                    disabled={!topic.trim()}
                    className="w-full mt-4 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark disabled:bg-blue-300 transition-transform transform active:scale-95"
                >
                    {t('generateQuizButton')}
                </button>
            </div>
        </div>
    );

    const renderQuestion = () => {
        const question = questions[currentQuestionIndex];
        return (
            <div className="max-w-2xl mx-auto">
                <p className="text-center text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2">
                    {`السؤال ${currentQuestionIndex + 1} من ${questions.length}`}
                </p>
                <h3 className="text-xl font-semibold text-center mb-6">{question.question}</h3>
                <div className="space-y-3">
                    {question.options.map((option, index) => {
                        let buttonClass = 'bg-surface-light dark:bg-surface-dark hover:bg-secondary dark:hover:bg-slate-700';
                        if (isAnswered) {
                            if (index === question.correctAnswerIndex) {
                                buttonClass = 'bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-300';
                            } else if (index === selectedAnswer) {
                                buttonClass = 'bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-300';
                            }
                        } else if (index === selectedAnswer) {
                            buttonClass = 'bg-blue-100 dark:bg-blue-900 border-primary';
                        }
                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                className={`w-full text-start p-4 rounded-lg border-2 transition-colors ${buttonClass}`}
                                disabled={isAnswered}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
                {isAnswered && (
                     <div className="mt-4 p-4 bg-secondary dark:bg-slate-700/50 rounded-lg">
                        <p className={`font-bold ${selectedAnswer === question.correctAnswerIndex ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {selectedAnswer === question.correctAnswerIndex ? t('correctAnswer') : t('wrongAnswer')}
                        </p>
                        <p className="mt-1 text-sm">{question.explanation}</p>
                    </div>
                )}
                <button
                    onClick={isAnswered ? handleNextQuestion : handleSubmitAnswer}
                    disabled={selectedAnswer === null && !isAnswered}
                    className="w-full mt-6 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark disabled:bg-blue-300 transition-transform transform active:scale-95"
                >
                    {isAnswered ? t('nextQuestion') : t('submitAnswer')}
                </button>
            </div>
        );
    };

    const renderQuizResults = () => (
        <div className="text-center">
             <Icon name="quiz" className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold">{t('quizResultTitle')}</h2>
            <p className="text-2xl mt-4">{t('yourScore', { score: score.toString(), total: questions.length.toString() })}</p>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">{t('quizCompleteMessage')}</p>
            <button
                onClick={handlePlayAgain}
                className="mt-8 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-transform transform active:scale-95"
            >
                {t('playAgain')}
            </button>
        </div>
    );

    return <div className="p-6">{renderQuizContent()}</div>;
};

// Renaming export to match new filename
export { QuizScreen };
