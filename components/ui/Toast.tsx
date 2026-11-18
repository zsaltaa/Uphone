'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { toastVariants } from '@/lib/motion/presets';
import { cn } from '@/lib/utils';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_ICONS: Record<ToastTone, React.ReactNode> = {
  info: <Info className="h-4 w-4 shrink-0 text-[var(--uphone-accent)]" strokeWidth={1.75} aria-hidden="true" />,
  success: <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--uphone-success)]" strokeWidth={1.75} aria-hidden="true" />,
  warning: <TriangleAlert className="h-4 w-4 shrink-0 text-[var(--uphone-warning)]" strokeWidth={1.75} aria-hidden="true" />,
  danger: <AlertCircle className="h-4 w-4 shrink-0 text-[var(--uphone-danger)]" strokeWidth={1.75} aria-hidden="true" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const durationMs = item.durationMs ?? 3200;
      const next: ToastItem = { ...item, id };

      setToasts((prev) => [...prev.slice(-2), next]);

      if (durationMs > 0) {
        const timer = window.setTimeout(() => {
          dismissToast(id);
        }, durationMs);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 px-4 pt-safe mt-3"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const tone = toast.tone ?? 'info';
            return (
              <motion.div
                key={toast.id}
                role="status"
                variants={toastVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={cn(
                  'uphone-glass pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-[var(--uphone-radius-xl)] border border-[var(--uphone-border)] px-4 py-3 shadow-[var(--uphone-shadow-md)]',
                )}
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="mt-0.5">{TONE_ICONS[tone]}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--uphone-text)]">
                      {toast.title}
                    </p>
                    {toast.description && (
                      <p className="mt-0.5 text-xs text-[var(--uphone-text-muted)]">
                        {toast.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => dismissToast(toast.id)}
                  className="inline-flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-lg text-[var(--uphone-text-muted)] hover:bg-[var(--uphone-surface-muted)] cursor-pointer"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider.');
  }
  return ctx;
}
