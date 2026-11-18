import { ModulePlaceholderView } from '@/components/navigation/ModulePlaceholderView';

export default function ChatPlaceholderPage() {
  return (
    <ModulePlaceholderView
      titleZh="聊天窗口"
      titleEn="Chat Workspace"
      descriptionZh="单人对话、多聊天窗口切换与短期记忆挂载将在后续阶段接入。"
      descriptionEn="Single chat, multi-window conversations, and memory mounting will be built in upcoming phases."
      routePath="/chat"
    />
  );
}
