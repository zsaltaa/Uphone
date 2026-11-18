export const UPHONE_SCHEMA_VERSION = 1 as const;

export type EntityId = string;
export type TimestampMs = number;

export interface EntityTimestamps {
  createdAt: TimestampMs;
  updatedAt: TimestampMs;
}

export type ThemeMode = 'system' | 'light' | 'dark';
export type FontPreset = 'jakarta' | 'system' | 'serif' | 'mono';
export type LocaleCode = 'zh-CN' | 'en-US';

export type MediaAssetKind = 'avatar' | 'wallpaper' | 'attachment' | 'icon';

export interface MediaAsset extends EntityTimestamps {
  id: EntityId;
  kind: MediaAssetKind;
  mimeType: string;
  sizeBytes: number;
  fileName?: string;
  width?: number;
  height?: number;
  checksum?: string;
}

export interface MediaAssetRecord extends MediaAsset {
  blob: Blob;
}

export interface User extends EntityTimestamps {
  id: EntityId;
  displayName: string;
  handle?: string;
  avatarAssetId?: EntityId;
  bio?: string;
  personaPrompt?: string;
  isDefault: boolean;
}

export interface CharacterCustomField {
  id: string;
  key: string;
  value: string;
}

export interface Character extends EntityTimestamps {
  id: EntityId;
  name: string;
  nickname?: string;
  avatar?: string;
  avatarAssetId?: EntityId;
  remark?: string;
  tagline?: string;
  gender?: string;
  age?: string;
  persona?: string;
  personality?: string;
  appearance?: string;
  speakingStyle?: string;
  background?: string;
  relationship?: string;
  otherNotes?: string;
  customFields?: CharacterCustomField[];
  isPinned?: boolean;
  personaPrompt: string;
  greeting?: string;
  scenario?: string;
  exampleDialogue?: string;
  defaultApiConfigId?: EntityId;
  tags: string[];
  isArchived: boolean;
}

export type ConversationKind = 'single' | 'group';

export interface Conversation extends EntityTimestamps {
  id: EntityId;
  kind: ConversationKind;
  title: string;
  characterId?: EntityId;
  groupId?: EntityId;
  userId: EntityId;
  apiConfigId?: EntityId;
  systemOverride?: string;
  shortTermLimit: number;
  isPinned: boolean;
  isArchived: boolean;
  lastMessageAt?: TimestampMs;
}

export type MessageSenderType = 'user' | 'character' | 'system';
export type MessageStatus = 'pending' | 'streaming' | 'sent' | 'error';

export interface Message extends EntityTimestamps {
  id: EntityId;
  conversationId: EntityId;
  senderType: MessageSenderType;
  senderId: EntityId;
  content: string;
  attachmentAssetIds: EntityId[];
  replyToMessageId?: EntityId;
  status: MessageStatus;
  errorMessage?: string;
  tokenUsage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface Group extends EntityTimestamps {
  id: EntityId;
  name: string;
  description?: string;
  avatarAssetId?: EntityId;
  topicPrompt?: string;
  isArchived: boolean;
}

export type GroupMemberType = 'user' | 'character';
export type GroupMemberRole = 'owner' | 'member';

export interface GroupMember extends EntityTimestamps {
  id: EntityId;
  groupId: EntityId;
  memberType: GroupMemberType;
  userId?: EntityId;
  characterId?: EntityId;
  role: GroupMemberRole;
  displayAlias?: string;
  orderIndex: number;
  isMuted: boolean;
}

export type MemoryScope = 'short_term' | 'long_term';

export interface Memory extends EntityTimestamps {
  id: EntityId;
  scope: MemoryScope;
  characterId?: EntityId;
  conversationId?: EntityId;
  title: string;
  content: string;
  summary?: string;
  importance: number;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
}

export type MemoryMountMode = 'inject' | 'reference';

export interface MemoryLink extends EntityTimestamps {
  id: EntityId;
  memoryId: EntityId;
  targetConversationId: EntityId;
  sourceConversationId?: EntityId;
  characterId?: EntityId;
  mountMode: MemoryMountMode;
  priority: number;
  isEnabled: boolean;
}

export type ApiProviderType = 'openai_compatible' | 'gemini' | 'anthropic' | 'custom';

export interface ApiConfig extends EntityTimestamps {
  id: EntityId;
  name: string;
  provider: ApiProviderType;
  baseUrl: string;
  model: string;
  apiKeyRef?: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
  isDefault: boolean;
  isEnabled: boolean;
}

export interface AppSettings extends EntityTimestamps {
  id: EntityId;
  schemaVersion: number;
  locale: LocaleCode;
  themeMode: ThemeMode;
  fontPreset: FontPreset;
  fontScale: number;
  wallpaperAssetId?: EntityId;
  activeUserId?: EntityId;
  reducedMotion: boolean;
  sendWithEnter: boolean;
}

export interface UphoneExportData {
  users: User[];
  characters: Character[];
  conversations: Conversation[];
  messages: Message[];
  groups: Group[];
  groupMembers: GroupMember[];
  memories: Memory[];
  memoryLinks: MemoryLink[];
  apiConfigs: ApiConfig[];
  appSettings: AppSettings[];
  mediaManifest: MediaAsset[];
}

export interface UphoneBackupBundle {
  schemaVersion: number;
  appName: 'Uphone';
  exportedAt: TimestampMs;
  data: UphoneExportData;
}
