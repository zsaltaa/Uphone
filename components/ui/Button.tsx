'use client';

import React, { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonTapFeedback } from '@/lib/motion/presets';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--uphone-accent)] text-[var(--uphone-accent-fg)] shadow-[var(--uphone-shadow-xs)] hover:opacity-92',
  secondary:
    'bg-[var(--uphone-surface)] text-[var(--uphone-text)] border border-[var(--uphone-border-strong)] shadow-[var(--uphone-shadow-xs)] hover:bg-[var(--uphone-surface-muted)]',
  ghost:
    'bg-transparent text-[var(--uphone-text)] hover:bg-[var(--uphone-surface-muted)]',
  danger:
    'bg-[var(--uphone-danger-soft)] text-[var(--uphone-danger)] hover:opacity-90',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[40px] px-3.5 py-2 text-xs rounded-[var(--uphone-radius-sm)] gap-1.5',
  md: 'min-h-[44px] px-4.5 py-2.5 text-sm rounded-[var(--uphone-radius-md)] gap-2',
  lg: 'min-h-[50px] px-6 py-3 text-[15px] rounded-[var(--uphone-radius-lg)] gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      {...(isDisabled ? {} : buttonTapFeedback)}
      className={cn(
        'inline-flex items-center justify-center font-medium leading-none whitespace-nowrap shrink-0 select-none transition-colors duration-150 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={1.75} aria-hidden="true" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>
      )}
      <span className="truncate">{children}</span>
      {!loading && rightIcon && (
        <span className="inline-flex shrink-0 items-center">{rightIcon}</span>
      )}
    </motion.button>
  );
});
