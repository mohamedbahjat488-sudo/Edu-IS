import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { useAppContext } from '../hooks/useAppContext';
import { explainFormula } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface Formula {
    key: string;
    title: string;
}

export const FormulasScreen: React.FC = () => {
  const { t, language } = useAppContext();
  const [selectedExplanation, setSelectedExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formulas: Formula[] = [
    { key: 'formula_accounting_equation', title: t('formula_accounting_equation') },
    { key: 'formula_net_income', title: t('formula_net_income') },
    { key: 'formula_cost_of_goods_sold', title: t('formula_cost_of_goods_sold') },
    { key: 'formula_retained_earnings', title: t('formula_retained_earnings') },
    { key: 'formula_current_ratio', title: t('formula_current_ratio') },
  ];

  const handleFormulaClick = async (formulaTitle: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedExplanation(null);
    try {
        const content = await explainFormula(formulaTitle, language);
        setSelectedExplanation(content);
    } catch (err) {
        setError(t('error'));
    } finally {
        setIsLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">{t('formulasTitle')}</h2>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2 max-w-2xl mx-auto">{t('formulasIntro')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
        {/* Topics List */}
        <div className="md:w-1/3">
            <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg shadow-md">
                <h3 className="font-bold text-lg text-text-light dark:text-text-dark mb-3">{t('suggestedTopics')}</h3>
                <ul className="space-y-2">
                    {formulas.map(formula => (
                        <li key={formula.key}>
                            <button 
                            onClick={() => handleFormulaClick(formula.title)}
                            className="w-full text-start p-3 rounded-md hover:bg-secondary dark:hover:bg-slate-700 transition-colors text-text-secondary-light dark:text-text-secondary-dark font-medium"
                            >
                                {formula.title}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        
        {/* Explanation Content */}
        <div className="md:w-2/3 bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-md min-h-[400px]">
            {isLoading && <div className="flex flex-col items-center justify-center h-full"><LoadingSpinner /><p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">{t('generatingExplanation')}</p></div>}
            {error && <p className="text-red-500 text-center">{error}</p>}
            
            {selectedExplanation && !isLoading && (
                 <div className="prose dark:prose-invert max-w-none text-text-light dark:text-text-dark whitespace-pre-wrap leading-relaxed">
                    {selectedExplanation}
                </div>
            )}

             {!selectedExplanation && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary-light dark:text-text-secondary-dark">
                    <Icon name="formulas" className="w-16 h-16 mb-4"/>
                    <p>اختر قانونًا من القائمة لعرض الشرح.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
