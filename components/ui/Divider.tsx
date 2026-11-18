import React from 'react';
import { cn } from '@/lib/utils';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  inset?: boolean;
  className?: string;
}

export function Divider({
  orientation = 'horizontal',
  label,
  inset = false,
  className,
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('w-px self-stretch bg-[var(--uphone-border)]', className)}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn('flex items-center gap-3', inset && 'pl-14', className)}
      >
        <span className="h-px flex-1 bg-[var(--uphone-border)]" />
        <span className="text-xs text-[var(--uphone-text-muted)] whitespace-nowrap">{label}</span>
        <span className="h-px flex-1 bg-[var(--uphone-border)]" />
      </div>
    );
  }

  return (
    <hr
      className={cn(
        'h-px border-0 bg-[var(--uphone-border)]',
        inset && 'ml-14',
        className,
      )}
    />
  );
}
