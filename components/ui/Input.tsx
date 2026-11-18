'use client';

import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftSlot, rightSlot, id, className, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-[var(--uphone-text-muted)] px-0.5"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex min-h-[44px] w-full items-center gap-2 rounded-[var(--uphone-radius-md)] border bg-[var(--uphone-input-bg)] px-3.5 transition-colors duration-150 focus-within:bg-[var(--uphone-surface)]',
          error
            ? 'border-[var(--uphone-danger)]'
            : 'border-transparent focus-within:border-[var(--uphone-accent)]',
        )}
      >
        {leftSlot && (
          <span className="inline-flex shrink-0 items-center text-[var(--uphone-text-muted)]">
            {leftSlot}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            'w-full bg-transparent py-2.5 text-sm text-[var(--uphone-text)] placeholder:text-[var(--uphone-text-subtle)] focus:outline-none disabled:opacity-50',
            className,
          )}
          {...props}
        />
        {rightSlot && (
          <span className="inline-flex shrink-0 items-center text-[var(--uphone-text-muted)]">
            {rightSlot}
          </span>
        )}
      </div>
      {error ? (
        <p className="text-xs text-[var(--uphone-danger)] px-0.5">{error}</p>
      ) : (
        hint && <p className="text-xs text-[var(--uphone-text-muted)] px-0.5">{hint}</p>
      )}
    </div>
  );
});
