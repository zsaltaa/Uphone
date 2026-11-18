'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { backdropVariants, modalVariants } from '@/lib/motion/presets';
import { IconButton } from './IconButton';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  closeLabel?: string;
  footer?: React.ReactNode;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  closeLabel = 'Close modal',
  footer,
  maxWidthClass = 'max-w-md',
  children,
}: ModalProps) {
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
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6 pb-safe">
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-[var(--uphone-overlay)]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="uphone-modal-title"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              'relative z-10 w-full overflow-hidden rounded-[var(--uphone-radius-2xl)] border border-[var(--uphone-border)] bg-[var(--uphone-surface-elevated)] shadow-[var(--uphone-shadow-lg)]',
              maxWidthClass,
            )}
          >
            <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
              <div className="min-w-0 space-y-1">
                <h2
                  id="uphone-modal-title"
                  className="text-base font-semibold text-[var(--uphone-text)]"
                >
                  {title}
                </h2>
                {description && (
                  <p className="text-xs leading-relaxed text-[var(--uphone-text-muted)]">
                    {description}
                  </p>
                )}
              </div>
              <IconButton
                aria-label={closeLabel}
                variant="ghost"
                onClick={onClose}
                className="-mr-2 -mt-1.5"
              >
                <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </IconButton>
            </div>

            <div className="max-h-[65dvh] overflow-y-auto px-5 py-2">{children}</div>

            {footer && (
              <div className="flex items-center justify-end gap-2.5 border-t border-[var(--uphone-border)] bg-[var(--uphone-surface)] px-5 py-3.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
