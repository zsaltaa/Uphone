'use client';

import { Database, Layers, Smartphone } from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { UPHONE_SCHEMA_VERSION } from '@/types/uphone';

export function FoundationOverview() {
  const { messages, locale } = useAppContext();

  const layers =
    locale === 'zh-CN'
      ? [
          { label: '数据实体与版本契约', detail: 'types/uphone.ts · 11 个核心模型' },
          { label: '本地持久化服务', detail: 'lib/storage/db.ts · Dexie + IndexedDB' },
          { label: 'API 请求服务层', detail: 'lib/api/client.ts · 统一请求抽象' },
          { label: '主题与多语言基座', detail: 'lib/theme/tokens.ts · lib/i18n/index.ts' },
        ]
      : [
          { label: 'Domain Types & Versioning', detail: 'types/uphone.ts · 11 core models' },
          { label: 'Local Persistence Layer', detail: 'lib/storage/db.ts · Dexie + IndexedDB' },
          { label: 'AI API Service Layer', detail: 'lib/api/client.ts · Provider adapter interface' },
          { label: 'Theme & Locale Foundation', detail: 'lib/theme/tokens.ts · lib/i18n/index.ts' },
        ];

  return (
    <section aria-labelledby="foundation-title" className="flex flex-1 flex-col gap-8">
      <div className="space-y-3 border-b border-[var(--uphone-border)] pb-6">
        <p className="text-xs font-medium text-[var(--uphone-text-muted)]">
          {messages.foundationBadge}
        </p>
        <h1
          id="foundation-title"
          className="max-w-2xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
        >
          {messages.foundationTitle}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--uphone-text-muted)] sm:text-base">
          {messages.foundationSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--uphone-border)] bg-[var(--uphone-surface)] p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--uphone-text-muted)]">
            <Layers className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{messages.stackLabel}</span>
          </div>
          <p className="mt-2.5 text-sm font-semibold">Next.js 15 · React 19 · TypeScript</p>
          <p className="mt-1 text-xs text-[var(--uphone-text-muted)]">
            Tailwind CSS v4 · Motion · Dexie.js
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--uphone-border)] bg-[var(--uphone-surface)] p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--uphone-text-muted)]">
            <Database className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{messages.dataSchemaLabel}</span>
          </div>
          <p className="mt-2.5 text-sm font-semibold tabular-nums">
            Schema v{UPHONE_SCHEMA_VERSION}
          </p>
          <p className="mt-1 text-xs text-[var(--uphone-text-muted)]">
            IndexedDB · Blob Asset Separation
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--uphone-border)] bg-[var(--uphone-surface)] p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--uphone-text-muted)]">
            <Smartphone className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{messages.viewportLabel}</span>
          </div>
          <p className="mt-2.5 text-sm font-semibold">100dvh · viewport-fit=cover</p>
          <p className="mt-1 text-xs text-[var(--uphone-text-muted)]">
            safe-area-inset · visualViewport
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--uphone-border)] bg-[var(--uphone-surface)] p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--uphone-border)] pb-4">
          <h2 className="text-base font-semibold">{messages.plannedModulesHeading}</h2>
          <span className="text-xs text-[var(--uphone-text-muted)]">
            {messages.architectureNote}
          </span>
        </div>

        <dl className="divide-y divide-[var(--uphone-border)]">
          {layers.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <dt className="text-sm font-medium">{item.label}</dt>
              <dd className="font-mono text-xs text-[var(--uphone-text-muted)]">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
