'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BottomBarProps {
  children: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

/**
 * Unified bottom action/dock bar respecting Home Indicator safe-area-inset-bottom
 * and virtual keyboard offset.
 */
export function BottomBar({ children, sticky = false, className }: BottomBarProps) {
  return (
    <div
      className={cn(
        'w-full border-t border-[var(--uphone-border)] bg-[var(--uphone-topbar-bg)] backdrop-blur-md pb-safe',
        sticky && 'sticky bottom-0 z-30',
        className,
      )}
    >
      <div className="mx-auto flex min-h-[var(--uphone-bottombar-h)] w-full max-w-5xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        {children}
      </div>
    </div>
  );
}
