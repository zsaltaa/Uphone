'use client';

import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, id, rows = 3, className, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-medium text-[var(--uphone-text-muted)] px-0.5"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          'w-full resize-y rounded-[var(--uphone-radius-md)] border bg-[var(--uphone-input-bg)] px-3.5 py-2.5 text-sm leading-relaxed text-[var(--uphone-text)] placeholder:text-[var(--uphone-text-subtle)] transition-colors duration-150 focus:bg-[var(--uphone-surface)] focus:outline-none disabled:opacity-50',
          error
            ? 'border-[var(--uphone-danger)]'
            : 'border-transparent focus:border-[var(--uphone-accent)]',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-[var(--uphone-danger)] px-0.5">{error}</p>
      ) : (
        hint && <p className="text-xs text-[var(--uphone-text-muted)] px-0.5">{hint}</p>
      )}
    </div>
  );
});
