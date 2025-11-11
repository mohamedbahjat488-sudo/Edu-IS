
import React, { useState, useRef, useEffect } from 'react';
import { Solution } from '../types';
import { Icon } from './Icon';
import { useAppContext } from '../hooks/useAppContext';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { LoadingSpinner } from './LoadingSpinner';

interface SolutionDisplayProps {
  solution: Solution;
}

interface SectionProps {
  title: string;
  content: string;
  iconName: string;
}

const Section: React.FC<SectionProps> = ({ title, content, iconName }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <Icon name={iconName} className="w-6 h-6 text-primary dark:text-secondary-light me-3" />
        <h3 className="text-xl font-bold text-text-light dark:text-text-dark">{title}</h3>
      </div>
      <p className="text-text-secondary-light dark:text-text-secondary-dark whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
  );
};

export const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution }) => {
  const { t } = useAppContext();
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Cleanup audio context and source node on component unmount
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleReadAloud = async () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (isGeneratingAudio) return;

    setIsGeneratingAudio(true);
    setAudioError(null);

    try {
      const fullText = `
        ${t('analysis')}: ${solution.analysis}.
        ${t('application')}: ${solution.application}.
        ${t('result')}: ${solution.result}.
        ${t('explanation')}: ${solution.explanation}.
      `;

      const base64Audio = await generateSpeech(fullText);
      
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioData = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);

      stopPlayback(); // Stop any previous playback

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        setIsPlaying(false);
      };
      
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);

    } catch (error) {
      console.error("Failed to play audio:", error);
      setAudioError(t('error'));
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="mt-8 bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary dark:text-secondary-light text-center flex-1">{t('solutionTitle')}</h2>
            <button
                onClick={handleReadAloud}
                disabled={isGeneratingAudio}
                className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-secondary dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                aria-label={isPlaying ? t('stopReading') : t('readAloud')}
            >
                {isGeneratingAudio ? (
                    <div className="w-6 h-6"><LoadingSpinner /></div>
                ) : (
                    <Icon name={isPlaying ? 'speaker-x-mark' : 'speaker-wave'} className="w-6 h-6" />
                )}
            </button>
        </div>
        {audioError && <p className="text-red-500 text-center mb-4">{audioError}</p>}
      
      <Section title={t('analysis')} content={solution.analysis} iconName="lightbulb" />
      <Section title={t('application')} content={solution.application} iconName="clipboard" />
      <Section title={t('result')} content={solution.result} iconName="chart" />
      <Section title={t('explanation')} content={solution.explanation} iconName="book" />
    </div>
  );
};
