import { ModulePlaceholderView } from '@/components/navigation/ModulePlaceholderView';

export default function GeneralSettingsPlaceholderPage() {
  return (
    <ModulePlaceholderView
      titleZh="其他设置"
      titleEn="General Settings"
      descriptionZh="多语言、发送快捷键与触摸交互偏好设置将在后续阶段集中管理。"
      descriptionEn="Language, keyboard send behavior, and general app preferences will be built here."
      routePath="/settings/general"
    />
  );
}
