import { ModulePlaceholderView } from '@/components/navigation/ModulePlaceholderView';

export default function AppearancePlaceholderPage() {
  return (
    <ModulePlaceholderView
      titleZh="主题与字体"
      titleEn="Appearance"
      descriptionZh="全局主题配色、自定义壁纸与字体排版设置将在后续阶段接入完整编辑页。"
      descriptionEn="Theme palettes, wallpaper settings, and typography customization will be expanded here."
      routePath="/settings/appearance"
    />
  );
}
