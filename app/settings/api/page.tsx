import { ModulePlaceholderView } from '@/components/navigation/ModulePlaceholderView';

export default function ApiSettingsPlaceholderPage() {
  return (
    <ModulePlaceholderView
      titleZh="API 设置"
      titleEn="API Settings"
      descriptionZh="AI 模型接口配置、密钥管理与参数调节将在后续阶段开发。"
      descriptionEn="AI provider endpoints, model selection, and request parameters will be built in a later phase."
      routePath="/settings/api"
    />
  );
}
