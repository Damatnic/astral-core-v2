

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { Theme } from '../types';

interface AppTheme {
    colors: {
        bgPrimary: string;
        bgSecondary: string;
        bgTertiary: string;
        textPrimary: string;
        textSecondary: string;
        accentPrimary: string;
        accentPrimaryHover: string;
        accentPrimaryText: string;
        accentDanger: string;
        accentSuccess: string;
        borderColor: string;
    },
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    },
    radius: {
        sm: string;
        md: string;
        lg: string;
    }
}

interface ThemeContextType {
  theme: Theme;
  themeConfig: AppTheme;
  toggleTheme: () => void;
}

const lightTheme: AppTheme = {
    colors: {
        bgPrimary: '#f7f9fc',
        bgSecondary: '#FFFFFF',
        bgTertiary: '#eef2f7',
        textPrimary: '#2c3e50',
        textSecondary: '#7f8c8d',
        accentPrimary: '#3498db',
        accentPrimaryHover: '#2980b9',
        accentPrimaryText: '#ffffff',
        accentDanger: '#e74c3c',
        accentSuccess: '#2ecc71',
        borderColor: '#e0e6ed',
    },
    spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2.5rem' },
    radius: { sm: '4px', md: '8px', lg: '12px' },
};

const darkTheme: AppTheme = {
    colors: {
        bgPrimary: '#161b22',
        bgSecondary: '#22272e',
        bgTertiary: '#1c2128',
        textPrimary: '#cdd9e5',
        textSecondary: '#768390',
        accentPrimary: '#58a6ff',
        accentPrimaryHover: '#79b8ff',
        accentPrimaryText: '#161b22',
        accentDanger: '#f85149',
        accentSuccess: '#3fb950',
        borderColor: '#373e47',
    },
    spacing: { ...lightTheme.spacing },
    radius: { ...lightTheme.radius },
};


const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const themeConfig = useMemo(() => (theme === 'light' ? lightTheme : darkTheme), [theme]);

  const value = useMemo(() => ({ theme, themeConfig, toggleTheme }), [theme, themeConfig, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
