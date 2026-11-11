'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSizeMode = 'compact' | 'standard' | 'comfortable' | 'large';
export type MotionMode = 'full' | 'reduced';

export interface UserPreferences {
  theme: ThemeMode;
  fontSize: FontSizeMode;
  motion: MotionMode;
}

interface PreferencesContextType {
  preferences: UserPreferences;
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: FontSizeMode) => void;
  setMotion: (motion: MotionMode) => void;
  isDark: boolean;
}

const STORAGE_KEY = 'school_budget_user_prefs';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  fontSize: 'comfortable', // 19.2px (+20% comfortable default)
  motion: 'full',
};

const FONT_SIZE_PX_MAP: Record<FontSizeMode, string> = {
  compact: '16px',
  standard: '18px',
  comfortable: '19.2px',
  large: '21px',
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [mounted, setMounted] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<UserPreferences>;
        setPreferences({
          theme: parsed.theme || DEFAULT_PREFERENCES.theme,
          fontSize: parsed.fontSize || DEFAULT_PREFERENCES.fontSize,
          motion: parsed.motion || DEFAULT_PREFERENCES.motion,
        });
      }
    } catch (e) {
      console.warn('Failed to load user preferences from localStorage', e);
    }
    setMounted(true);
  }, []);

  // Save and apply changes to DOM
  useEffect(() => {
    if (!mounted) return;

    // 1. Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to save preferences to localStorage', e);
    }

    // 2. Apply Theme
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark =
      preferences.theme === 'dark' || (preferences.theme === 'system' && prefersDark);

    if (shouldBeDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 3. Apply Font Size
    const targetPx = FONT_SIZE_PX_MAP[preferences.fontSize] || '19.2px';
    root.style.fontSize = targetPx;

    // 4. Apply Motion
    if (preferences.motion === 'reduced') {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [preferences, mounted]);

  const setTheme = (theme: ThemeMode) => {
    setPreferences((prev) => ({ ...prev, theme }));
  };

  const setFontSize = (fontSize: FontSizeMode) => {
    setPreferences((prev) => ({ ...prev, fontSize }));
  };

  const setMotion = (motion: MotionMode) => {
    setPreferences((prev) => ({ ...prev, motion }));
  };

  const isDark =
    mounted &&
    (preferences.theme === 'dark' ||
      (preferences.theme === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches));

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        setTheme,
        setFontSize,
        setMotion,
        isDark,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
