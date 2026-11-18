'use client';

import React, { useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
import { Languages, Moon, Palette, Smartphone, Sun } from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { checkBrowserPersistenceSupport } from '@/lib/storage/repository';
import { UPHONE_SCHEMA_VERSION } from '@/types/uphone';
import { pageTransitionVariants } from '@/lib/motion/presets';
import { IconButton } from '@/components/ui/IconButton';
import { TopBar } from '@/components/layout/TopBar';

const emptySubscribe = () => () => {};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, toggleTheme, locale, toggleLocale, messages } = useAppContext();
  const indexedDbReady = useSyncExternalStore(
    emptySubscribe,
    () => checkBrowserPersistenceSupport().storageAvailable,
    () => null,
  );

  return (
    <div className="uphone-viewport flex flex-col bg-[var(--uphone-bg)] text-[var(--uphone-text)] transition-colors duration-200">
      <TopBar
        left={
          <div className="flex items-center gap-2 pl-1">
            <Smartphone className="h-5 w-5 shrink-0 text-[var(--uphone-accent)]" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[15px] font-semibold tracking-tight whitespace-nowrap">
              {messages.appName}
            </span>
          </div>
        }
        title={locale === 'zh-CN' ? '全局 UI 设计规范' : 'UI Design System'}
        right={
          <div className="flex items-center gap-1">
            <IconButton
              aria-label={messages.localeToggleLabel}
              variant="ghost"
              onClick={toggleLocale}
            >
              <Languages className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
            </IconButton>

            <IconButton
              aria-label={messages.themeToggleLabel}
              variant="ghost"
              onClick={toggleTheme}
            >
              {resolvedTheme === 'dark' ? (
                <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
              ) : resolvedTheme === 'custom' ? (
                <Palette className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
              )}
            </IconButton>
          </div>
        }
      />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-5 sm:px-6 sm:py-8">
        <motion.div
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          className="flex flex-1 flex-col"
        >
          {children}
        </motion.div>
      </main>

      <footer className="border-t border-[var(--uphone-border)] bg-[var(--uphone-surface)] pb-safe">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-[var(--uphone-text-muted)] sm:px-6">
          <span>
            {messages.appName} · Schema v<span className="tabular-nums">{UPHONE_SCHEMA_VERSION}</span>
          </span>
          <span>
            IndexedDB: {indexedDbReady === null ? '—' : indexedDbReady ? 'Supported' : 'Unavailable'}
          </span>
        </div>
      </footer>
    </div>
  );
}
