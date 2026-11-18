'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  Database,
  FileCode2,
  KeyRound,
  Menu,
  Palette,
  Settings,
  Trash2,
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { useNavigationDrawer } from '@/components/navigation/NavigationProvider';
import { TopBar } from '@/components/layout/TopBar';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import {
  saveActiveUserProfile,
  validateAvatarFile,
  validateNickname,
} from '@/lib/storage/userService';
import {
  PROFILE_SETTINGS_ITEMS,
  RESERVED_ROUTES,
  type ProfileSettingsItem,
} from '@/lib/navigation/routes';

const SETTINGS_ICONS: Record<ProfileSettingsItem['id'], React.ReactNode> = {
  api_settings: <KeyRound className="h-4 w-4" strokeWidth={1.65} aria-hidden="true" />,
  appearance: <Palette className="h-4 w-4" strokeWidth={1.65} aria-hidden="true" />,
  data_management: <Database className="h-4 w-4" strokeWidth={1.65} aria-hidden="true" />,
  formatter: <FileCode2 className="h-4 w-4" strokeWidth={1.65} aria-hidden="true" />,
  general_settings: <Settings className="h-4 w-4" strokeWidth={1.65} aria-hidden="true" />,
};

export function UserProfileEditor() {
  const router = useRouter();
  const { locale } = useAppContext();
  const { openDrawer, user, avatarUrl, refreshUserProfile } = useNavigationDrawer();
  const { showToast } = useToast();
  const isZh = locale === 'zh-CN';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draftDisplayName, setDraftDisplayName] = useState<string | null>(null);
  const [draftBio, setDraftBio] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const displayName = draftDisplayName ?? user?.displayName ?? '';
  const bio = draftBio ?? user?.bio ?? '';

  const pendingPreviewUrl = useMemo(() => {
    if (!pendingFile || typeof URL === 'undefined') {
      return null;
    }
    return URL.createObjectURL(pendingFile);
  }, [pendingFile]);

  useEffect(() => {
    if (!pendingPreviewUrl) {
      return;
    }
    return () => {
      URL.revokeObjectURL(pendingPreviewUrl);
    };
  }, [pendingPreviewUrl]);

  const activePreviewSrc = removeAvatar ? null : (pendingPreviewUrl ?? avatarUrl);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const check = validateAvatarFile(file);
    if (!check.valid) {
      showToast({
        tone: 'danger',
        title: isZh ? '图片不可用' : 'Invalid image',
        description: check.reason,
      });
      return;
    }

    setPendingFile(file);
    setRemoveAvatar(false);
    event.target.value = '';
  };

  const handleRemoveAvatar = () => {
    setPendingFile(null);
    setRemoveAvatar(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const check = validateNickname(displayName);
    if (!check.valid) {
      setNameError(check.reason);
      return;
    }
    setNameError(undefined);
    setIsSaving(true);

    try {
      await saveActiveUserProfile({
        displayName,
        bio,
        newAvatarFile: pendingFile,
        removeAvatar,
      });
      await refreshUserProfile();
      setDraftDisplayName(null);
      setDraftBio(null);
      setPendingFile(null);
      setRemoveAvatar(false);
      showToast({
        tone: 'success',
        title: isZh ? '个人资料已保存' : 'Profile saved',
        description: isZh ? '头像与昵称已持久化至本地存储。' : 'Avatar and name persisted locally.',
      });
    } catch (error) {
      showToast({
        tone: 'danger',
        title: isZh ? '保存失败' : 'Save failed',
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="uphone-viewport flex min-h-[100dvh] flex-col bg-[var(--uphone-bg)] text-[var(--uphone-text)]">
      <TopBar
        left={
          <div className="flex items-center gap-1">
            <IconButton
              aria-label={isZh ? '打开左侧导航抽屉' : 'Open navigation drawer'}
              variant="ghost"
              onClick={openDrawer}
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </IconButton>
            <IconButton
              aria-label={isZh ? '返回桌面首页' : 'Back to Home'}
              variant="ghost"
              onClick={() => router.push(RESERVED_ROUTES.home)}
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </IconButton>
          </div>
        }
        title={isZh ? '个人资料与应用设置' : 'Profile & App Settings'}
      />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 py-6 pb-10 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Card variant="elevated" padding="lg" className="flex flex-col items-center gap-4 text-center">
            <Avatar
              src={activePreviewSrc}
              alt={displayName || 'Uphone User'}
              fallbackText={displayName || 'U'}
              size="xl"
              shape="squircle"
            />

            <div className="space-y-1">
              <h1 className="text-base font-semibold text-[var(--uphone-text)]">
                {displayName.trim() || 'Uphone User'}
              </h1>
              <p className="text-xs text-[var(--uphone-text-muted)]">
                {isZh
                  ? '头像将以二进制 Blob 独立存储于本地 IndexedDB'
                  : 'Avatar is stored as an independent Blob in IndexedDB'}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              aria-label={isZh ? '上传本地头像' : 'Upload local avatar'}
              onChange={handleFileChange}
              className="sr-only"
            />

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Camera className="h-4 w-4" strokeWidth={1.75} />}
                onClick={() => fileInputRef.current?.click()}
              >
                {isZh ? '上传本地头像' : 'Upload Avatar'}
              </Button>

              {activePreviewSrc && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="h-4 w-4" strokeWidth={1.75} />}
                  onClick={handleRemoveAvatar}
                >
                  {isZh ? '移除头像' : 'Remove'}
                </Button>
              )}
            </div>
          </Card>

          <Card variant="elevated" padding="md" className="space-y-4">
            <Input
              label={isZh ? 'User 昵称' : 'Display Name'}
              placeholder={isZh ? '输入你的显示昵称…' : 'Enter your display name…'}
              value={displayName}
              onChange={(e) => {
                setDraftDisplayName(e.target.value);
                if (nameError) {
                  setNameError(undefined);
                }
              }}
              error={nameError}
              maxLength={40}
            />

            <Textarea
              label={isZh ? '个人简介（可选）' : 'Bio (Optional)'}
              placeholder={isZh ? '简短介绍自己，预留用于后续对话设定…' : 'Short personal bio…'}
              value={bio}
              onChange={(e) => setDraftBio(e.target.value)}
              rows={3}
            />

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(RESERVED_ROUTES.home)}
              >
                {isZh ? '返回首页' : 'Home'}
              </Button>
              <Button type="submit" variant="primary" loading={isSaving}>
                {isZh ? '保存资料' : 'Save Profile'}
              </Button>
            </div>
          </Card>
        </form>

        {/* Consolidated App Settings Categories */}
        <Card variant="elevated" padding="md" className="space-y-2.5">
          <div className="px-1 pb-1">
            <h2 className="text-sm font-semibold text-[var(--uphone-text)]">
              {isZh ? '应用设置与工具' : 'App Settings & Tools'}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--uphone-text-muted)]">
              {isZh
                ? '统一管理 API、外观主题、数据备份、格式化与通用偏好。'
                : 'Unified entry for API, appearance, backup, formatting, and preferences.'}
            </p>
          </div>

          <div className="divide-y divide-[var(--uphone-border)] overflow-hidden rounded-[var(--uphone-radius-lg)] border border-[var(--uphone-border)] bg-[var(--uphone-surface)]">
            {PROFILE_SETTINGS_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => router.push(item.href)}
                className="flex min-h-[58px] w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--uphone-surface-muted)]/60 cursor-pointer"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--uphone-surface-muted)] text-[var(--uphone-accent)]">
                    {SETTINGS_ICONS[item.id]}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--uphone-text)]">
                      {isZh ? item.labelZh : item.labelEn}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-[var(--uphone-text-muted)]">
                      {isZh ? item.descriptionZh : item.descriptionEn}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-[var(--uphone-text-subtle)]"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
