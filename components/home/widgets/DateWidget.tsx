'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { LocaleCode } from '@/types/uphone';
import { formatClockParts } from '@/lib/home/widgets';

export interface DateWidgetProps {
  now: Date;
  locale: LocaleCode;
  onTap?: () => void;
}

export function DateWidget({ now, locale, onTap }: DateWidgetProps) {
  const parts = formatClockParts(now, locale);

  return (
    <Card
      variant="elevated"
      padding="md"
      interactive
      onClick={onTap}
      className="flex h-full min-h-[118px] flex-col justify-between overflow-hidden [background:var(--uphone-card-blush)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="truncate text-xs font-medium text-[var(--uphone-accent)]"
          suppressHydrationWarning
        >
          {parts.monthLabel}
        </span>
        <Calendar className="h-3.5 w-3.5 shrink-0 text-[var(--uphone-text-subtle)]" strokeWidth={1.65} aria-hidden="true" />
      </div>

      <div className="my-0.5 flex items-baseline gap-2 min-w-0">
        <span
          className="uphone-display-serif text-[38px] font-medium leading-none tracking-tight tabular-nums text-[var(--uphone-text)]"
          suppressHydrationWarning
        >
          {parts.dayNumber}
        </span>
      </div>

      <p
        className="truncate text-xs text-[var(--uphone-text-muted)]"
        suppressHydrationWarning
      >
        {parts.weekdayText}
      </p>
    </Card>
  );
}
