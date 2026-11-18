'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Construction, Menu } from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { useNavigationDrawer } from '@/components/navigation/NavigationProvider';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { RESERVED_ROUTES } from '@/lib/navigation/routes';

export interface ModulePlaceholderViewProps {
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  routePath: string;
}

export function ModulePlaceholderView({
  titleZh,
  titleEn,
  descriptionZh,
  descriptionEn,
  routePath,
}: ModulePlaceholderViewProps) {
  const router = useRouter();
  const { locale } = useAppContext();
  const { openDrawer } = useNavigationDrawer();
  const isZh = locale === 'zh-CN';

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
        title={isZh ? titleZh : titleEn}
      />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-8 sm:px-6">
        <EmptyState
          icon={<Construction className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />}
          title={isZh ? `${titleZh} · 待开发模块` : `${titleEn} · Upcoming Module`}
          description={`${isZh ? descriptionZh : descriptionEn} (${routePath})`}
          action={
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {routePath.startsWith('/settings') ? (
                <Button variant="secondary" onClick={() => router.push(RESERVED_ROUTES.profile)}>
                  {isZh ? '返回个人资料与设置' : 'Back to Profile & Settings'}
                </Button>
              ) : (
                <Button variant="secondary" onClick={openDrawer}>
                  {isZh ? '打开导航抽屉' : 'Open Drawer'}
                </Button>
              )}
              <Button variant="primary" onClick={() => router.push(RESERVED_ROUTES.home)}>
                {isZh ? '返回手机桌面' : 'Back to Home'}
              </Button>
            </div>
          }
        />
      </main>
    </div>
  );
}
