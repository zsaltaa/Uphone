import type { LocaleCode } from '@/types/uphone';

export interface ShellMessages {
  appName: string;
  foundationBadge: string;
  foundationTitle: string;
  foundationSubtitle: string;
  themeToggleLabel: string;
  localeToggleLabel: string;
  architectureHeading: string;
  architectureNote: string;
  stackLabel: string;
  dataSchemaLabel: string;
  viewportLabel: string;
  plannedModulesHeading: string;
}

const MESSAGES: Record<LocaleCode, ShellMessages> = {
  'zh-CN': {
    appName: 'Uphone',
    foundationBadge: '基础工程已就绪',
    foundationTitle: 'Uphone 跨平台应用基础架构',
    foundationSubtitle:
      '已完成 Next.js App Router 路由入口、全局安全区样式、Dexie/IndexedDB 核心数据模型及服务层预留。具体业务模块将在后续阶段逐步构建。',
    themeToggleLabel: '切换外观主题',
    localeToggleLabel: '切换语言',
    architectureHeading: '核心工程基座',
    architectureNote: '当前处于基础工程阶段，不加载模拟对话或虚构角色数据。',
    stackLabel: '技术栈',
    dataSchemaLabel: '数据模型版本',
    viewportLabel: '全屏与安全区适配',
    plannedModulesHeading: '已预留扩展接口',
  },
  'en-US': {
    appName: 'Uphone',
    foundationBadge: 'Foundation Ready',
    foundationTitle: 'Uphone Cross-Platform App Foundation',
    foundationSubtitle:
      'Next.js App Router entry, safe-area viewport CSS, Dexie/IndexedDB schema, and service layers are initialized. Feature modules will be built in subsequent milestones.',
    themeToggleLabel: 'Toggle theme',
    localeToggleLabel: 'Switch language',
    architectureHeading: 'Core Engineering Base',
    architectureNote: 'Foundation phase only — no mock chats or placeholder character data are loaded.',
    stackLabel: 'Stack',
    dataSchemaLabel: 'Schema Version',
    viewportLabel: 'Viewport & Safe Area',
    plannedModulesHeading: 'Reserved Layer Contracts',
  },
};

export function getLocaleMessages(locale: LocaleCode): ShellMessages {
  return MESSAGES[locale] ?? MESSAGES['zh-CN'];
}

export const SUPPORTED_LOCALES: readonly LocaleCode[] = ['zh-CN', 'en-US'] as const;
