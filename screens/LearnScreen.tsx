import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { useAppContext } from '../hooks/useAppContext';
import { generateCourseLesson } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface Lesson {
    key: string;
    title: string;
}

interface Module {
    key: string;
    title: string;
    lessons: Lesson[];
}

const CourseScreen: React.FC = () => {
  const { t, language } = useAppContext();
  const [selectedLessonContent, setSelectedLessonContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modules: Module[] = [
    {
        key: 'module1', title: t('module1'), lessons: [
            { key: 'module1_lesson1', title: t('module1_lesson1') },
            { key: 'module1_lesson2', title: t('module1_lesson2') },
            { key: 'module1_lesson3', title: t('module1_lesson3') },
        ]
    },
    {
        key: 'module2', title: t('module2'), lessons: [
            { key: 'module2_lesson1', title: t('module2_lesson1') },
            { key: 'module2_lesson2', title: t('module2_lesson2') },
            { key: 'module2_lesson3', title: t('module2_lesson3') },
        ]
    },
  ];

  const handleLessonClick = async (lessonTitle: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedLessonContent(null);
    try {
        const content = await generateCourseLesson(lessonTitle, language);
        setSelectedLessonContent(content);
    } catch (err) {
        setError(t('error'));
    } finally {
        setIsLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">{t('courseSectionTitle')}</h2>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2 max-w-2xl mx-auto">{t('courseIntro')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
        {/* Modules List */}
        <div className="md:w-1/3 space-y-4">
            {modules.map(module => (
                <details key={module.key} className="group bg-surface-light dark:bg-surface-dark p-4 rounded-lg shadow-md" open>
                    <summary className="flex items-center justify-between list-none font-bold text-text-light dark:text-text-dark cursor-pointer">
                       {module.title}
                       <div className="transition-transform transform group-open:rotate-90">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </div>
                    </summary>
                    <ul className="mt-4 space-y-2">
                       {module.lessons.map(lesson => (
                           <li key={lesson.key}>
                               <button 
                                onClick={() => handleLessonClick(lesson.title)}
                                className="w-full text-start p-2 rounded-md hover:bg-secondary dark:hover:bg-slate-700 transition-colors text-text-secondary-light dark:text-text-secondary-dark"
                               >
                                   {lesson.title}
                               </button>
                           </li>
                       ))}
                    </ul>
                </details>
            ))}
        </div>
        
        {/* Lesson Content */}
        <div className="md:w-2/3 bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-md min-h-[300px]">
            {isLoading && <div className="flex flex-col items-center justify-center h-full"><LoadingSpinner /><p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">{t('generatingLesson')}</p></div>}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {selectedLessonContent && !isLoading && (
                 <div className="prose dark:prose-invert max-w-none text-text-light dark:text-text-dark whitespace-pre-wrap leading-relaxed">
                    {selectedLessonContent}
                </div>
            )}
             {!selectedLessonContent && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary-light dark:text-text-secondary-dark">
                    <Icon name="course" className="w-16 h-16 mb-4"/>
                    <p>اختر درسًا من القائمة لبدء التعلم.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// Renaming export to match new filename
export { CourseScreen };
