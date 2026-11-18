import { ModulePlaceholderView } from '@/components/navigation/ModulePlaceholderView';

export default function FormatterPlaceholderPage() {
  return (
    <ModulePlaceholderView
      titleZh="格式化工具"
      titleEn="Formatter"
      descriptionZh="对话文本清洗、角色卡文本格式化与模板工具将在后续阶段开发。"
      descriptionEn="Dialogue normalization and roleplay text formatting utilities will be built in a later phase."
      routePath="/settings/formatter"
    />
  );
}
