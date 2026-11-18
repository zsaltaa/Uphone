'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { MotionConfig } from 'motion/react';
import type { FontPreset, LocaleCode, ThemeMode } from '@/types/uphone';
import {
  applyCustomThemeVars,
  clampFontScale,
  DEFAULT_CUSTOM_THEME_TOKENS,
  FONT_PRESETS,
  resolveEffectiveTheme,
  type CustomThemeTokens,
} from '@/lib/theme/tokens';
import { getLocaleMessages, type ShellMessages } from '@/lib/i18n';
import { useVisualViewport } from '@/hooks/use-visual-viewport';
import { ToastProvider } from '@/components/ui/Toast';
import { NavigationProvider } from '@/components/navigation/NavigationProvider';

export type ThemeSelection = ThemeMode | 'custom';

interface AppContextValue {
  themeMode: ThemeSelection;
  resolvedTheme: 'light' | 'dark' | 'custom';
  setThemeMode: (mode: ThemeSelection) => void;
  toggleTheme: () => void;
  customThemeTokens: CustomThemeTokens;
  setCustomThemeTokens: (tokens: CustomThemeTokens) => void;
  fontPreset: FontPreset;
  setFontPreset: (preset: FontPreset) => void;
  fontScale: number;
  setFontScale: (scale: number) => void;
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  toggleLocale: () => void;
  messages: ShellMessages;
  keyboardOffset: number;
  isKeyboardOpen: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const THEME_STORAGE_KEY = 'uphone.themeMode';
const CUSTOM_TOKENS_STORAGE_KEY = 'uphone.customThemeTokens';
const LOCALE_STORAGE_KEY = 'uphone.locale';
const FONT_STORAGE_KEY = 'uphone.fontPreset';
const FONT_SCALE_STORAGE_KEY = 'uphone.fontScale';
const PREFS_EVENT = 'uphone:prefs-change';

function subscribeMediaDark(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function getMediaDarkSnapshot(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function subscribePrefs(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  window.addEventListener('storage', callback);
  window.addEventListener(PREFS_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(PREFS_EVENT, callback);
  };
}

function readStorage<T extends string>(
  key: string,
  fallback: T,
  isValid: (val: string) => val is T,
): T {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const raw = window.localStorage.getItem(key);
  if (raw && isValid(raw)) {
    return raw;
  }
  return fallback;
}

function readCustomTokensSnapshot(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.localStorage.getItem(CUSTOM_TOKENS_STORAGE_KEY) ?? '';
}

function readFontScaleSnapshot(): number {
  if (typeof window === 'undefined') {
    return 1;
  }
  const raw = Number(window.localStorage.getItem(FONT_SCALE_STORAGE_KEY));
  return Number.isFinite(raw) && raw > 0 ? clampFontScale(raw) : 1;
}

function writeStorage(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(key, value);
  window.dispatchEvent(new Event(PREFS_EVENT));
}

const isThemeSelection = (v: string): v is ThemeSelection =>
  v === 'system' || v === 'light' || v === 'dark' || v === 'custom';
const isLocaleCode = (v: string): v is LocaleCode => v === 'zh-CN' || v === 'en-US';
const isFontPreset = (v: string): v is FontPreset => v in FONT_PRESETS;

export function AppProviders({ children }: { children: React.ReactNode }) {
  const prefersDark = useSyncExternalStore(subscribeMediaDark, getMediaDarkSnapshot, () => false);

  const themeMode = useSyncExternalStore(
    subscribePrefs,
    () => readStorage(THEME_STORAGE_KEY, 'light', isThemeSelection),
    () => 'light' as ThemeSelection,
  );

  const customTokensRaw = useSyncExternalStore(
    subscribePrefs,
    readCustomTokensSnapshot,
    () => '',
  );

  const customThemeTokens = useMemo<CustomThemeTokens>(() => {
    if (!customTokensRaw) {
      return DEFAULT_CUSTOM_THEME_TOKENS;
    }
    try {
      const parsed = JSON.parse(customTokensRaw) as CustomThemeTokens;
      return { ...DEFAULT_CUSTOM_THEME_TOKENS, ...parsed };
    } catch {
      return DEFAULT_CUSTOM_THEME_TOKENS;
    }
  }, [customTokensRaw]);

  const locale = useSyncExternalStore(
    subscribePrefs,
    () => readStorage(LOCALE_STORAGE_KEY, 'zh-CN', isLocaleCode),
    () => 'zh-CN' as LocaleCode,
  );

  const fontPreset = useSyncExternalStore(
    subscribePrefs,
    () => readStorage(FONT_STORAGE_KEY, 'jakarta', isFontPreset),
    () => 'jakarta' as FontPreset,
  );

  const fontScale = useSyncExternalStore(subscribePrefs, readFontScaleSnapshot, () => 1);

  const { keyboardOffset, isKeyboardOpen } = useVisualViewport();

  const resolvedTheme: 'light' | 'dark' | 'custom' =
    themeMode === 'custom'
      ? 'custom'
      : resolveEffectiveTheme(themeMode, prefersDark);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.removeAttribute('data-theme');

    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      applyCustomThemeVars(root, null);
    } else if (resolvedTheme === 'custom') {
      root.setAttribute('data-theme', 'custom');
      root.style.colorScheme = 'light';
      applyCustomThemeVars(root, customThemeTokens);
    } else {
      root.style.colorScheme = 'light';
      applyCustomThemeVars(root, null);
    }
  }, [resolvedTheme, customThemeTokens]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.style.setProperty('--uphone-font-family', FONT_PRESETS[fontPreset].cssFamily);
    root.style.setProperty('--uphone-font-scale', String(fontScale));
  }, [locale, fontPreset, fontScale]);

  const setThemeMode = useCallback((mode: ThemeSelection) => {
    writeStorage(THEME_STORAGE_KEY, mode);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeSelection =
      resolvedTheme === 'light' ? 'dark' : resolvedTheme === 'dark' ? 'custom' : 'light';
    writeStorage(THEME_STORAGE_KEY, next);
  }, [resolvedTheme]);

  const setCustomThemeTokens = useCallback((tokens: CustomThemeTokens) => {
    writeStorage(CUSTOM_TOKENS_STORAGE_KEY, JSON.stringify(tokens));
  }, []);

  const setFontPreset = useCallback((preset: FontPreset) => {
    writeStorage(FONT_STORAGE_KEY, preset);
  }, []);

  const setFontScale = useCallback((scale: number) => {
    writeStorage(FONT_SCALE_STORAGE_KEY, String(clampFontScale(scale)));
  }, []);

  const setLocale = useCallback((nextLocale: LocaleCode) => {
    writeStorage(LOCALE_STORAGE_KEY, nextLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    writeStorage(LOCALE_STORAGE_KEY, locale === 'zh-CN' ? 'en-US' : 'zh-CN');
  }, [locale]);

  const messages = useMemo(() => getLocaleMessages(locale), [locale]);

  const value = useMemo<AppContextValue>(
    () => ({
      themeMode,
      resolvedTheme,
      setThemeMode,
      toggleTheme,
      customThemeTokens,
      setCustomThemeTokens,
      fontPreset,
      setFontPreset,
      fontScale,
      setFontScale,
      locale,
      setLocale,
      toggleLocale,
      messages,
      keyboardOffset,
      isKeyboardOpen,
    }),
    [
      themeMode,
      resolvedTheme,
      setThemeMode,
      toggleTheme,
      customThemeTokens,
      setCustomThemeTokens,
      fontPreset,
      setFontPreset,
      fontScale,
      setFontScale,
      locale,
      setLocale,
      toggleLocale,
      messages,
      keyboardOffset,
      isKeyboardOpen,
    ],
  );

  return (
    <MotionConfig reducedMotion="user">
      <AppContext.Provider value={value}>
        <ToastProvider>
          <NavigationProvider>{children}</NavigationProvider>
        </ToastProvider>
      </AppContext.Provider>
    </MotionConfig>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProviders.');
  }
  return ctx;
}
