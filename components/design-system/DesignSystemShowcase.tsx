'use client';

import React, { useState } from 'react';
import {
  Bell,
  Check,
  FolderOpen,
  Heart,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Palette,
  Plus,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import { useAppContext, type ThemeSelection } from '@/components/providers/AppProviders';
import { FONT_PRESETS } from '@/lib/theme/tokens';
import type { FontPreset } from '@/types/uphone';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Drawer,
  Dropdown,
  EmptyState,
  IconButton,
  Input,
  Loading,
  Modal,
  Popover,
  Textarea,
  useToast,
} from '@/components/ui';
import { BottomBar } from '@/components/layout/BottomBar';

const CUSTOM_ACCENT_PRESETS = [
  { name: 'Sage', accent: '#2f6f5e', bubbleSelf: '#2f6f5e', soft: 'rgba(47, 111, 94, 0.12)' },
  { name: 'Iris', accent: '#5b5bd6', bubbleSelf: '#5b5bd6', soft: 'rgba(91, 91, 214, 0.12)' },
  { name: 'Amber', accent: '#b45309', bubbleSelf: '#b45309', soft: 'rgba(180, 83, 9, 0.12)' },
  { name: 'Rose', accent: '#be185d', bubbleSelf: '#be185d', soft: 'rgba(190, 24, 93, 0.12)' },
] as const;

export function DesignSystemShowcase() {
  const {
    themeMode,
    resolvedTheme,
    setThemeMode,
    customThemeTokens,
    setCustomThemeTokens,
    fontPreset,
    setFontPreset,
    fontScale,
    setFontScale,
    locale,
  } = useAppContext();

  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState('ios-soft');
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const isZh = locale === 'zh-CN';

  const themeOptions: Array<{ id: ThemeSelection; label: string }> = [
    { id: 'light', label: isZh ? '浅色' : 'Light' },
    { id: 'dark', label: isZh ? '深色' : 'Dark' },
    { id: 'custom', label: isZh ? '自定义' : 'Custom' },
  ];

  const colorTokens = [
    { name: isZh ? '页面背景' : 'Page Bg', token: '--uphone-bg' },
    { name: isZh ? '卡片背景' : 'Surface', token: '--uphone-surface' },
    { name: isZh ? '主文字' : 'Text', token: '--uphone-text' },
    { name: isZh ? '次级文字' : 'Muted Text', token: '--uphone-text-muted' },
    { name: isZh ? '分割线' : 'Border', token: '--uphone-border-strong' },
    { name: isZh ? '强调色' : 'Accent', token: '--uphone-accent' },
    { name: isZh ? '输入框背景' : 'Input Bg', token: '--uphone-input-bg' },
    { name: isZh ? '气泡(己方)' : 'Self Bubble', token: '--uphone-bubble-self' },
    { name: isZh ? '弹出菜单' : 'Popover Bg', token: '--uphone-popover-bg' },
  ];

  const triggerLoadingPreview = () => {
    setIsButtonLoading(true);
    window.setTimeout(() => {
      setIsButtonLoading(false);
      showToast({
        tone: 'success',
        title: isZh ? '交互状态已确认' : 'Interaction confirmed',
        description: isZh ? '按钮加载反馈与 Toast 提示联动正常。' : 'Button loading and toast feedback verified.',
      });
    }, 900);
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Intro */}
      <section className="space-y-1.5 px-0.5">
        <p className="text-xs font-medium text-[var(--uphone-text-muted)]">
          {isZh ? '阶段二 · 视觉与交互基础规范' : 'Phase 2 · Visual & Interaction System'}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {isZh ? 'Uphone 移动优先 UI 组件与主题系统' : 'Uphone Mobile-First UI & Theme System'}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--uphone-text-muted)]">
          {isZh
            ? '基于 CSS 语义变量、44px+ 触摸热区、安全区适配与 Framer Motion 轻柔动效构建。切换下方主题与字体即可实时预览全套组件外观。'
            : 'Built with semantic CSS tokens, 44px+ touch targets, safe-area support, and gentle Framer Motion curves. Switch themes and fonts below to preview live tokens.'}
        </p>
      </section>

      {/* 1. Theme & Typography Controls */}
      <Card variant="elevated" padding="md" className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">
              {isZh ? '主题与字体系统' : 'Theme & Typography'}
            </h2>
            <p className="text-xs text-[var(--uphone-text-muted)]">
              {isZh ? '当前激活：' : 'Active: '}
              <span className="font-medium text-[var(--uphone-text)]">{resolvedTheme}</span>
              {' · '}
              {FONT_PRESETS[fontPreset][isZh ? 'labelZh' : 'labelEn']}
              {' · '}
              <span className="tabular-nums">{Math.round(fontScale * 100)}%</span>
            </p>
          </div>

          <div
            role="group"
            aria-label={isZh ? '主题模式选择' : 'Theme mode selector'}
            className="inline-flex rounded-[var(--uphone-radius-md)] bg-[var(--uphone-surface-muted)] p-1"
          >
            {themeOptions.map((opt) => {
              const active = themeMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setThemeMode(opt.id)}
                  className={`min-h-[38px] rounded-[var(--uphone-radius-sm)] px-3.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[var(--uphone-surface)] text-[var(--uphone-text)] shadow-[var(--uphone-shadow-xs)]'
                      : 'text-[var(--uphone-text-muted)] hover:text-[var(--uphone-text)]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {themeMode === 'custom' && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--uphone-radius-lg)] bg-[var(--uphone-surface-muted)] px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-medium text-[var(--uphone-text)]">
              <Palette className="h-4 w-4 text-[var(--uphone-accent)]" strokeWidth={1.75} aria-hidden="true" />
              {isZh ? '自定义强调色预设' : 'Custom Accent Swatch'}
            </span>
            <div className="flex items-center gap-2">
              {CUSTOM_ACCENT_PRESETS.map((preset) => {
                const selected = customThemeTokens.accent === preset.accent;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    aria-label={preset.name}
                    onClick={() =>
                      setCustomThemeTokens({
                        ...customThemeTokens,
                        accent: preset.accent,
                        bubbleSelf: preset.bubbleSelf,
                        accentSoft: preset.soft,
                      })
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-xs transition-transform active:scale-95 cursor-pointer"
                    style={{ backgroundColor: preset.accent }}
                  >
                    {selected && <Check className="h-4 w-4 text-white" strokeWidth={2.2} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Divider />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="text-xs font-medium text-[var(--uphone-text-muted)]">
              {isZh ? '字体预设（含中文排版适配）' : 'Font Family Preset'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(FONT_PRESETS) as FontPreset[]).map((presetKey) => {
                const preset = FONT_PRESETS[presetKey];
                const active = fontPreset === presetKey;
                return (
                  <button
                    key={presetKey}
                    type="button"
                    onClick={() => setFontPreset(presetKey)}
                    className={`min-h-[44px] rounded-[var(--uphone-radius-md)] border px-3 text-left text-xs transition-colors cursor-pointer ${
                      active
                        ? 'border-[var(--uphone-accent)] bg-[var(--uphone-accent-soft)] text-[var(--uphone-accent)] font-semibold'
                        : 'border-[var(--uphone-border)] bg-[var(--uphone-surface)] text-[var(--uphone-text)] hover:bg-[var(--uphone-surface-muted)]'
                    }`}
                  >
                    {isZh ? preset.labelZh : preset.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-[var(--uphone-text-muted)]">
              {isZh ? '字号缩放' : 'Font Scale'}
            </span>
            <div className="flex items-center gap-2">
              {[0.92, 1, 1.12].map((scale) => {
                const active = Math.abs(fontScale - scale) < 0.02;
                return (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setFontScale(scale)}
                    className={`min-h-[44px] flex-1 rounded-[var(--uphone-radius-md)] border text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                      active
                        ? 'border-[var(--uphone-accent)] bg-[var(--uphone-accent-soft)] text-[var(--uphone-accent)]'
                        : 'border-[var(--uphone-border)] bg-[var(--uphone-surface)] text-[var(--uphone-text)] hover:bg-[var(--uphone-surface-muted)]'
                    }`}
                  >
                    {Math.round(scale * 100)}%
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Color System & Chat Bubble Preview */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card padding="md" className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">
              {isZh ? 'CSS 主题色板' : 'Semantic Color Tokens'}
            </h2>
            <p className="text-xs text-[var(--uphone-text-muted)]">
              {isZh ? '所有组件统一读取 CSS 变量，无硬编码色值' : 'All components read CSS variables directly'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {colorTokens.map((item) => (
              <div
                key={item.token}
                className="flex flex-col gap-1.5 rounded-[var(--uphone-radius-md)] border border-[var(--uphone-border)] p-2"
              >
                <div
                  className="h-8 w-full rounded-[var(--uphone-radius-sm)] border border-[var(--uphone-border)]"
                  style={{ background: `var(${item.token})` }}
                />
                <span className="truncate text-[11px] font-medium text-[var(--uphone-text)]">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">
              {isZh ? '气泡与输入区域视觉规范' : 'Bubble & Composer Surface'}
            </h2>
            <p className="text-xs text-[var(--uphone-text-muted)]">
              {isZh ? '仅展示气泡色彩与圆角质感' : 'Visual preview of chat bubble and input tokens'}
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-[var(--uphone-radius-lg)] bg-[var(--uphone-bg)] p-4 border border-[var(--uphone-border)]">
            <div className="flex items-end gap-2.5">
              <Avatar alt="Character" fallbackText="AI" size="sm" />
              <div
                className="max-w-[78%] rounded-[18px] rounded-bl-[6px] px-3.5 py-2.5 text-sm leading-relaxed shadow-[var(--uphone-shadow-xs)]"
                style={{
                  backgroundColor: 'var(--uphone-bubble-other)',
                  color: 'var(--uphone-bubble-other-fg)',
                }}
              >
                {isZh
                  ? '轻盈柔和的圆角卡片与高对比文本，兼顾日间与夜间阅读舒适度。'
                  : 'Soft rounded bubbles with crisp contrast for comfortable day and night reading.'}
              </div>
            </div>

            <div className="flex items-end justify-end gap-2.5">
              <div
                className="max-w-[78%] rounded-[18px] rounded-br-[6px] px-3.5 py-2.5 text-sm leading-relaxed shadow-[var(--uphone-shadow-xs)]"
                style={{
                  backgroundColor: 'var(--uphone-bubble-self)',
                  color: 'var(--uphone-bubble-self-fg)',
                }}
              >
                {isZh ? '收到，触控与安全区视觉很清爽！' : 'Looks crisp and tactile on mobile!'}
              </div>
              <Avatar alt="User" fallbackText="U" size="sm" />
            </div>

            <div className="mt-1 flex items-center gap-2 rounded-[var(--uphone-radius-lg)] bg-[var(--uphone-input-bg)] px-3 py-1.5">
              <span className="flex-1 truncate text-xs text-[var(--uphone-text-subtle)]">
                {isZh ? '输入消息内容预览…' : 'Message input surface…'}
              </span>
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  backgroundColor: 'var(--uphone-accent)',
                  color: 'var(--uphone-accent-fg)',
                }}
              >
                <Send className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Buttons, IconButtons & Avatars */}
      <Card padding="md" className="space-y-5">
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Button & IconButton</h2>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" strokeWidth={1.75} />}>
              {isZh ? '主要按钮' : 'Primary'}
            </Button>
            <Button variant="secondary" onClick={triggerLoadingPreview} loading={isButtonLoading}>
              {isZh ? '点击测试加载' : 'Test Loading'}
            </Button>
            <Button variant="ghost" leftIcon={<Settings className="h-4 w-4" strokeWidth={1.75} />}>
              {isZh ? '幽灵按钮' : 'Ghost'}
            </Button>
            <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" strokeWidth={1.75} />}>
              {isZh ? '危险操作' : 'Danger'}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <IconButton aria-label="Search" variant="surface">
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </IconButton>
            <IconButton aria-label="Favorite" variant="ghost">
              <Heart className="h-5 w-5" strokeWidth={1.75} />
            </IconButton>
            <IconButton aria-label="Send" variant="accent" rounded="full">
              <Send className="h-5 w-5" strokeWidth={1.75} />
            </IconButton>
            <IconButton aria-label="Notifications" variant="surface" rounded="full">
              <Bell className="h-5 w-5" strokeWidth={1.75} />
            </IconButton>
            <IconButton aria-label="Delete" variant="danger">
              <Trash2 className="h-5 w-5" strokeWidth={1.75} />
            </IconButton>
          </div>
        </div>

        <Divider />

        <div className="space-y-3">
          <h2 className="text-base font-semibold">Avatar</h2>
          <div className="flex flex-wrap items-center gap-3.5">
            <Avatar alt="Extra Small" fallbackText="XS" size="xs" />
            <Avatar alt="Small" fallbackText="SM" size="sm" />
            <Avatar alt="Medium" fallbackText="林" size="md" />
            <Avatar alt="Large Circle" fallbackText="UP" size="lg" shape="circle" />
            <Avatar alt="Icon Fallback" size="lg" />
          </div>
        </div>
      </Card>

      {/* 4. Inputs, Textarea & Interactive Card */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card padding="md" className="space-y-4">
          <h2 className="text-base font-semibold">Input & Textarea</h2>
          <Input
            label={isZh ? '标准输入框' : 'Standard Input'}
            placeholder={isZh ? '输入角色名称或关键词…' : 'Type a name or keyword…'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            leftSlot={<Search className="h-4 w-4" strokeWidth={1.75} />}
            hint={isZh ? '默认高度 ≥ 44px，适配移动端触摸点击。' : 'Minimum 44px touch height.'}
          />
          <Input
            label={isZh ? '错误状态示例' : 'Error State'}
            defaultValue="invalid@"
            error={isZh ? '请输入有效的格式内容' : 'Please enter a valid format'}
          />
          <Textarea
            label={isZh ? '多行文本域' : 'Textarea'}
            placeholder={isZh ? '支持长文本与角色设定草稿输入…' : 'Supports multi-line draft text…'}
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            rows={3}
          />
        </Card>

        <div className="flex flex-col gap-4">
          <Card
            variant="elevated"
            padding="md"
            interactive
            onClick={() =>
              showToast({
                tone: 'info',
                title: isZh ? '卡片触控反馈' : 'Interactive Card Tap',
                description: isZh ? '已触发轻量位移与缩放回弹动画。' : 'Triggered spring tap feedback.',
              })
            }
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">
                {isZh ? '可交互卡片（点击预览）' : 'Interactive Card (Tap me)'}
              </h2>
              <Sparkles className="h-4 w-4 text-[var(--uphone-accent)]" strokeWidth={1.75} />
            </div>
            <p className="text-xs leading-relaxed text-[var(--uphone-text-muted)]">
              {isZh
                ? '统一 22px 柔和圆角与 1px 细腻边框，悬停轻抬、按下微缩，保持克制的 iOS 卡片质感。'
                : 'Unified 22px radius, hairline border, gentle hover lift and tap compression.'}
            </p>
          </Card>

          <Card variant="muted" padding="md" className="space-y-3">
            <h2 className="text-sm font-semibold">Divider & Loading</h2>
            <Divider label={isZh ? '分割线示例' : 'Section Divider'} />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Loading size="sm" label={isZh ? '行内加载中…' : 'Loading inline…'} />
              <Loading size="md" label={isZh ? '同步中' : 'Syncing'} />
            </div>
          </Card>

          <EmptyState
            icon={<FolderOpen className="h-5 w-5" strokeWidth={1.75} />}
            title={isZh ? '空状态组件 EmptyState' : 'EmptyState Component'}
            description={
              isZh
                ? '用于无角色、无会话或无记忆条目时的柔和引导提示。'
                : 'Clean empty placeholder for lists without items.'
            }
            action={
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  showToast({
                    tone: 'warning',
                    title: isZh ? '空状态引导动作' : 'Empty state action triggered',
                  })
                }
              >
                {isZh ? '示例引导操作' : 'Sample Action'}
              </Button>
            }
          />
        </div>
      </div>

      {/* 5. Overlays: Drawer, Modal, Popover, Dropdown, Toast */}
      <Card padding="md" className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">
            {isZh ? '浮层与交互菜单组件' : 'Overlays, Menus & Feedback'}
          </h2>
          <p className="text-xs text-[var(--uphone-text-muted)]">
            {isZh
              ? '包含左侧滑出抽屉、居中/底部自适应弹窗、毛玻璃气泡菜单、下拉选择器与顶部安全区 Toast。'
              : 'Left Drawer, Modal, frosted Popover, Dropdown selector, and safe-area Toast.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              leftIcon={<Menu className="h-4 w-4" strokeWidth={1.75} />}
              onClick={() => setDrawerOpen(true)}
            >
              {isZh ? '打开左侧抽屉' : 'Open Drawer'}
            </Button>

            <Button
              variant="primary"
              leftIcon={<SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />}
              onClick={() => setModalOpen(true)}
            >
              {isZh ? '打开弹窗 Modal' : 'Open Modal'}
            </Button>
          </div>

          <div className="flex items-center gap-2.5">
            <Popover
              align="left"
              trigger={({ toggle }) => (
                <Button
                  variant="secondary"
                  rightIcon={<MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />}
                  onClick={toggle}
                >
                  {isZh ? '气泡菜单 Popover' : 'Popover Menu'}
                </Button>
              )}
            >
              {(close) => (
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      showToast({ tone: 'info', title: isZh ? '选择了菜单项 A' : 'Selected Menu A' });
                      close();
                    }}
                    className="flex min-h-[44px] items-center gap-2.5 rounded-[var(--uphone-radius-sm)] px-3 text-left text-sm text-[var(--uphone-text)] hover:bg-[var(--uphone-surface-muted)] cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4 text-[var(--uphone-text-muted)]" strokeWidth={1.75} />
                    <span>{isZh ? '菜单操作项 A' : 'Action Item A'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showToast({ tone: 'success', title: isZh ? '选择了菜单项 B' : 'Selected Menu B' });
                      close();
                    }}
                    className="flex min-h-[44px] items-center gap-2.5 rounded-[var(--uphone-radius-sm)] px-3 text-left text-sm text-[var(--uphone-text)] hover:bg-[var(--uphone-surface-muted)] cursor-pointer"
                  >
                    <User className="h-4 w-4 text-[var(--uphone-text-muted)]" strokeWidth={1.75} />
                    <span>{isZh ? '菜单操作项 B' : 'Action Item B'}</span>
                  </button>
                </div>
              )}
            </Popover>

            <Button
              variant="ghost"
              onClick={() =>
                showToast({
                  tone: 'success',
                  title: isZh ? 'Toast 提示演示' : 'Toast Notification',
                  description: isZh ? '支持安全区顶部自适应定位。' : 'Positioned safely below notch/island.',
                })
              }
            >
              {isZh ? '触发 Toast' : 'Trigger Toast'}
            </Button>
          </div>

          <Dropdown
            label={isZh ? '下拉选择 Dropdown' : 'Dropdown Selector'}
            value={dropdownValue}
            onChange={(val) => {
              setDropdownValue(val);
              showToast({
                tone: 'info',
                title: isZh ? `已切换样式预设: ${val}` : `Preset selected: ${val}`,
              });
            }}
            options={[
              {
                value: 'ios-soft',
                label: isZh ? 'iOS 柔光玻璃' : 'iOS Soft Glass',
                description: isZh ? '默认轻盈毛玻璃质感' : 'Default frosted surface',
              },
              {
                value: 'minimal-paper',
                label: isZh ? '极简纸感' : 'Minimal Paper',
                description: isZh ? '高对比清晰阅读' : 'Crisp editorial contrast',
              },
              {
                value: 'midnight-slate',
                label: isZh ? '午夜深空' : 'Midnight Slate',
                description: isZh ? '低眩光夜间护眼' : 'Low-glare dark tone',
              },
            ]}
          />
        </div>
      </Card>

      {/* 6. BottomBar Spec Preview */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-5 pt-4 pb-3">
          <h2 className="text-sm font-semibold">
            {isZh ? '底部操作栏规范 BottomBar（含 Home Indicator 安全区）' : 'BottomBar Layout Rule'}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--uphone-text-muted)]">
            {isZh ? '统一最小触控高度与底部安全区留白' : 'Standardized bottom action bar with safe-area padding'}
          </p>
        </div>
        <BottomBar>
          <span className="text-xs text-[var(--uphone-text-muted)]">
            {isZh ? '底部操作区示例' : 'Bottom Action Bar'}
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setDrawerOpen(true)}>
              {isZh ? '抽屉' : 'Drawer'}
            </Button>
            <Button size="sm" variant="primary" onClick={() => setModalOpen(true)}>
              {isZh ? '确认操作' : 'Confirm'}
            </Button>
          </div>
        </BottomBar>
      </Card>

      {/* Interactive Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isZh ? '基础弹窗 Modal 规范' : 'Modal Dialog Specification'}
        description={
          isZh
            ? '移动端靠下居中展示并适配底部安全区，桌面端居中平滑弹出，支持 ESC 与蒙层关闭。'
            : 'Bottom-anchored on mobile with safe-area padding, centered on desktop, ESC and backdrop dismissible.'
        }
        closeLabel={isZh ? '关闭弹窗' : 'Close modal'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              {isZh ? '取消' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setModalOpen(false);
                showToast({
                  tone: 'success',
                  title: isZh ? '已关闭弹窗' : 'Modal confirmed',
                });
              }}
            >
              {isZh ? '确认' : 'Done'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 py-1">
          <Input
            label={isZh ? '弹窗内表单示例' : 'Modal Input Example'}
            placeholder={isZh ? '请输入内容…' : 'Enter value…'}
          />
        </div>
      </Modal>

      {/* Interactive Left Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={isZh ? '左侧导航抽屉规范' : 'Left Navigation Drawer'}
        subtitle={isZh ? '预留导航容器结构与弹簧滑出动效' : 'Navigation drawer container & spring motion'}
        closeLabel={isZh ? '关闭抽屉' : 'Close drawer'}
        footer={
          <Button fullWidth variant="secondary" onClick={() => setDrawerOpen(false)}>
            {isZh ? '收起抽屉' : 'Close Drawer'}
          </Button>
        }
      >
        <div className="flex flex-col gap-1.5">
          {[
            { icon: <SmartphoneIcon />, label: isZh ? '容器示例项 1' : 'Drawer Slot 1' },
            { icon: <MessageSquare className="h-4 w-4" strokeWidth={1.75} />, label: isZh ? '容器示例项 2' : 'Drawer Slot 2' },
            { icon: <Settings className="h-4 w-4" strokeWidth={1.75} />, label: isZh ? '容器示例项 3' : 'Drawer Slot 3' },
          ].map((slot) => (
            <button
              key={slot.label}
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                showToast({ tone: 'info', title: slot.label });
              }}
              className="flex min-h-[44px] w-full items-center gap-3 rounded-[var(--uphone-radius-md)] px-3 text-left text-sm font-medium text-[var(--uphone-text)] transition-colors hover:bg-[var(--uphone-surface-muted)] cursor-pointer"
            >
              <span className="text-[var(--uphone-text-muted)]">{slot.icon}</span>
              <span>{slot.label}</span>
            </button>
          ))}
        </div>
      </Drawer>
    </div>
  );
}

function SmartphoneIcon() {
  return <Sparkles className="h-4 w-4" strokeWidth={1.75} />;
}
