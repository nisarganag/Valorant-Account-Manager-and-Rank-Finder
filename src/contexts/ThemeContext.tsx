import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { darkTheme, lightTheme, type Theme } from '../theme/theme';

interface ThemeContextType {
  theme: Theme;
  themeMode: 'dark' | 'light';
  toggleTheme: () => void;
  setThemeMode: (mode: 'dark' | 'light') => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  // Load theme preference from localStorage or system preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        let savedTheme: string | null = null;
        
        if (window.electronAPI?.loadThemePreference) {
          const result = await window.electronAPI.loadThemePreference();
          savedTheme = result.success ? (result.data ?? null) : null;
        } else {
          // Fallback to localStorage for development
          savedTheme = localStorage.getItem('themeMode');
        }

        if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
          setThemeMode(savedTheme);
        } else {
          // Use system preference if available
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setThemeMode(prefersDark ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        setThemeMode('dark'); // Default to dark theme
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preference
  const saveThemePreference = async (mode: 'dark' | 'light') => {
    try {
      if (window.electronAPI?.saveThemePreference) {
        await window.electronAPI.saveThemePreference(mode);
      } else {
        // Fallback to localStorage for development
        localStorage.setItem('themeMode', mode);
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    saveThemePreference(newMode);
  };

  const handleSetThemeMode = (mode: 'dark' | 'light') => {
    setThemeMode(mode);
    saveThemePreference(mode);
  };

  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    theme: currentTheme,
    themeMode,
    toggleTheme,
    setThemeMode: handleSetThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};