import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: true,
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('pigify-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      // Default to high-tech dark theme
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.classList.remove('theme-dark', 'theme-light');
      document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
      localStorage.setItem('pigify-theme', theme);
    } catch (e) {
      console.warn('Theme storage error:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (val) => {
    if (val === 'dark' || val === 'light') setThemeState(val);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
