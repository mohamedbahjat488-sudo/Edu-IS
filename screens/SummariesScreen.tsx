import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { useAppContext } from '../hooks/useAppContext';
import { generateSummary } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface Topic {
    key: string;
    title: string;
}

export const SummariesScreen: React.FC = () => {
  const { t, language } = useAppContext();
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const topics: Topic[] = [
    { key: 'topic_depreciation', title: t('topic_depreciation') },
    { key: 'topic_inventory', title: t('topic_inventory') },
    { key: 'topic_adjustments', title: t('topic_adjustments') },
    { key: 'topic_financial_statements', title: t('topic_financial_statements') },
    { key: 'topic_receivables', title: t('topic_receivables') },
  ];

  const handleTopicClick = async (topicTitle: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedSummary(null);
    try {
        const content = await generateSummary(topicTitle, language);
        setSelectedSummary(content);
    } catch (err) {
        setError(t('error'));
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (selectedSummary) {
        navigator.clipboard.writeText(selectedSummary)
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            })
            .catch(err => console.error('Failed to copy text: ', err));
    }
  };
  
  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">{t('summariesTitle')}</h2>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2 max-w-2xl mx-auto">{t('summariesIntro')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
        {/* Topics List */}
        <div className="md:w-1/3">
            <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg shadow-md">
                <h3 className="font-bold text-lg text-text-light dark:text-text-dark mb-3">{t('suggestedTopics')}</h3>
                <ul className="space-y-2">
                    {topics.map(topic => (
                        <li key={topic.key}>
                            <button 
                            onClick={() => handleTopicClick(topic.title)}
                            className="w-full text-start p-3 rounded-md hover:bg-secondary dark:hover:bg-slate-700 transition-colors text-text-secondary-light dark:text-text-secondary-dark font-medium"
                            >
                                {topic.title}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        
        {/* Summary Content */}
        <div className="md:w-2/3 bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-md min-h-[400px] relative">
            {isLoading && <div className="flex flex-col items-center justify-center h-full"><LoadingSpinner /><p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">{t('generatingSummary')}</p></div>}
            {error && <p className="text-red-500 text-center">{error}</p>}
            
            {selectedSummary && !isLoading && (
                <>
                    <button
                        onClick={handleCopy}
                        className="absolute top-4 end-4 flex items-center bg-secondary dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600 text-primary dark:text-secondary-light font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                    >
                        <Icon name={copySuccess ? "clipboard" : "summaries"} className="w-5 h-5 me-2" />
                        {copySuccess ? t('copySuccess') : t('copySummary')}
                    </button>
                    <div className="prose dark:prose-invert max-w-none text-text-light dark:text-text-dark whitespace-pre-wrap leading-relaxed pt-10">
                        {selectedSummary}
                    </div>
                 </>
            )}

             {!selectedSummary && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary-light dark:text-text-secondary-dark">
                    <Icon name="summaries" className="w-16 h-16 mb-4"/>
                    <p>اختر موضوعًا من القائمة لعرض الملخص.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};