import React, { Suspense } from 'react';
import { CharacterEditorView } from '@/components/characters/CharacterEditorView';
import { Loading } from '@/components/ui/Loading';

export default function CharactersPage() {
  return (
    <Suspense
      fallback={
        <div className="uphone-viewport flex min-h-[100dvh] items-center justify-center bg-[var(--uphone-bg)]">
          <Loading size="md" label="正在加载角色页面…" />
        </div>
      }
    >
      <CharacterEditorView />
    </Suspense>
  );
}
