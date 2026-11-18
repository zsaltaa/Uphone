import Dexie, { type Table } from 'dexie';
import type {
  ApiConfig,
  AppSettings,
  Character,
  Conversation,
  Group,
  GroupMember,
  MediaAssetRecord,
  Memory,
  MemoryLink,
  Message,
  User,
} from '@/types/uphone';

export const UPHONE_DB_NAME = 'uphone_local_db';
export const UPHONE_DB_VERSION = 1;

export class UphoneDatabase extends Dexie {
  users!: Table<User, string>;
  characters!: Table<Character, string>;
  conversations!: Table<Conversation, string>;
  messages!: Table<Message, string>;
  groups!: Table<Group, string>;
  groupMembers!: Table<GroupMember, string>;
  memories!: Table<Memory, string>;
  memoryLinks!: Table<MemoryLink, string>;
  apiConfigs!: Table<ApiConfig, string>;
  appSettings!: Table<AppSettings, string>;
  mediaAssets!: Table<MediaAssetRecord, string>;

  constructor() {
    super(UPHONE_DB_NAME);

    this.version(UPHONE_DB_VERSION).stores({
      users: 'id, isDefault, updatedAt',
      characters: 'id, name, isArchived, updatedAt, *tags',
      conversations: 'id, kind, characterId, groupId, userId, isPinned, isArchived, lastMessageAt, updatedAt',
      messages: 'id, conversationId, [conversationId+createdAt], senderType, senderId, status, createdAt',
      groups: 'id, name, isArchived, updatedAt',
      groupMembers: 'id, groupId, [groupId+orderIndex], characterId, userId',
      memories: 'id, scope, characterId, conversationId, [characterId+scope], isPinned, isArchived, importance, updatedAt, *tags',
      memoryLinks: 'id, memoryId, targetConversationId, sourceConversationId, characterId, [targetConversationId+isEnabled], priority',
      apiConfigs: 'id, provider, isDefault, isEnabled, updatedAt',
      appSettings: 'id, schemaVersion, updatedAt',
      mediaAssets: 'id, kind, mimeType, createdAt',
    });
  }
}

let dbInstance: UphoneDatabase | null = null;

/**
 * Returns the browser-only Dexie IndexedDB singleton.
 * Safe to import in Next.js without initializing IndexedDB during SSR.
 */
export function getUphoneDb(): UphoneDatabase {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB storage is only available in browser environments.');
  }
  if (!dbInstance) {
    dbInstance = new UphoneDatabase();
  }
  return dbInstance;
}
