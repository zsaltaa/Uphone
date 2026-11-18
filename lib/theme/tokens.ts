import type { FontPreset, ThemeMode } from '@/types/uphone';

export interface FontPresetDefinition {
  id: FontPreset;
  labelKey: string;
  labelZh: string;
  labelEn: string;
  cssFamily: string;
}

export interface CustomThemeTokens {
  bg?: string;
  surface?: string;
  surfaceElevated?: string;
  surfaceMuted?: string;
  border?: string;
  text?: string;
  textMuted?: string;
  accent?: string;
  accentFg?: string;
  accentSoft?: string;
  inputBg?: string;
  bubbleSelf?: string;
  bubbleSelfFg?: string;
  bubbleOther?: string;
  bubbleOtherFg?: string;
  popoverBg?: string;
}

export const DEFAULT_CUSTOM_THEME_TOKENS: Required<CustomThemeTokens> = {
  bg: '#f7f4fa',
  surface: '#fcfbfd',
  surfaceElevated: '#ffffff',
  surfaceMuted: '#eee9f6',
  border: 'rgba(118, 96, 150, 0.13)',
  text: '#2f273b',
  textMuted: '#726684',
  accent: '#7d649e',
  accentFg: '#ffffff',
  accentSoft: 'rgba(125, 100, 158, 0.12)',
  inputBg: '#f1edf7',
  bubbleSelf: '#7d649e',
  bubbleSelfFg: '#ffffff',
  bubbleOther: '#ffffff',
  bubbleOtherFg: '#2f273b',
  popoverBg: 'rgba(252, 251, 253, 0.92)',
};

const CSS_VAR_MAP: Record<keyof CustomThemeTokens, string> = {
  bg: '--uphone-bg',
  surface: '--uphone-surface',
  surfaceElevated: '--uphone-surface-elevated',
  surfaceMuted: '--uphone-surface-muted',
  border: '--uphone-border',
  text: '--uphone-text',
  textMuted: '--uphone-text-muted',
  accent: '--uphone-accent',
  accentFg: '--uphone-accent-fg',
  accentSoft: '--uphone-accent-soft',
  inputBg: '--uphone-input-bg',
  bubbleSelf: '--uphone-bubble-self',
  bubbleSelfFg: '--uphone-bubble-self-fg',
  bubbleOther: '--uphone-bubble-other',
  bubbleOtherFg: '--uphone-bubble-other-fg',
  popoverBg: '--uphone-popover-bg',
};

const CJK_FALLBACK =
  '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Microsoft YaHei", sans-serif';

export const FONT_PRESETS: Record<FontPreset, FontPresetDefinition> = {
  jakarta: {
    id: 'jakarta',
    labelKey: 'font.jakarta',
    labelZh: '现代黑体',
    labelEn: 'Modern Sans',
    cssFamily: `var(--font-sans-jakarta), -apple-system, BlinkMacSystemFont, ${CJK_FALLBACK}`,
  },
  system: {
    id: 'system',
    labelKey: 'font.system',
    labelZh: '系统原生',
    labelEn: 'System UI',
    cssFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", ${CJK_FALLBACK}`,
  },
  serif: {
    id: 'serif',
    labelKey: 'font.serif',
    labelZh: '优雅衬线',
    labelEn: 'Editorial Serif',
    cssFamily: `var(--font-serif-editorial), "Songti SC", "Noto Serif SC", Georgia, serif`,
  },
  mono: {
    id: 'mono',
    labelKey: 'font.mono',
    labelZh: '等宽字体',
    labelEn: 'Monospace',
    cssFamily: `var(--font-mono-jetbrains), ui-monospace, SFMono-Regular, ${CJK_FALLBACK}`,
  },
};

export type ActiveThemeVariant = 'light' | 'dark' | 'custom';

export function resolveEffectiveTheme(mode: ThemeMode, prefersDark: boolean): 'light' | 'dark' {
  if (mode === 'system') {
    return prefersDark ? 'dark' : 'light';
  }
  return mode;
}

export function clampFontScale(scale: number): number {
  if (!Number.isFinite(scale)) {
    return 1;
  }
  return Math.min(1.3, Math.max(0.85, Number(scale.toFixed(2))));
}

export function customThemeToCssVars(tokens: CustomThemeTokens): Record<string, string> {
  const result: Record<string, string> = {};
  (Object.keys(CSS_VAR_MAP) as Array<keyof CustomThemeTokens>).forEach((key) => {
    const value = tokens[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      result[CSS_VAR_MAP[key]] = value.trim();
    }
  });
  return result;
}

export function applyCustomThemeVars(
  element: HTMLElement,
  tokens: CustomThemeTokens | null,
): void {
  (Object.keys(CSS_VAR_MAP) as Array<keyof CustomThemeTokens>).forEach((key) => {
    const cssVar = CSS_VAR_MAP[key];
    const nextValue = tokens?.[key];
    if (tokens && typeof nextValue === 'string' && nextValue.trim().length > 0) {
      element.style.setProperty(cssVar, nextValue.trim());
    } else {
      element.style.removeProperty(cssVar);
    }
  });
}
