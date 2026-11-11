import { createContext, useContext, useEffect, useState } from 'react';

const THEMES = [
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Professional deep navy & royal blue',
    preview: ['#0B1F3A', '#2563EB', '#3B82F6', '#F0F6FF'],
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    description: 'Deep navy dark theme',
    preview: ['#0A1628', '#3B82F6', '#60A5FA', '#111F35'],
  },
  {
    id: 'sky',
    name: 'Sky Light',
    description: 'Minimal white & sky blue',
    preview: ['#0C4A6E', '#0EA5E9', '#38BDF8', '#F8FAFC'],
  },
  {
    id: 'purple',
    name: 'Purple AI',
    description: 'Premium purple & violet',
    preview: ['#3B0764', '#9333EA', '#A855F7', '#FAF5FF'],
  },
  {
    id: 'emerald',
    name: 'Emerald',
    description: 'Clean green & white',
    preview: ['#064E3B', '#059669', '#10B981', '#F0FDF4'],
  },
  {
    id: 'darkpro',
    name: 'Dark Pro',
    description: 'Modern charcoal dark',
    preview: ['#020617', '#6366F1', '#818CF8', '#1E293B'],
  },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai_detector_theme') || 'ocean';
    }
    return 'ocean';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ai_detector_theme', theme);
  }, [theme]);

  const setTheme = (id) => {
    if (THEMES.some((t) => t.id === id)) {
      setThemeState(id);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
