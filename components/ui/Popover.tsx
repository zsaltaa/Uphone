'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { popoverMenuVariants } from '@/lib/motion/presets';

export interface PopoverProps {
  trigger: (props: { isOpen: boolean; toggle: () => void }) => React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  children: (close: () => void) => React.ReactNode;
}

export function Popover({
  trigger,
  align = 'right',
  className,
  children,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="relative inline-block">
      {trigger({ isOpen, toggle: () => setIsOpen((prev) => !prev) })}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={popoverMenuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ transformOrigin: align === 'right' ? 'top right' : 'top left' }}
            className={cn(
              'uphone-glass absolute top-full z-40 mt-2 min-w-[210px] rounded-[var(--uphone-radius-lg)] border border-[var(--uphone-border)] p-2 shadow-[var(--uphone-shadow-md)]',
              align === 'right' ? 'right-0' : 'left-0',
              className,
            )}
          >
            {children(() => setIsOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
