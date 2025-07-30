import { useState, useEffect } from 'react';
import { ThemeConfig, ColorPalette } from '../types';

const generatePalette = (isDark: boolean, isGrayscale: boolean): ColorPalette => {
  if (isGrayscale) {
    return {
      primary: isDark ? '#ffffff' : '#000000',
      secondary: isDark ? '#e5e5e5' : '#404040',
      accent: isDark ? '#cccccc' : '#666666',
      success: isDark ? '#b3b3b3' : '#737373',
      warning: isDark ? '#999999' : '#8c8c8c',
      error: isDark ? '#808080' : '#a6a6a6',
      background: isDark ? '#1a1a1a' : '#ffffff',
      surface: isDark ? '#2d2d2d' : '#f5f5f5',
      text: isDark ? '#ffffff' : '#000000',
      textSecondary: isDark ? '#b3b3b3' : '#666666',
    };
  }

  return {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#10b981',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: isDark ? '#0f0f0f' : '#ffffff',
    surface: isDark ? '#1a1a1a' : '#f8fafc',
    text: isDark ? '#ffffff' : '#1f2937',
    textSecondary: isDark ? '#9ca3af' : '#6b7280',
  };
};

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      const parsedTheme = JSON.parse(saved);
      return {
        ...parsedTheme,
        palette: generatePalette(parsedTheme.isDark, parsedTheme.isGrayscale),
      };
    }
    return {
      isDark: false,
      isGrayscale: false,
      palette: generatePalette(false, false),
    };
  });

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));

    // Apply CSS variables to root
    const root = document.documentElement;

    // Apply theme class to html element for Tailwind's dark mode
    if (theme.isDark) {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    // Apply color variables
    Object.entries(theme.palette).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [theme]);

  const toggleDarkMode = () => {
    setTheme(prev => ({
      ...prev,
      isDark: !prev.isDark,
      palette: generatePalette(!prev.isDark, prev.isGrayscale),
    }));
  };

  const toggleGrayscale = () => {
    setTheme(prev => ({
      ...prev,
      isGrayscale: !prev.isGrayscale,
      palette: generatePalette(prev.isDark, !prev.isGrayscale),
    }));
  };

  return {
    theme,
    toggleDarkMode,
    toggleGrayscale,
  };
};