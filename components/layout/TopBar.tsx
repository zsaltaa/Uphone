'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TopBarProps {
  left?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

/**
 * Unified iOS-inspired sticky top bar respecting safe-area-inset-top
 * and keeping height compact (<= 15% mobile sticky cap).
 */
export function TopBar({ left, title, subtitle, right, className }: TopBarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-[var(--uphone-border)] pt-safe backdrop-blur-md transition-colors duration-150',
        'bg-[var(--uphone-topbar-bg)]',
        className,
      )}
    >
      <div className="mx-auto flex h-[var(--uphone-topbar-h)] w-full max-w-5xl items-center justify-between gap-3 px-3 sm:px-6">
        <div className="flex min-w-[44px] items-center justify-start gap-1">{left}</div>

        <div className="flex min-w-0 flex-1 flex-col items-center justify-center text-center">
          {title && (
            <div className="max-w-full truncate text-[15px] font-semibold tracking-tight text-[var(--uphone-text)]">
              {title}
            </div>
          )}
          {subtitle && (
            <div className="max-w-full truncate text-[11px] text-[var(--uphone-text-muted)]">
              {subtitle}
            </div>
          )}
        </div>

        <div className="flex min-w-[44px] items-center justify-end gap-1.5">{right}</div>
      </div>
    </header>
  );
}
