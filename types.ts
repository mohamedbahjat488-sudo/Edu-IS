export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type ActiveScreen = 'home' | 'course' | 'solve' | 'quiz' | 'summaries' | 'formulas' | 'profile' | 'admin';
export type UserRole = 'admin' | 'student' | null;

export interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  isAuthenticated: boolean;
  userRole: UserRole;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface Solution {
    analysis: string;
    application: string;
    result: string;
    explanation: string;
}

export interface HistoryItem {
  id: string;
  problem: string;
  solution: Solution;
  timestamp: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  type: 'mcq' | 'tf'; // Multiple Choice Question or True/False
}

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  question: string;
  idealAnswer: string;
}
