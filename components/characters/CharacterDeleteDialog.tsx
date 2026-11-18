'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  deleteCharacterSafely,
  inspectCharacterRelations,
  type CharacterDeleteMode,
  type CharacterRelationSummary,
} from '@/lib/storage/characterService';

export interface CharacterDeleteTarget {
  id: string;
  name: string;
}

export interface CharacterDeleteDialogProps {
  target: CharacterDeleteTarget | null;
  locale: 'zh-CN' | 'en-US';
  onClose: () => void;
  onDeleted?: (characterId: string, mode: CharacterDeleteMode) => void;
}

export function CharacterDeleteDialog({
  target,
  locale,
  onClose,
  onDeleted,
}: CharacterDeleteDialogProps) {
  const isZh = locale === 'zh-CN';
  const { showToast } = useToast();
  const [relations, setRelations] = useState<CharacterRelationSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const targetId = target?.id ?? null;
  const activeRelations =
    targetId && relations?.characterId === targetId ? relations : null;
  const isInspecting = Boolean(targetId && !activeRelations);

  useEffect(() => {
    if (!targetId) {
      return;
    }
    let active = true;
    inspectCharacterRelations(targetId).then((summary) => {
      if (active) {
        setRelations(summary);
      }
    });
    return () => {
      active = false;
    };
  }, [targetId]);

  const handleDelete = async (mode: CharacterDeleteMode) => {
    if (!target || isDeleting) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteCharacterSafely(target.id, mode);
      showToast({
        tone: 'success',
        title:
          mode === 'with_relations'
            ? isZh
              ? `已删除「${target.name}」及全部关联数据`
              : `Deleted ${target.name} and all related data`
            : isZh
              ? `已删除角色「${target.name}」资料`
              : `Deleted profile for ${target.name}`,
        description:
          mode === 'profile_only' && activeRelations?.hasRelations
            ? isZh
              ? '原有聊天记录与记忆数据已保留。'
              : 'Existing conversations and memories have been preserved.'
            : undefined,
      });
      onDeleted?.(target.id, mode);
      onClose();
    } catch (error) {
      showToast({
        tone: 'danger',
        title: isZh ? '删除失败' : 'Delete failed',
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      open={Boolean(target)}
      onClose={isDeleting ? () => {} : onClose}
      title={
        target
          ? isZh
            ? `删除角色「${target.name}」`
            : `Delete "${target.name}"`
          : ''
      }
      description={
        isZh
          ? '请确认删除方式。建议优先仅删除角色资料，以保护历史对话与记忆。'
          : 'Please choose how to delete this character. Profile-only deletion preserves history.'
      }
      closeLabel={isZh ? '关闭删除确认' : 'Close delete confirmation'}
      footer={
        <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
          {isZh ? '取消' : 'Cancel'}
        </Button>
      }
    >
      {isInspecting ? (
        <div className="flex items-center justify-center py-6">
          <Loading size="sm" label={isZh ? '正在检查关联聊天记录与记忆…' : 'Checking related data…'} />
        </div>
      ) : (
        <div className="space-y-3.5 py-1">
          {activeRelations?.hasRelations ? (
            <div className="rounded-[var(--uphone-radius-lg)] border border-[var(--uphone-danger)]/25 bg-[var(--uphone-danger-soft)]/55 p-3.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--uphone-danger)]"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <div className="space-y-1 text-xs leading-relaxed text-[var(--uphone-text)]">
                  <p className="font-semibold text-[var(--uphone-danger)]">
                    {isZh ? '检测到该角色存在关联聊天记录或记忆数据' : 'Related chat history or memories detected'}
                  </p>
                  <p className="text-[var(--uphone-text-muted)]">
                    {isZh
                      ? `当前关联：${activeRelations.conversationCount} 个对话窗口 · ${activeRelations.messageCount} 条聊天消息 · ${activeRelations.memoryCount} 条记忆`
                      : `Found: ${activeRelations.conversationCount} chats · ${activeRelations.messageCount} messages · ${activeRelations.memoryCount} memories`}
                    {activeRelations.groupMembershipCount > 0
                      ? isZh
                        ? ` · ${activeRelations.groupMembershipCount} 个群聊成员记录`
                        : ` · ${activeRelations.groupMembershipCount} group memberships`
                      : ''}
                  </p>
                  <p className="text-[var(--uphone-text-muted)]">
                    {isZh
                      ? '若选择“仅删除角色资料”，历史对话与记忆将保留在本地数据库中；若选择“删除角色及全部关联数据”，相关记录将被彻底清除且无法恢复。'
                      : 'Profile-only deletion keeps chats & memories safe. Deleting everything permanently erases all linked records.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[var(--uphone-radius-lg)] border border-[var(--uphone-border)] bg-[var(--uphone-surface)] p-3.5">
              <div className="flex items-start gap-2.5">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--uphone-accent)]"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <p className="text-xs leading-relaxed text-[var(--uphone-text-muted)]">
                  {isZh
                    ? '未检测到该角色关联的聊天记录或记忆数据。删除后将从左侧角色列表和本地数据库中移除该角色资料。'
                    : 'No related chat history or memory records found. This character profile will be removed from local storage.'}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => handleDelete('profile_only')}
              className="flex min-h-[50px] w-full items-center justify-between gap-3 rounded-[var(--uphone-radius-lg)] border border-[var(--uphone-border-strong)] bg-[var(--uphone-surface)] px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--uphone-surface-muted)] disabled:opacity-50 cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--uphone-text)]">
                  {isZh ? '仅删除角色资料' : 'Delete Profile Only'}
                </p>
                <p className="mt-0.5 text-xs text-[var(--uphone-text-muted)]">
                  {activeRelations?.hasRelations
                    ? isZh
                      ? '安全模式：保留历史聊天记录与记忆数据'
                      : 'Safe: keeps chat history & memories'
                    : isZh
                      ? '移除该角色的个人资料与本地头像'
                      : 'Removes profile and local avatar'}
                </p>
              </div>
              <ShieldCheck
                className="h-4 w-4 shrink-0 text-[var(--uphone-accent)]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              disabled={isDeleting}
              onClick={() => handleDelete('with_relations')}
              className="flex min-h-[50px] w-full items-center justify-between gap-3 rounded-[var(--uphone-radius-lg)] border border-[var(--uphone-danger)]/25 bg-[var(--uphone-danger-soft)]/50 px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--uphone-danger-soft)] disabled:opacity-50 cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--uphone-danger)]">
                  {isZh ? '删除角色及全部关联数据' : 'Delete Character & All Related Data'}
                </p>
                <p className="mt-0.5 text-xs text-[var(--uphone-text-muted)]">
                  {isZh
                    ? '同时清除关联对话窗口、聊天消息、记忆与群聊关联（不可恢复）'
                    : 'Permanently removes linked chats, messages, and memories'}
                </p>
              </div>
              <Trash2
                className="h-4 w-4 shrink-0 text-[var(--uphone-danger)]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
