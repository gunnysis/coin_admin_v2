import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { colorScheme as nativewindColorScheme } from 'nativewind';
import { COLORS, COLORS_DARK } from '../constants/theme';
import { Storage } from '../lib/storage';

const THEME_STORAGE_KEY = 'app_theme';

export type ThemeMode = 'light' | 'dark' | 'system';

type ColorsType = Record<keyof typeof COLORS, string>;

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: ColorsType;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    Storage.getItem<ThemeMode>(THEME_STORAGE_KEY).then((saved) => {
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
        setThemeModeState(saved);
      }
    });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    Storage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
  }, []);

  // NativeWind 클래스 기반 스타일(dark: variant)에 테마 모드 동기화
  useEffect(() => {
    nativewindColorScheme.set(themeMode);
  }, [themeMode]);

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const colors = useMemo(() => (isDark ? COLORS_DARK : COLORS), [isDark]);

  const value = useMemo<ThemeContextValue>(
    () => ({ themeMode, setThemeMode, colors, isDark }),
    [themeMode, setThemeMode, colors, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      themeMode: 'system' as ThemeMode,
      setThemeMode: () => {},
      colors: COLORS,
      isDark: false,
    };
  }
  return ctx;
}
