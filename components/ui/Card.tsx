'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { cardInteractiveMotion } from '@/lib/motion/presets';

export type CardVariant = 'default' | 'elevated' | 'muted';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default:
    'bg-[var(--uphone-surface)] border border-[var(--uphone-border)] shadow-[var(--uphone-shadow-xs)]',
  elevated:
    'bg-[var(--uphone-surface-elevated)] border border-[var(--uphone-border)] shadow-[var(--uphone-shadow-sm)]',
  muted:
    'bg-[var(--uphone-surface-muted)] border border-transparent',
};

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3.5',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
};

export function Card({
  variant = 'default',
  padding = 'md',
  interactive = false,
  onClick,
  className,
  children,
}: CardProps) {
  const isClickable = Boolean(interactive || onClick);

  if (isClickable) {
    return (
      <motion.div
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        {...cardInteractiveMotion}
        className={cn(
          'rounded-[var(--uphone-radius-xl)] transition-shadow duration-150 cursor-pointer hover:shadow-[var(--uphone-shadow-sm)]',
          VARIANT_CLASSES[variant],
          PADDING_CLASSES[padding],
          className,
        )}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-[var(--uphone-radius-xl)]',
        VARIANT_CLASSES[variant],
        PADDING_CLASSES[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
