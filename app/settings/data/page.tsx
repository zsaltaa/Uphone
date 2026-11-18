import { ModulePlaceholderView } from '@/components/navigation/ModulePlaceholderView';

export default function DataManagementPlaceholderPage() {
  return (
    <ModulePlaceholderView
      titleZh="数据管理"
      titleEn="Data Management"
      descriptionZh="JSON 全量数据导入导出、备份校验与本地存储清理将在后续阶段开发。"
      descriptionEn="JSON import/export, schema validation, and local storage tools will be built in a later phase."
      routePath="/settings/data"
    />
  );
}
