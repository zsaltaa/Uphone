'use client';

import React from 'react';
import { ChevronRight, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import type { LocaleCode } from '@/types/uphone';

export interface RecentChatsWidgetProps {
  locale: LocaleCode;
  onTap?: () => void;
}

export function RecentChatsWidget({ locale, onTap }: RecentChatsWidgetProps) {
  const isZh = locale === 'zh-CN';

  return (
    <Card
      variant="elevated"
      padding="md"
      interactive
      onClick={onTap}
      className="flex h-full min-h-[152px] flex-col justify-between overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2 pb-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--uphone-text-muted)]">
          <MessageSquare
            className="h-3.5 w-3.5 text-[var(--uphone-accent)]"
            strokeWidth={1.65}
            aria-hidden="true"
          />
          <span>{isZh ? '最近聊天' : 'Recent Chats'}</span>
        </span>
        <span className="inline-flex items-center gap-0.5 text-[11px] text-[var(--uphone-text-subtle)]">
          <span>{isZh ? '角色列表' : 'Characters'}</span>
          <ChevronRight className="h-3 w-3" strokeWidth={1.65} aria-hidden="true" />
        </span>
      </div>

      <EmptyState
        bordered={false}
        icon={<MessageSquare className="h-4 w-4" strokeWidth={1.65} aria-hidden="true" />}
        title={isZh ? '暂无最近聊天' : 'No Recent Chats'}
        description={
          isZh
            ? '轻触此处打开左侧导航抽屉，查看或创建角色对话。'
            : 'Tap to open the navigation drawer and browse characters.'
        }
        className="px-2 py-4"
      />
    </Card>
  );
}
