export interface ProfileSettingsItem {
  id:
    | 'api_settings'
    | 'appearance'
    | 'data_management'
    | 'formatter'
    | 'general_settings';
  href: string;
  labelEn: string;
  labelZh: string;
  descriptionEn: string;
  descriptionZh: string;
}

export const PROFILE_SETTINGS_ITEMS: readonly ProfileSettingsItem[] = [
  {
    id: 'api_settings',
    href: '/settings/api',
    labelEn: 'API Configuration',
    labelZh: 'API 配置',
    descriptionEn: 'Configure AI model providers, endpoints, and parameters.',
    descriptionZh: '配置 AI 模型接口地址、密钥与请求参数。',
  },
  {
    id: 'appearance',
    href: '/settings/appearance',
    labelEn: 'Themes & Fonts',
    labelZh: '主题与字体设置',
    descriptionEn: 'Customize light/dark/custom themes and font presets.',
    descriptionZh: '设置浅色、深色、自定义主题配色与字体样式。',
  },
  {
    id: 'data_management',
    href: '/settings/data',
    labelEn: 'Data Import & Export',
    labelZh: '数据导入导出',
    descriptionEn: 'Import, export, and back up local IndexedDB JSON bundles.',
    descriptionZh: '导入或导出本地 JSON 备份数据包。',
  },
  {
    id: 'formatter',
    href: '/settings/formatter',
    labelEn: 'Local Data Formatter',
    labelZh: '格式化本地数据的工具',
    descriptionEn: 'Format dialogue records, templates, and local structured data.',
    descriptionZh: '整理与格式化本地文本、提示词及结构化数据。',
  },
  {
    id: 'general_settings',
    href: '/settings/general',
    labelEn: 'Other App Settings',
    labelZh: '其他应用设置',
    descriptionEn: 'Additional app preferences reserved for future options.',
    descriptionZh: '预留用于后续扩展的通用应用偏好。',
  },
] as const;

export const RESERVED_ROUTES = {
  home: '/',
  profile: '/profile',
  chat: '/chat',
  characters: '/characters',
  apiSettings: '/settings/api',
  appearance: '/settings/appearance',
  dataManagement: '/settings/data',
  formatter: '/settings/formatter',
  generalSettings: '/settings/general',
} as const;
