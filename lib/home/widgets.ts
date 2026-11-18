import type { LocaleCode } from '@/types/uphone';
import type { DesktopWidgetConfig, DesktopWidgetSize } from './types';

export const DEFAULT_DESKTOP_WIDGETS: readonly DesktopWidgetConfig[] = [
  { id: 'w_clock', type: 'clock', size: 'md', order: 0, isVisible: true },
  { id: 'w_date', type: 'date', size: 'sm', order: 1, isVisible: true },
  { id: 'w_weather', type: 'weather', size: 'sm', order: 2, isVisible: true },
  { id: 'w_note', type: 'note', size: 'md', order: 3, isVisible: true },
  { id: 'w_recent', type: 'recent_chats', size: 'md', order: 4, isVisible: true },
  { id: 'w_custom', type: 'custom_slot', size: 'md', order: 5, isVisible: false },
] as const;

export interface WidgetLayoutManager {
  widgets: DesktopWidgetConfig[];
  reorder: (sourceId: string, targetId: string) => DesktopWidgetConfig[];
  resize: (id: string, size: DesktopWidgetSize) => DesktopWidgetConfig[];
  toggleVisibility: (id: string) => DesktopWidgetConfig[];
}

export function sortDesktopWidgets(
  widgets: readonly DesktopWidgetConfig[],
): DesktopWidgetConfig[] {
  return [...widgets].sort((a, b) => a.order - b.order);
}

export function reorderDesktopWidgets(
  widgets: readonly DesktopWidgetConfig[],
  sourceId: string,
  targetId: string,
): DesktopWidgetConfig[] {
  if (sourceId === targetId) {
    return sortDesktopWidgets(widgets);
  }
  const ordered = sortDesktopWidgets(widgets);
  const fromIdx = ordered.findIndex((w) => w.id === sourceId);
  const toIdx = ordered.findIndex((w) => w.id === targetId);
  if (fromIdx < 0 || toIdx < 0) {
    return ordered;
  }

  const next = [...ordered];
  const [moved] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, moved);

  return next.map((item, idx) => ({ ...item, order: idx }));
}

export function updateDesktopWidgetSize(
  widgets: readonly DesktopWidgetConfig[],
  id: string,
  size: DesktopWidgetSize,
): DesktopWidgetConfig[] {
  return widgets.map((w) => (w.id === id ? { ...w, size } : w));
}

export function toggleDesktopWidgetVisibility(
  widgets: readonly DesktopWidgetConfig[],
  id: string,
): DesktopWidgetConfig[] {
  return widgets.map((w) => (w.id === id ? { ...w, isVisible: !w.isVisible } : w));
}

export interface ClockParts {
  timeText: string;
  secondsText: string;
  dateText: string;
  weekdayText: string;
  dayNumber: string;
  monthLabel: string;
  periodLabel: string;
}

export function formatClockParts(date: Date, locale: LocaleCode): ClockParts {
  const timeText = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  const secondsText = String(date.getSeconds()).padStart(2, '0');

  const dateText = new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
  }).format(date);

  const weekdayText = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
  }).format(date);

  const dayNumber = String(date.getDate());

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: 'short',
  }).format(date);

  const hour = date.getHours();
  const periodLabel =
    locale === 'zh-CN'
      ? hour < 6
        ? '凌晨'
        : hour < 12
          ? '上午'
          : hour < 18
            ? '下午'
            : '晚间'
      : hour < 12
        ? 'AM'
        : 'PM';

  return {
    timeText,
    secondsText,
    dateText,
    weekdayText,
    dayNumber,
    monthLabel,
    periodLabel,
  };
}
