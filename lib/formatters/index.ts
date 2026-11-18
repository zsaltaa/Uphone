import type { LocaleCode } from '@/types/uphone';

/**
 * Reserved formatting utilities layer for timestamps and message text normalization.
 */
export function formatTimestamp(timestampMs: number, locale: LocaleCode = 'zh-CN'): string {
  if (!Number.isFinite(timestampMs)) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestampMs));
}

export function truncateText(value: string, maxLength: number): string {
  if (maxLength <= 0) {
    return '';
  }
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
}
