import React, { useState, useRef, useEffect } from 'react';
import { solveAccountingProblem } from '../services/geminiService';
import { Solution, HistoryItem } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SolutionDisplay } from '../components/SolutionDisplay';
import { Icon } from '../components/Icon';

export const SolveScreen: React.FC = () => {
  // FIX: Destructure language from useAppContext to use for date formatting.
  const { t, language } = useAppContext();
  const [problemText, setProblemText] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [useEgyptianDialect, setUseEgyptianDialect] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const topOfScreenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('accountingHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('accountingHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!problemText.trim() && !imageFile) {
      setError('Please enter a problem or upload an image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSolution(null);
    
    try {
      const dialect = useEgyptianDialect ? 'egyptian' : 'formal';
      const result = await solveAccountingProblem(problemText, imageFile || undefined, dialect);
      setSolution(result);
      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        problem: problemText || `Image: ${imageFile?.name}`,
        solution: result,
        timestamp: Date.now(),
      };
      setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
    } catch (err) {
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setProblemText(item.problem);
    setSolution(item.solution);
    setImageFile(null);
    topOfScreenRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="p-4 md:p-6" ref={topOfScreenRef}>
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-dark">{t('solveTitle')}</h2>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2 max-w-2xl mx-auto">{t('solveDescription')}</p>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-lg max-w-3xl mx-auto">
        <textarea
          value={problemText}
          onChange={(e) => setProblemText(e.target.value)}
          placeholder={t('problemPlaceholder')}
          className="w-full h-40 p-3 border border-secondary-dark dark:border-slate-600 rounded-lg bg-secondary dark:bg-slate-700 text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none transition"
          rows={6}
        />
        <div className="my-4 flex items-center">
            <hr className="flex-grow border-t border-secondary-dark dark:border-slate-600"/>
            <span className="mx-4 text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">{t('orUploadImage')}</span>
            <hr className="flex-grow border-t border-secondary-dark dark:border-slate-600"/>
        </div>
        
        <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
        />
        <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center p-3 border-2 border-dashed border-secondary-dark dark:border-slate-600 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:border-primary dark:hover:border-primary-light transition"
        >
            <Icon name="upload" className="w-5 h-5 me-2" />
            <span>{imageFile ? imageFile.name : t('uploadButton')}</span>
        </button>

        <div className="flex items-center justify-center mt-6">
            <label htmlFor="dialect-toggle" className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark cursor-pointer">{t('solveInEgyptian')}</label>
            <button
                onClick={() => setUseEgyptianDialect(!useEgyptianDialect)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors mx-3 ${useEgyptianDialect ? 'bg-primary' : 'bg-gray-300 dark:bg-slate-600'}`}
                role="switch"
                aria-checked={useEgyptianDialect}
            >
                <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${useEgyptianDialect ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'}`}
                />
            </button>
        </div>


        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full mt-4 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark disabled:bg-blue-300 dark:disabled:bg-slate-600 flex items-center justify-center transition-transform transform active:scale-95"
        >
          {isLoading ? <LoadingSpinner /> : t('solveButton')}
        </button>
      </div>

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {solution && <SolutionDisplay solution={solution} />}

      <div className="mt-12 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-text-light dark:text-text-dark flex items-center">
            <Icon name="history" className="w-6 h-6 me-3" />
            {t('history')}
          </h3>
          {history.length > 0 && (
            <button onClick={handleClearHistory} className="flex items-center text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">
              <Icon name="trash" className="w-4 h-4 me-1" />
              {t('clearHistory')}
            </button>
          )}
        </div>
        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-lg">
          {history.length === 0 ? (
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-center py-4">{t('noHistory')}</p>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-y-auto">
              {history.map(item => (
                <li key={item.id}>
                  <button onClick={() => handleHistoryClick(item)} className="w-full text-start p-3 rounded-lg hover:bg-secondary dark:hover:bg-slate-700 transition-colors">
                    <p className="font-medium text-text-light dark:text-text-dark truncate">{item.problem}</p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{new Date(item.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
};