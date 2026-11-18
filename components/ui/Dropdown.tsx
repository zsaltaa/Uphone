'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { popoverMenuVariants } from '@/lib/motion/presets';

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select',
  align = 'left',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn('relative flex flex-col gap-1.5', className)}>
      {label && (
        <span className="px-0.5 text-xs font-medium text-[var(--uphone-text-muted)]">{label}</span>
      )}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-[var(--uphone-radius-md)] border border-[var(--uphone-border)] bg-[var(--uphone-surface)] px-3.5 py-2 text-sm text-[var(--uphone-text)] shadow-[var(--uphone-shadow-xs)] transition-colors hover:bg-[var(--uphone-surface-muted)] cursor-pointer"
      >
        <span className="flex items-center gap-2 truncate">
          {selected?.icon}
          <span className="truncate">{selected ? selected.label : placeholder}</span>
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-[var(--uphone-text-muted)] transition-transform duration-150',
            isOpen && 'rotate-180',
          )}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            role="listbox"
            variants={popoverMenuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ transformOrigin: align === 'right' ? 'top right' : 'top left' }}
            className={cn(
              'uphone-glass absolute top-full z-40 mt-1.5 min-w-full overflow-hidden rounded-[var(--uphone-radius-lg)] border border-[var(--uphone-border)] p-1.5 shadow-[var(--uphone-shadow-md)]',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex min-h-[44px] w-full items-center justify-between gap-3 rounded-[var(--uphone-radius-sm)] px-3 py-2 text-left text-sm transition-colors cursor-pointer',
                      active
                        ? 'bg-[var(--uphone-accent-soft)] text-[var(--uphone-accent)] font-medium'
                        : 'text-[var(--uphone-text)] hover:bg-[var(--uphone-surface-muted)]',
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="min-w-0">
                        <div className="truncate">{opt.label}</div>
                        {opt.description && (
                          <div className="truncate text-[11px] text-[var(--uphone-text-muted)]">
                            {opt.description}
                          </div>
                        )}
                      </div>
                    </div>
                    {active && (
                      <Check className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
