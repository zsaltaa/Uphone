'use client';

import React, { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';
import { buttonTapFeedback } from '@/lib/motion/presets';

export type IconButtonVariant = 'ghost' | 'surface' | 'accent' | 'danger';
export type IconButtonSize = 'md' | 'lg';

export interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  'aria-label': string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  rounded?: 'full' | 'squircle';
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  ghost: 'bg-transparent text-[var(--uphone-text)] hover:bg-[var(--uphone-surface-muted)]',
  surface:
    'bg-[var(--uphone-surface)] text-[var(--uphone-text)] border border-[var(--uphone-border)] shadow-[var(--uphone-shadow-xs)] hover:bg-[var(--uphone-surface-muted)]',
  accent:
    'bg-[var(--uphone-accent)] text-[var(--uphone-accent-fg)] shadow-[var(--uphone-shadow-xs)] hover:opacity-92',
  danger: 'bg-[var(--uphone-danger-soft)] text-[var(--uphone-danger)] hover:opacity-90',
};

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  md: 'min-h-[44px] min-w-[44px] h-11 w-11',
  lg: 'min-h-[48px] min-w-[48px] h-12 w-12',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    variant = 'ghost',
    size = 'md',
    rounded = 'squircle',
    disabled,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      {...(disabled ? {} : buttonTapFeedback)}
      className={cn(
        'inline-flex items-center justify-center shrink-0 select-none transition-colors duration-150 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed',
        rounded === 'full' ? 'rounded-full' : 'rounded-[var(--uphone-radius-md)]',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
});
