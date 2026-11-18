'use client';

import React from 'react';
import { Quote, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { LocaleCode } from '@/types/uphone';
import type { QuoteItem } from '@/lib/home/types';

export interface QuoteWidgetProps {
  quote: QuoteItem;
  locale: LocaleCode;
  onCycleQuote: () => void;
}

export function QuoteWidget({ quote, locale, onCycleQuote }: QuoteWidgetProps) {
  const isZh = locale === 'zh-CN';
  const quoteText = isZh ? quote.textZh : quote.textEn;

  return (
    <Card
      variant="elevated"
      padding="md"
      interactive
      onClick={onCycleQuote}
      className="flex h-full min-h-[144px] flex-col justify-between overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--uphone-text-muted)]">
          <Quote className="h-3.5 w-3.5 text-[var(--uphone-accent)]" strokeWidth={1.75} aria-hidden="true" />
          <span>{isZh ? '每日一句' : 'Daily Quote'}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--uphone-text-subtle)]">
          <RefreshCw className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
          <span>{isZh ? '轻触更换' : 'Tap'}</span>
        </span>
      </div>

      <p className="my-2 line-clamp-3 text-sm font-medium leading-relaxed text-[var(--uphone-text)]">
        {quoteText}
      </p>

      <p className="truncate text-[11px] text-[var(--uphone-text-muted)]">{quote.author}</p>
    </Card>
  );
}
