import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const DARK_THEME = {
  mode: 'dark',
  isDark: true,
  bgDeep: '#070A13',
  bgCard: 'rgba(13, 20, 36, 0.92)',
  bgCardSolid: '#0D1424',
  borderCard: 'rgba(255, 255, 255, 0.10)',
  borderCardHover: 'rgba(244, 63, 94, 0.35)',
  surfaceMuted: 'rgba(255, 255, 255, 0.04)',
  surfaceMutedStrong: 'rgba(255, 255, 255, 0.08)',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  textFaint: '#64748B',
  primary: '#F43F5E',
  primaryHover: '#FB7185',
  primaryDark: '#BE123C',
  primaryGlow: 'rgba(244, 63, 94, 0.25)',
  emerald: '#10B981',
  cyan: '#06B6D4',
  amber: '#F59E0B',
  navBarBg: 'rgba(11, 18, 32, 0.96)',
  navBarBorder: 'rgba(255, 255, 255, 0.10)',
  statusBarStyle: 'light',
  dialogBg: '#0D1424',
  shadowColor: '#000000',
  glowTopLeft: 'rgba(244, 63, 94, 0.12)',
  glowTopRight: 'rgba(6, 182, 212, 0.09)',
};

export const LIGHT_THEME = {
  mode: 'light',
  isDark: false,
  bgDeep: '#F8FAFC',
  bgCard: '#FFFFFF',
  bgCardSolid: '#FFFFFF',
  borderCard: '#E2E8F0',
  borderCardHover: 'rgba(225, 29, 72, 0.35)',
  surfaceMuted: '#F1F5F9',
  surfaceMutedStrong: '#E2E8F0',
  textMain: '#0F172A',
  textMuted: '#475569',
  textFaint: '#94A3B8',
  primary: '#E11D48',
  primaryHover: '#F43F5E',
  primaryDark: '#9F1239',
  primaryGlow: 'rgba(225, 29, 72, 0.18)',
  emerald: '#059669',
  cyan: '#0891B2',
  amber: '#D97706',
  navBarBg: 'rgba(255, 255, 255, 0.96)',
  navBarBorder: '#E2E8F0',
  statusBarStyle: 'dark',
  dialogBg: '#FFFFFF',
  shadowColor: '#0F172A',
  glowTopLeft: 'rgba(225, 29, 72, 0.08)',
  glowTopRight: 'rgba(8, 145, 178, 0.06)',
};

const THEME_STORAGE_KEY = 'pigify-theme';

const ThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  colors: DARK_THEME,
  toggleTheme: () => {},
  setTheme: () => {},
  paperTheme: MD3DarkTheme,
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark') {
          setThemeState(saved);
        }
      })
      .catch((err) => {
        console.warn('Failed to load theme preference:', err);
      });
  }, []);

  const setTheme = async (newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark') return;
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const colors = useMemo(() => (theme === 'dark' ? DARK_THEME : LIGHT_THEME), [theme]);
  const isDark = theme === 'dark';

  const paperTheme = useMemo(() => {
    const base = isDark ? MD3DarkTheme : MD3LightTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.bgDeep,
        surface: colors.dialogBg,
      },
    };
  }, [isDark, colors]);

  const value = useMemo(
    () => ({
      theme,
      isDark,
      colors,
      toggleTheme,
      setTheme,
      paperTheme,
    }),
    [theme, isDark, colors, paperTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;

