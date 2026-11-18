'use client';

import React from 'react';
import { LayoutGrid, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { LocaleCode } from '@/types/uphone';

export interface CustomSlotWidgetProps {
  locale: LocaleCode;
  onTap?: () => void;
}

export function CustomSlotWidget({ locale, onTap }: CustomSlotWidgetProps) {
  const isZh = locale === 'zh-CN';

  return (
    <Card
      variant="muted"
      padding="md"
      interactive
      onClick={onTap}
      className="flex h-full min-h-[144px] flex-col justify-between overflow-hidden border border-dashed border-[var(--uphone-border-strong)] bg-[var(--uphone-surface)]/65"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--uphone-text-muted)]">
          {isZh ? '扩展位' : 'Widget Slot'}
        </span>
        <LayoutGrid
          className="h-3.5 w-3.5 shrink-0 text-[var(--uphone-text-muted)]"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col items-start gap-1.5 min-w-0">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--uphone-surface-muted)] text-[var(--uphone-text-muted)]">
          <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <p className="truncate text-xs font-medium text-[var(--uphone-text)]">
          {isZh ? '自定义小组件' : 'Custom Widget'}
        </p>
      </div>
    </Card>
  );
}
