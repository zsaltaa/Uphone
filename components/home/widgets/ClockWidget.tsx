'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { LocaleCode } from '@/types/uphone';
import { formatClockParts } from '@/lib/home/widgets';

export interface ClockWidgetProps {
  now: Date;
  locale: LocaleCode;
  onTap?: () => void;
}

export function ClockWidget({ now, locale, onTap }: ClockWidgetProps) {
  const parts = formatClockParts(now, locale);
  const isZh = locale === 'zh-CN';

  return (
    <Card
      variant="elevated"
      padding="md"
      interactive
      onClick={onTap}
      className="flex h-full min-h-[128px] flex-col justify-between overflow-hidden [background:var(--uphone-card-champagne)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--uphone-text-muted)]">
          <Clock className="h-3.5 w-3.5 text-[var(--uphone-accent)]" strokeWidth={1.65} aria-hidden="true" />
          <span>{isZh ? '此刻' : 'Time'}</span>
        </span>
        <span
          className="text-xs font-medium text-[var(--uphone-text-muted)]"
          suppressHydrationWarning
        >
          {parts.periodLabel}
        </span>
      </div>

      <div className="my-1.5 flex items-baseline justify-between gap-3 min-w-0">
        <p
          className="uphone-display-serif text-[52px] font-medium leading-none tracking-tight tabular-nums text-[var(--uphone-text)] sm:text-[58px]"
          suppressHydrationWarning
        >
          {parts.timeText}
        </p>
        <p
          className="truncate text-xs text-[var(--uphone-text-muted)]"
          suppressHydrationWarning
        >
          {parts.dateText} · {parts.weekdayText}
        </p>
      </div>
    </Card>
  );
}
