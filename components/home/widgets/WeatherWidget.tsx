'use client';

import React from 'react';
import { CloudOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { LocaleCode } from '@/types/uphone';
import type { WeatherData } from '@/lib/home/types';

export interface WeatherWidgetProps {
  weather: WeatherData;
  locale: LocaleCode;
  onTap?: () => void;
}

export function WeatherWidget({ weather, locale, onTap }: WeatherWidgetProps) {
  const isZh = locale === 'zh-CN';

  return (
    <Card
      variant="elevated"
      padding="md"
      interactive
      onClick={onTap}
      className="flex h-full min-h-[118px] flex-col justify-between overflow-hidden [background:var(--uphone-card-lavender)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--uphone-text-muted)]">
          {isZh ? '天气' : 'Weather'}
        </span>
        <CloudOff className="h-3.5 w-3.5 shrink-0 text-[var(--uphone-text-subtle)]" strokeWidth={1.65} aria-hidden="true" />
      </div>

      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-medium text-[var(--uphone-text)]">
          {weather.configured
            ? weather.providerName
            : isZh
              ? '未配置天气'
              : 'Not Configured'}
        </p>
        <p className="line-clamp-2 text-[11px] leading-relaxed text-[var(--uphone-text-muted)]">
          {isZh ? '已预留天气接口' : 'Weather API reserved'}
        </p>
      </div>
    </Card>
  );
}
