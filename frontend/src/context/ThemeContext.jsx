import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export const themeOptions = [
  {
    id: 'default',
    name: 'Default',
    palette: {
      '--bg': '#fff7fb',
      '--bg-end': '#eff6ff',
      '--panel': 'rgba(255, 255, 255, 0.82)',
      '--panel-border': 'rgba(244, 114, 182, 0.12)',
      '--chrome': 'rgba(255, 250, 252, 0.9)',
      '--text': '#334155',
      '--text-muted': '#64748b',
      '--hero-a': 'rgba(251, 113, 133, 0.16)',
      '--hero-b': 'rgba(125, 211, 252, 0.18)',
      '--surface-soft': 'rgba(255, 255, 255, 0.84)',
      '--surface-muted': '#fff1f5',
      '--outline': '#fbcfe8',
      '--primary': '#fb7185',
      '--primary-soft': '#fecdd3',
      '--primary-contrast': '#ffffff',
      '--secondary': '#bae6fd',
      '--accent': '#f9a8d4',
      '--highlight': '#facc15',
    },
  },
  {
    id: 'soft-editorial-pastel',
    name: 'Soft Editorial Pastel',
    palette: {
      '--bg': '#F8FAFC',
      '--bg-end': '#EEF4FA',
      '--panel': 'rgba(255, 255, 255, 0.9)',
      '--panel-border': '#D9E6F2',
      '--chrome': 'rgba(248, 250, 252, 0.94)',
      '--text': '#2E2E2E',
      '--text-muted': '#5F6368',
      '--hero-a': 'rgba(167, 199, 231, 0.28)',
      '--hero-b': 'rgba(244, 182, 194, 0.24)',
      '--surface-soft': '#FFFFFF',
      '--surface-muted': '#F1F7FB',
      '--outline': '#DCE6EE',
      '--primary': '#A7C7E7',
      '--primary-soft': '#D6E7F7',
      '--primary-contrast': '#2E2E2E',
      '--secondary': '#CDE7D8',
      '--accent': '#F4B6C2',
      '--highlight': '#F4B6C2',
    },
  },
  {
    id: 'minimal-sage-cream',
    name: 'Minimal Sage & Cream',
    palette: {
      '--bg': '#F6F5F3',
      '--bg-end': '#EEEADF',
      '--panel': 'rgba(255, 255, 255, 0.88)',
      '--panel-border': '#D9DDC7',
      '--chrome': 'rgba(246, 245, 243, 0.94)',
      '--text': '#344E41',
      '--text-muted': '#6B7A6A',
      '--hero-a': 'rgba(163, 177, 138, 0.24)',
      '--hero-b': 'rgba(221, 190, 169, 0.22)',
      '--surface-soft': '#FFFDF9',
      '--surface-muted': '#F1EFE9',
      '--outline': '#DAD7CD',
      '--primary': '#A3B18A',
      '--primary-soft': '#CCD5AE',
      '--primary-contrast': '#24362D',
      '--secondary': '#CCD5AE',
      '--accent': '#DDBEA9',
      '--highlight': '#DDBEA9',
    },
  },
  {
    id: 'soft-playful-pastel',
    name: 'Soft Playful Pastel',
    palette: {
      '--bg': '#FFF9F9',
      '--bg-end': '#F6F8FF',
      '--panel': 'rgba(255, 255, 255, 0.9)',
      '--panel-border': '#F3D6D2',
      '--chrome': 'rgba(255, 249, 249, 0.94)',
      '--text': '#333333',
      '--text-muted': '#666666',
      '--hero-a': 'rgba(181, 234, 215, 0.28)',
      '--hero-b': 'rgba(255, 218, 193, 0.24)',
      '--surface-soft': '#FFFFFF',
      '--surface-muted': '#FFF3F2',
      '--outline': '#F0E4F1',
      '--primary': '#B5EAD7',
      '--primary-soft': '#DDF7EF',
      '--primary-contrast': '#2B4B41',
      '--secondary': '#C7CEEA',
      '--accent': '#FFDAC1',
      '--highlight': '#FFB7B2',
    },
  },
  {
    id: 'cool-pastel-blue-system',
    name: 'Cool Pastel Blue System',
    palette: {
      '--bg': '#F1F6FB',
      '--bg-end': '#E6F2F9',
      '--panel': 'rgba(255, 255, 255, 0.9)',
      '--panel-border': '#D2E7F0',
      '--chrome': 'rgba(241, 246, 251, 0.95)',
      '--text': '#1B263B',
      '--text-muted': '#48617D',
      '--hero-a': 'rgba(169, 214, 229, 0.28)',
      '--hero-b': 'rgba(137, 194, 217, 0.24)',
      '--surface-soft': '#FFFFFF',
      '--surface-muted': '#EAF5FB',
      '--outline': '#D4E7F2',
      '--primary': '#A9D6E5',
      '--primary-soft': '#D8EEF5',
      '--primary-contrast': '#1B263B',
      '--secondary': '#E0FBFC',
      '--accent': '#89C2D9',
      '--highlight': '#89C2D9',
    },
  },
  {
    id: 'pastel-neutral-highlight',
    name: 'Pastel Neutral + Highlight',
    palette: {
      '--bg': '#FFFFFF',
      '--bg-end': '#F7F7F7',
      '--panel': 'rgba(255, 255, 255, 0.94)',
      '--panel-border': '#E5E5E5',
      '--chrome': 'rgba(255, 255, 255, 0.95)',
      '--text': '#222222',
      '--text-muted': '#555555',
      '--hero-a': 'rgba(189, 178, 255, 0.22)',
      '--hero-b': 'rgba(160, 231, 229, 0.24)',
      '--surface-soft': '#FFFFFF',
      '--surface-muted': '#F7F7F7',
      '--outline': '#E5E5E5',
      '--primary': '#BDB2FF',
      '--primary-soft': '#E3DEFF',
      '--primary-contrast': '#2A2355',
      '--secondary': '#A0E7E5',
      '--accent': '#A0E7E5',
      '--highlight': '#BDB2FF',
    },
  },
];

const defaultThemeId = 'default';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return themeOptions.some((option) => option.id === savedTheme) ? savedTheme : defaultThemeId;
  });

  useEffect(() => {
    const root = document.documentElement;
    const selectedTheme = themeOptions.find((option) => option.id === theme) || themeOptions[0];

    root.classList.remove('dark');
    root.dataset.theme = selectedTheme.id;

    Object.entries(selectedTheme.palette).forEach(([token, value]) => {
      root.style.setProperty(token, value);
    });

    localStorage.setItem('theme', selectedTheme.id);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    themes: themeOptions,
    isDarkMode: false,
    toggleTheme: () => setTheme((current) => current === defaultThemeId ? 'soft-editorial-pastel' : defaultThemeId),
    setTheme,
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
