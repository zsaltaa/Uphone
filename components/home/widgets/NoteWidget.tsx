'use client';

import React, { useState } from 'react';
import { PencilLine, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import type { LocaleCode } from '@/types/uphone';
import type { NoteState } from '@/lib/home/types';
import { formatTimestamp } from '@/lib/formatters';

export interface NoteWidgetProps {
  note: NoteState;
  locale: LocaleCode;
  onSaveNote: (content: string) => Promise<void>;
}

export function NoteWidget({ note, locale, onSaveNote }: NoteWidgetProps) {
  const isZh = locale === 'zh-CN';
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);
  const [isSaving, setIsSaving] = useState(false);

  const openEditor = () => {
    setDraft(note.content);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveNote(draft.trimEnd());
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const hasContent = note.content.trim().length > 0;

  return (
    <>
      <Card
        variant="elevated"
        padding="md"
        interactive
        onClick={openEditor}
        className="flex h-full min-h-[132px] flex-col justify-between overflow-hidden [background:var(--uphone-card-note)]"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--uphone-text-muted)]">
            <StickyNote
              className="h-3.5 w-3.5 text-[var(--uphone-accent)]"
              strokeWidth={1.65}
              aria-hidden="true"
            />
            <span>{isZh ? '便签' : 'Quick Note'}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--uphone-text-subtle)]">
            <PencilLine className="h-3 w-3" strokeWidth={1.65} aria-hidden="true" />
            <span>{isZh ? '轻触编辑' : 'Edit'}</span>
          </span>
        </div>

        <p
          className={`my-2 line-clamp-3 text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
            hasContent ? 'text-[var(--uphone-text)]' : 'text-[var(--uphone-text-subtle)]'
          }`}
        >
          {hasContent
            ? note.content
            : isZh
              ? '记录今日片段、角色灵感或温柔备忘…'
              : 'Tap to jot down a quick note or idea…'}
        </p>

        <p className="truncate text-[11px] text-[var(--uphone-text-muted)] tabular-nums">
          {note.updatedAt > 0
            ? `${isZh ? '已保存' : 'Saved'} · ${formatTimestamp(note.updatedAt, locale)}`
            : isZh
              ? '本地持久保存'
              : 'Saved locally'}
        </p>
      </Card>

      <Modal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        title={isZh ? '编辑桌面便签' : 'Edit Quick Note'}
        description={
          isZh ? '保存后将持久化存储在本地数据库中。' : 'Saved notes persist locally in IndexedDB.'
        }
        closeLabel={isZh ? '关闭便签编辑' : 'Close note editor'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              {isZh ? '取消' : 'Cancel'}
            </Button>
            <Button variant="primary" loading={isSaving} onClick={handleSave}>
              {isZh ? '保存便签' : 'Save Note'}
            </Button>
          </>
        }
      >
        <Textarea
          label={isZh ? '便签内容' : 'Note Content'}
          placeholder={isZh ? '输入便签内容…' : 'Write your note…'}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
          autoFocus
        />
      </Modal>
    </>
  );
}
