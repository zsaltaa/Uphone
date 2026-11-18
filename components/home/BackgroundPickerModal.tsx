'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { HomeBackgroundConfig, HomeBackgroundPresetId } from '@/lib/home/types';
import type { LocaleCode } from '@/types/uphone';

export interface BackgroundPickerModalProps {
  open: boolean;
  onClose: () => void;
  locale: LocaleCode;
  value: HomeBackgroundConfig;
  onChange: (next: HomeBackgroundConfig) => Promise<void>;
  onToggleLocale?: () => void;
}

export const HOME_WALLPAPER_STYLES: Record<
  Exclude<HomeBackgroundPresetId, 'custom_image'>,
  { labelZh: string; labelEn: string; lightBg: string; darkBg: string }
> = {
  default: {
    labelZh: '奶油柔境',
    labelEn: 'Warm Cream',
    lightBg:
      'radial-gradient(120% 85% at 15% 8%, rgba(246, 226, 222, 0.58) 0%, transparent 56%), radial-gradient(100% 80% at 88% 92%, rgba(245, 232, 214, 0.52) 0%, transparent 60%), var(--uphone-bg)',
    darkBg:
      'radial-gradient(120% 85% at 15% 8%, rgba(122, 74, 86, 0.22) 0%, transparent 56%), radial-gradient(100% 80% at 88% 92%, rgba(92, 70, 96, 0.22) 0%, transparent 60%), var(--uphone-bg)',
  },
  mist: {
    labelZh: '淡紫薄暮',
    labelEn: 'Lavender Veil',
    lightBg:
      'radial-gradient(120% 90% at 18% 12%, rgba(226, 214, 245, 0.6) 0%, transparent 56%), radial-gradient(90% 80% at 86% 88%, rgba(246, 224, 230, 0.48) 0%, transparent 60%), var(--uphone-bg)',
    darkBg:
      'radial-gradient(120% 90% at 18% 12%, rgba(88, 66, 122, 0.32) 0%, transparent 56%), radial-gradient(90% 80% at 86% 88%, rgba(118, 68, 86, 0.26) 0%, transparent 60%), var(--uphone-bg)',
  },
  dawn: {
    labelZh: '裸粉香槟',
    labelEn: 'Nude Champagne',
    lightBg:
      'radial-gradient(110% 85% at 82% 10%, rgba(245, 225, 202, 0.62) 0%, transparent 55%), radial-gradient(100% 90% at 14% 85%, rgba(243, 208, 212, 0.5) 0%, transparent 60%), var(--uphone-bg)',
    darkBg:
      'radial-gradient(110% 85% at 82% 10%, rgba(118, 84, 62, 0.28) 0%, transparent 55%), radial-gradient(100% 90% at 14% 85%, rgba(124, 64, 78, 0.26) 0%, transparent 60%), var(--uphone-bg)',
  },
  midnight: {
    labelZh: '蔷薇暮色',
    labelEn: 'Rose Twilight',
    lightBg:
      'radial-gradient(120% 90% at 20% 15%, rgba(235, 202, 210, 0.56) 0%, transparent 56%), radial-gradient(95% 85% at 85% 85%, rgba(219, 208, 236, 0.52) 0%, transparent 60%), var(--uphone-bg)',
    darkBg:
      'radial-gradient(120% 90% at 20% 15%, rgba(108, 56, 74, 0.34) 0%, transparent 56%), radial-gradient(95% 85% at 85% 85%, rgba(72, 54, 96, 0.32) 0%, transparent 60%), var(--uphone-bg)',
  },
};

export function BackgroundPickerModal({
  open,
  onClose,
  locale,
  value,
  onChange,
  onToggleLocale,
}: BackgroundPickerModalProps) {
  const isZh = locale === 'zh-CN';
  const [customUrl, setCustomUrl] = useState(value.customImageUrl ?? '');

  const presetKeys = Object.keys(HOME_WALLPAPER_STYLES) as Array<
    Exclude<HomeBackgroundPresetId, 'custom_image'>
  >;

  const handleSelectPreset = async (presetId: Exclude<HomeBackgroundPresetId, 'custom_image'>) => {
    await onChange({ presetId, customImageUrl: value.customImageUrl });
    onClose();
  };

  const handleApplyCustomUrl = async () => {
    const trimmed = customUrl.trim();
    if (!trimmed) {
      return;
    }
    await onChange({ presetId: 'custom_image', customImageUrl: trimmed });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isZh ? '桌面氛围与背景' : 'Home Atmosphere & Wallpaper'}
      description={
        isZh
          ? '选择柔和预设氛围或自定义壁纸图片，设置将持久保留。'
          : 'Choose a soft atmosphere preset or custom wallpaper image URL.'
      }
      closeLabel={isZh ? '关闭背景设置' : 'Close background picker'}
      footer={
        <Button variant="ghost" onClick={onClose}>
          {isZh ? '关闭' : 'Close'}
        </Button>
      }
    >
      <div className="space-y-4 py-1">
        <div className="grid grid-cols-2 gap-2.5">
          {presetKeys.map((key) => {
            const item = HOME_WALLPAPER_STYLES[key];
            const active = value.presetId === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectPreset(key)}
                className={`flex min-h-[64px] items-center justify-between gap-2 rounded-[var(--uphone-radius-lg)] border p-3 text-left transition-colors cursor-pointer ${
                  active
                    ? 'border-[var(--uphone-accent)] bg-[var(--uphone-accent-soft)]'
                    : 'border-[var(--uphone-border)] bg-[var(--uphone-surface)] hover:bg-[var(--uphone-surface-muted)]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-8 w-8 shrink-0 rounded-xl border border-[var(--uphone-border)]"
                    style={{ background: item.lightBg }}
                  />
                  <span className="truncate text-xs font-medium text-[var(--uphone-text)]">
                    {isZh ? item.labelZh : item.labelEn}
                  </span>
                </div>
                {active && (
                  <Check
                    className="h-4 w-4 shrink-0 text-[var(--uphone-accent)]"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-2 border-t border-[var(--uphone-border)] pt-3">
          <Input
            label={isZh ? '自定义壁纸图片 URL（可选）' : 'Custom Image URL (Optional)'}
            placeholder="https://..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
          <Button
            size="sm"
            variant="secondary"
            fullWidth
            disabled={!customUrl.trim()}
            onClick={handleApplyCustomUrl}
          >
            {isZh ? '应用自定义图片背景' : 'Apply Custom Image'}
          </Button>
        </div>

        {onToggleLocale && (
          <div className="flex items-center justify-between border-t border-[var(--uphone-border)] pt-3">
            <span className="text-xs font-medium text-[var(--uphone-text-muted)]">
              {isZh ? '界面语言' : 'Language'}
            </span>
            <Button size="sm" variant="ghost" onClick={onToggleLocale}>
              {isZh ? '切换为 English' : 'Switch to 简体中文'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
