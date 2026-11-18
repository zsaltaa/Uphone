'use client';

import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Settings, Users } from 'lucide-react';
import { buttonTapFeedback } from '@/lib/motion/presets';
import type { LocaleCode } from '@/types/uphone';

export type DockRouteId = 'chat' | 'characters' | 'settings';

export interface HomeDockProps {
  locale: LocaleCode;
  onSelectEntry: (entry: DockRouteId) => void;
}

export function HomeDock({ locale, onSelectEntry }: HomeDockProps) {
  const isZh = locale === 'zh-CN';

  const items: Array<{ id: DockRouteId; label: string; icon: React.ReactNode }> = [
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />,
    },
    {
      id: 'characters',
      label: 'Characters',
      icon: <Users className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />,
    },
  ];

  return (
    <nav
      aria-label={isZh ? '桌面底部快捷入口' : 'Home Dock'}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-safe mb-3"
    >
      <div className="uphone-glass pointer-events-auto flex items-center gap-2 rounded-[26px] border border-[var(--uphone-border)] px-3 py-2 shadow-[var(--uphone-shadow-md)] sm:gap-3 sm:px-4">
        {items.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => onSelectEntry(item.id)}
            {...buttonTapFeedback}
            className="flex min-h-[48px] min-w-[74px] flex-col items-center justify-center gap-1 rounded-[18px] px-3 py-1.5 text-[var(--uphone-text)] transition-colors hover:bg-[var(--uphone-surface-muted)]/75 cursor-pointer sm:min-w-[84px]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[var(--uphone-accent-soft)] text-[var(--uphone-accent)]">
              {item.icon}
            </span>
            <span className="text-[11px] font-medium leading-none tracking-tight whitespace-nowrap">
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
}
