import React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  bordered?: boolean;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  bordered = true,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--uphone-radius-xl)] px-6 py-8 text-center',
        bordered
          ? 'border border-dashed border-[var(--uphone-border-strong)] bg-[var(--uphone-surface)]'
          : 'bg-transparent',
        className,
      )}
    >
      {icon && (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--uphone-surface-muted)] text-[var(--uphone-accent)]">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-[var(--uphone-text)]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[var(--uphone-text-muted)]">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
