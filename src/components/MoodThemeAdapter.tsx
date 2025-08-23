import React, { useEffect, useState } from 'react';
import { useWellnessStore } from '../stores/wellnessStore';
import './MoodThemeAdapter.css';

interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  overlay: string;
  message: string;
}

const moodThemes: Record<string, ThemeConfig> = {
  excellent: {
    name: 'Joyful',
    primary: '#4CAF50',
    secondary: '#81C784',
    background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)',
    overlay: 'rgba(76, 175, 80, 0.05)',
    message: 'Your positive energy is radiating! 🌟'
  },
  good: {
    name: 'Balanced',
    primary: '#2196F3',
    secondary: '#64B5F6',
    background: 'linear-gradient(135deg, #E3F2FD 0%, #E8EAF6 100%)',
    overlay: 'rgba(33, 150, 243, 0.05)',
    message: 'You\'re doing great, keep it up! 💙'
  },
  neutral: {
    name: 'Calm',
    primary: '#9C27B0',
    secondary: '#BA68C8',
    background: 'linear-gradient(135deg, #F3E5F5 0%, #EDE7F6 100%)',
    overlay: 'rgba(156, 39, 176, 0.05)',
    message: 'Take your time, we\'re here for you 💜'
  },
  low: {
    name: 'Supportive',
    primary: '#FF9800',
    secondary: '#FFB74D',
    background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
    overlay: 'rgba(255, 152, 0, 0.05)',
    message: 'It\'s okay to not be okay. You\'re not alone 🧡'
  },
  struggling: {
    name: 'Gentle',
    primary: '#E91E63',
    secondary: '#F06292',
    background: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)',
    overlay: 'rgba(233, 30, 99, 0.05)',
    message: 'We\'re here to support you through this 💗'
  }
};

export const MoodThemeAdapter: React.FC = () => {
  const { history } = useWellnessStore();
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(moodThemes.neutral);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    // Calculate average mood from recent check-ins
    if (history.length === 0) return;
    
    const recentHistory = history.slice(0, 7); // Last 7 check-ins
    const avgMood = recentHistory.reduce((sum, entry) => sum + entry.moodScore, 0) / recentHistory.length;
    
    let selectedTheme: ThemeConfig;
    if (avgMood >= 4.5) {
      selectedTheme = moodThemes.excellent;
    } else if (avgMood >= 3.5) {
      selectedTheme = moodThemes.good;
    } else if (avgMood >= 2.5) {
      selectedTheme = moodThemes.neutral;
    } else if (avgMood >= 1.5) {
      selectedTheme = moodThemes.low;
    } else {
      selectedTheme = moodThemes.struggling;
    }
    
    if (selectedTheme.name !== currentTheme.name) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentTheme(selectedTheme);
        applyTheme(selectedTheme);
        setIsTransitioning(false);
      }, 300);
    }
  }, [history, currentTheme.name]);
  
  const applyTheme = (theme: ThemeConfig) => {
    const root = document.documentElement;
    
    // Apply CSS variables
    root.style.setProperty('--mood-primary', theme.primary);
    root.style.setProperty('--mood-secondary', theme.secondary);
    root.style.setProperty('--mood-overlay', theme.overlay);
    
    // Add theme class to body
    document.body.className = document.body.className.replace(/mood-theme-\w+/, '');
    document.body.classList.add(`mood-theme-${theme.name.toLowerCase()}`);
    
    // Apply background gradient to specific elements
    const elements = document.querySelectorAll('.mood-adaptive');
    elements.forEach(el => {
      (el as HTMLElement).style.background = theme.background;
    });
  };
  
  return (
    <div className={`mood-theme-indicator ${isTransitioning ? 'transitioning' : ''}`}>
      <div 
        className="theme-badge"
        style={{
          background: currentTheme.background,
          borderColor: currentTheme.primary
        }}
      >
        <span className="theme-name" style={{ color: currentTheme.primary }}>
          {currentTheme.name} Mode
        </span>
      </div>
      <p className="theme-message" style={{ color: currentTheme.secondary }}>
        {currentTheme.message}
      </p>
    </div>
  );
};