'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { backdropVariants, drawerLeftVariants } from '@/lib/motion/presets';
import { IconButton } from './IconButton';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  closeLabel?: string;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  closeLabel = 'Close drawer',
  footer,
  className,
  children,
}: DrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-[var(--uphone-overlay)]"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            variants={drawerLeftVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              'relative z-10 flex h-[100dvh] w-[82vw] max-w-[320px] flex-col border-r border-[var(--uphone-border)] bg-[var(--uphone-surface-elevated)] pt-safe pb-safe shadow-[var(--uphone-shadow-lg)]',
              className,
            )}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--uphone-border)] px-4 py-3.5">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-[var(--uphone-text)]">
                  {title}
                </h2>
                {subtitle && (
                  <p className="truncate text-xs text-[var(--uphone-text-muted)]">{subtitle}</p>
                )}
              </div>
              <IconButton aria-label={closeLabel} variant="ghost" onClick={onClose}>
                <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </IconButton>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">{children}</div>

            {footer && (
              <div className="border-t border-[var(--uphone-border)] px-4 py-3">{footer}</div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
