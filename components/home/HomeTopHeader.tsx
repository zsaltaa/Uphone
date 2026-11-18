'use client';

import React from 'react';
import { Image as ImageIcon, Menu, Moon, Palette, Sun } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import type { LocaleCode } from '@/types/uphone';

export interface HomeTopHeaderProps {
  locale: LocaleCode;
  resolvedTheme: 'light' | 'dark' | 'custom';
  onOpenDrawer?: () => void;
  onOpenBackgroundPicker: () => void;
  onToggleTheme: () => void;
}

export function HomeTopHeader({
  locale,
  resolvedTheme,
  onOpenDrawer,
  onOpenBackgroundPicker,
  onToggleTheme,
}: HomeTopHeaderProps) {
  const isZh = locale === 'zh-CN';

  return (
    <header className="pt-safe px-4 pt-2 pb-1 sm:px-6">
      <div className="mx-auto flex h-12 w-full max-w-[680px] items-center justify-between gap-2">
        <IconButton
          aria-label={isZh ? '打开左侧导航抽屉' : 'Open navigation drawer'}
          variant="ghost"
          onClick={onOpenDrawer}
          className="text-[var(--uphone-text)] hover:bg-[var(--uphone-accent-soft)]"
        >
          <Menu className="h-5 w-5" strokeWidth={1.65} aria-hidden="true" />
        </IconButton>

        <span className="uphone-display-serif select-none text-[19px] font-medium tracking-[0.08em] text-[var(--uphone-text)]">
          Uphone
        </span>

        <div className="flex items-center gap-0.5">
          <IconButton
            aria-label={isZh ? '自定义桌面背景' : 'Customize home wallpaper'}
            variant="ghost"
            onClick={onOpenBackgroundPicker}
            className="text-[var(--uphone-text-muted)] hover:bg-[var(--uphone-accent-soft)] hover:text-[var(--uphone-text)]"
          >
            <ImageIcon className="h-[18px] w-[18px]" strokeWidth={1.65} aria-hidden="true" />
          </IconButton>

          <IconButton
            aria-label={isZh ? '切换外观主题' : 'Toggle theme'}
            variant="ghost"
            onClick={onToggleTheme}
            className="text-[var(--uphone-text-muted)] hover:bg-[var(--uphone-accent-soft)] hover:text-[var(--uphone-text)]"
          >
            {resolvedTheme === 'dark' ? (
              <Moon className="h-[18px] w-[18px]" strokeWidth={1.65} aria-hidden="true" />
            ) : resolvedTheme === 'custom' ? (
              <Palette className="h-[18px] w-[18px]" strokeWidth={1.65} aria-hidden="true" />
            ) : (
              <Sun className="h-[18px] w-[18px]" strokeWidth={1.65} aria-hidden="true" />
            )}
          </IconButton>
        </div>
      </div>
    </header>
  );
}
