import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LoadingSize = 'sm' | 'md' | 'lg';
export type LoadingMode = 'inline' | 'block';

export interface LoadingProps {
  size?: LoadingSize;
  mode?: LoadingMode;
  label?: string;
  className?: string;
}

const ICON_SIZES: Record<LoadingSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

export function Loading({
  size = 'md',
  mode = 'inline',
  label,
  className,
}: LoadingProps) {
  if (mode === 'block') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'flex flex-col items-center justify-center gap-2.5 py-8 text-[var(--uphone-text-muted)]',
          className,
        )}
      >
        <Loader2
          className={cn('animate-spin text-[var(--uphone-accent)]', ICON_SIZES[size])}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        {label && <span className="text-xs font-medium">{label}</span>}
      </div>
    );
  }

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-2 text-xs font-medium text-[var(--uphone-text-muted)]',
        className,
      )}
    >
      <Loader2
        className={cn('animate-spin text-[var(--uphone-accent)]', ICON_SIZES[size])}
        strokeWidth={1.75}
        aria-hidden="true"
      />
      {label && <span>{label}</span>}
    </span>
  );
}
