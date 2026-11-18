import { createId } from '@/lib/id';
import { getUphoneDb } from '@/lib/storage/db';
import { readActiveCharacterId, readPinnedCharacterIds, writePinnedCharacterIds } from '@/lib/storage/drawerData';
import { validateAvatarFile, type ValidationResult } from '@/lib/storage/userService';
import type { Character, CharacterCustomField, MediaAssetRecord } from '@/types/uphone';

export const CHARACTERS_UPDATED_EVENT = 'uphone:characters-updated';
const ACTIVE_CHARACTER_KEY = 'uphone.drawer.activeCharacterId';

export interface SaveCharacterInput {
  id?: string;
  name: string;
  remark?: string;
  gender?: string;
  age?: string;
  avatarUrl?: string;
  newAvatarFile?: File | null;
  removeAvatar?: boolean;
  persona?: string;
  personality?: string;
  appearance?: string;
  speakingStyle?: string;
  background?: string;
  relationship?: string;
  otherNotes?: string;
  customFields?: CharacterCustomField[];
  isPinned?: boolean;
}

export interface CharacterSnapshot {
  character: Character;
  avatarBlob: Blob | null;
}

export interface CharacterRelationSummary {
  characterId: string;
  conversationCount: number;
  messageCount: number;
  memoryCount: number;
  memoryLinkCount: number;
  groupMembershipCount: number;
  hasRelations: boolean;
}

export type CharacterDeleteMode = 'profile_only' | 'with_relations';

export function validateCharacterAvatarUrl(url?: string): ValidationResult {
  const trimmed = (url ?? '').trim();
  if (!trimmed) {
    return { valid: true };
  }
  const isHttp = /^https?:\/\/.+/i.test(trimmed);
  const isDataImage = /^data:image\/[a-z0-9.+-]+;base64,.+/i.test(trimmed);
  if (!isHttp && !isDataImage) {
    return {
      valid: false,
      reason: '头像链接请使用 http(s):// 开头或有效的图片 Base64 地址。',
    };
  }
  return { valid: true };
}

export function validateCharacterInput(input: SaveCharacterInput): ValidationResult {
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    return {
      valid: false,
      reason: '请输入角色名称（必填项）。',
    };
  }
  if (trimmedName.length > 60) {
    return {
      valid: false,
      reason: '角色名称长度不能超过 60 个字符。',
    };
  }

  const urlCheck = validateCharacterAvatarUrl(input.avatarUrl);
  if (!urlCheck.valid) {
    return urlCheck;
  }

  if (input.newAvatarFile) {
    const fileCheck = validateAvatarFile(input.newAvatarFile);
    if (!fileCheck.valid) {
      return fileCheck;
    }
  }

  if (input.customFields) {
    for (const field of input.customFields) {
      if (!field.key.trim() && field.value.trim()) {
        return {
          valid: false,
          reason: '自定义字段填写了内容时，字段名称不能为空。',
        };
      }
    }
  }

  return { valid: true };
}

export function sanitizeCustomFields(
  fields?: readonly CharacterCustomField[],
): CharacterCustomField[] {
  if (!fields || fields.length === 0) {
    return [];
  }
  return fields
    .map((field) => ({
      id: field.id || createId('cf'),
      key: field.key.trim(),
      value: field.value.trim(),
    }))
    .filter((field) => field.key.length > 0 || field.value.length > 0);
}

export function compileCharacterPersonaPrompt(input: {
  persona?: string;
  personality?: string;
  appearance?: string;
  speakingStyle?: string;
  background?: string;
  relationship?: string;
  otherNotes?: string;
  customFields?: readonly CharacterCustomField[];
}): string {
  const sections: Array<[string, string | undefined]> = [
    ['人物人设', input.persona],
    ['性格特点', input.personality],
    ['外貌描述', input.appearance],
    ['说话风格', input.speakingStyle],
    ['人物背景故事', input.background],
    ['与 User 的关系', input.relationship],
    ['其他补充设定', input.otherNotes],
  ];

  const blocks = sections
    .filter(([, value]) => Boolean(value && value.trim()))
    .map(([label, value]) => `【${label}】\n${value!.trim()}`);

  const cleanCustom = sanitizeCustomFields(input.customFields);
  if (cleanCustom.length > 0) {
    const customLines = cleanCustom
      .filter((f) => f.key)
      .map((f) => `- ${f.key}: ${f.value}`);
    if (customLines.length > 0) {
      blocks.push(`【自定义信息】\n${customLines.join('\n')}`);
    }
  }

  return blocks.join('\n\n');
}

export function normalizeCharacterRecord(
  input: SaveCharacterInput,
  existing?: Character,
  now = Date.now(),
  resolvedAvatar?: { avatarAssetId?: string; avatarUrl?: string },
): Character {
  const remark = input.remark !== undefined ? input.remark.trim() : existing?.remark ?? existing?.tagline ?? '';
  const cleanCustomFields = sanitizeCustomFields(input.customFields);
  const persona = input.persona ?? existing?.persona ?? '';
  const personality = input.personality ?? existing?.personality ?? '';
  const appearance = input.appearance ?? existing?.appearance ?? '';
  const speakingStyle = input.speakingStyle ?? existing?.speakingStyle ?? '';
  const background = input.background ?? existing?.background ?? '';
  const relationship = input.relationship ?? existing?.relationship ?? '';
  const otherNotes = input.otherNotes ?? existing?.otherNotes ?? '';

  const compiledPersonaPrompt =
    compileCharacterPersonaPrompt({
      persona,
      personality,
      appearance,
      speakingStyle,
      background,
      relationship,
      otherNotes,
      customFields: cleanCustomFields,
    }) || existing?.personaPrompt || '';

  return {
    ...(existing ?? {}),
    id: existing?.id ?? input.id ?? createId('chr'),
    name: input.name.trim(),
    remark,
    tagline: remark,
    gender: input.gender !== undefined ? input.gender.trim() : existing?.gender ?? '',
    age: input.age !== undefined ? input.age.trim() : existing?.age ?? '',
    avatar: resolvedAvatar !== undefined ? resolvedAvatar.avatarUrl : input.avatarUrl?.trim() ?? existing?.avatar,
    avatarAssetId:
      resolvedAvatar !== undefined ? resolvedAvatar.avatarAssetId : existing?.avatarAssetId,
    persona,
    personality,
    appearance,
    speakingStyle,
    background,
    relationship,
    otherNotes,
    customFields: cleanCustomFields,
    isPinned: input.isPinned ?? existing?.isPinned ?? false,
    personaPrompt: compiledPersonaPrompt,
    tags: existing?.tags ?? [],
    isArchived: existing?.isArchived ?? false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

function emitCharactersUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CHARACTERS_UPDATED_EVENT));
  }
}

export async function listCharacters(): Promise<Character[]> {
  if (typeof window === 'undefined') {
    return [];
  }
  const db = getUphoneDb();
  const all = await db.characters.toArray();
  return all.filter((char) => !char.isArchived);
}

export async function getCharacterSnapshot(characterId: string): Promise<CharacterSnapshot | null> {
  if (typeof window === 'undefined' || !characterId) {
    return null;
  }
  const db = getUphoneDb();
  const character = await db.characters.get(characterId);
  if (!character || character.isArchived) {
    return null;
  }

  let avatarBlob: Blob | null = null;
  if (character.avatarAssetId) {
    const asset = await db.mediaAssets.get(character.avatarAssetId);
    avatarBlob = asset?.blob ?? null;
  }

  return { character, avatarBlob };
}

export async function saveCharacter(input: SaveCharacterInput): Promise<CharacterSnapshot> {
  const check = validateCharacterInput(input);
  if (!check.valid) {
    throw new Error(check.reason);
  }

  const db = getUphoneDb();
  const now = Date.now();
  const existing = input.id ? await db.characters.get(input.id) : undefined;

  let nextAvatarAssetId = existing?.avatarAssetId;
  let nextAvatarUrl = input.avatarUrl !== undefined ? input.avatarUrl.trim() || undefined : existing?.avatar;
  let nextAvatarBlob: Blob | null = null;

  if (input.removeAvatar) {
    if (existing?.avatarAssetId) {
      await db.mediaAssets.delete(existing.avatarAssetId);
    }
    nextAvatarAssetId = undefined;
    nextAvatarUrl = undefined;
    nextAvatarBlob = null;
  } else if (input.newAvatarFile) {
    const assetId = createId('ast');
    const record: MediaAssetRecord = {
      id: assetId,
      kind: 'avatar',
      mimeType: input.newAvatarFile.type,
      sizeBytes: input.newAvatarFile.size,
      fileName: input.newAvatarFile.name,
      blob: input.newAvatarFile,
      createdAt: now,
      updatedAt: now,
    };
    await db.mediaAssets.put(record);
    if (existing?.avatarAssetId) {
      await db.mediaAssets.delete(existing.avatarAssetId);
    }
    nextAvatarAssetId = assetId;
    nextAvatarUrl = undefined;
    nextAvatarBlob = input.newAvatarFile;
  } else if (nextAvatarUrl) {
    // Switching to URL avatar removes obsolete local asset blob if one existed
    if (existing?.avatarAssetId && input.avatarUrl !== undefined && input.avatarUrl.trim() !== '') {
      await db.mediaAssets.delete(existing.avatarAssetId);
      nextAvatarAssetId = undefined;
    }
  } else if (nextAvatarAssetId) {
    const existingAsset = await db.mediaAssets.get(nextAvatarAssetId);
    nextAvatarBlob = existingAsset?.blob ?? null;
  }

  const record = normalizeCharacterRecord(input, existing, now, {
    avatarAssetId: nextAvatarAssetId,
    avatarUrl: nextAvatarUrl,
  });

  await db.characters.put(record);
  emitCharactersUpdated();

  return {
    character: record,
    avatarBlob: nextAvatarBlob,
  };
}

export async function setCharacterPinned(
  characterId: string,
  pinned: boolean,
): Promise<boolean> {
  const db = getUphoneDb();
  const existing = await db.characters.get(characterId);
  if (!existing) {
    return pinned;
  }

  await db.characters.put({
    ...existing,
    isPinned: pinned,
    updatedAt: existing.updatedAt,
  });

  const pinnedIds = readPinnedCharacterIds();
  const nextIds = pinned
    ? Array.from(new Set([...pinnedIds, characterId]))
    : pinnedIds.filter((id) => id !== characterId);
  writePinnedCharacterIds(nextIds);

  emitCharactersUpdated();
  return pinned;
}

export async function inspectCharacterRelations(
  characterId: string,
): Promise<CharacterRelationSummary> {
  if (typeof window === 'undefined' || !characterId) {
    return {
      characterId,
      conversationCount: 0,
      messageCount: 0,
      memoryCount: 0,
      memoryLinkCount: 0,
      groupMembershipCount: 0,
      hasRelations: false,
    };
  }

  const db = getUphoneDb();
  const [conversations, memories, memoryLinks, groupMembers] = await Promise.all([
    db.conversations.where('characterId').equals(characterId).toArray(),
    db.memories.where('characterId').equals(characterId).toArray(),
    db.memoryLinks.toArray(),
    db.groupMembers.where('characterId').equals(characterId).toArray(),
  ]);

  const conversationIds = conversations.map((c) => c.id);
  const conversationIdSet = new Set(conversationIds);

  let messageCount = 0;
  if (conversationIds.length > 0) {
    messageCount = await db.messages.where('conversationId').anyOf(conversationIds).count();
  }

  const relatedLinks = memoryLinks.filter(
    (link) =>
      link.characterId === characterId ||
      conversationIdSet.has(link.targetConversationId) ||
      (link.sourceConversationId ? conversationIdSet.has(link.sourceConversationId) : false),
  );

  const hasRelations =
    conversations.length > 0 ||
    messageCount > 0 ||
    memories.length > 0 ||
    relatedLinks.length > 0 ||
    groupMembers.length > 0;

  return {
    characterId,
    conversationCount: conversations.length,
    messageCount,
    memoryCount: memories.length,
    memoryLinkCount: relatedLinks.length,
    groupMembershipCount: groupMembers.length,
    hasRelations,
  };
}

export async function deleteCharacterSafely(
  characterId: string,
  mode: CharacterDeleteMode,
): Promise<void> {
  const db = getUphoneDb();
  const existing = await db.characters.get(characterId);

  if (mode === 'profile_only') {
    await db.transaction('rw', [db.characters, db.mediaAssets], async () => {
      if (existing?.avatarAssetId) {
        await db.mediaAssets.delete(existing.avatarAssetId);
      }
      await db.characters.delete(characterId);
    });
  } else {
    await db.transaction(
      'rw',
      [
        db.characters,
        db.mediaAssets,
        db.conversations,
        db.messages,
        db.memories,
        db.memoryLinks,
        db.groupMembers,
      ],
      async () => {
        const conversations = await db.conversations
          .where('characterId')
          .equals(characterId)
          .toArray();
        const conversationIds = conversations.map((c) => c.id);
        const conversationIdSet = new Set(conversationIds);

        if (conversationIds.length > 0) {
          const messages = await db.messages
            .where('conversationId')
            .anyOf(conversationIds)
            .toArray();
          const attachmentIds = messages.flatMap((m) => m.attachmentAssetIds ?? []);
          if (attachmentIds.length > 0) {
            await db.mediaAssets.bulkDelete(attachmentIds);
          }
          await db.messages.where('conversationId').anyOf(conversationIds).delete();
          await db.conversations.bulkDelete(conversationIds);
        }

        const memories = await db.memories.where('characterId').equals(characterId).toArray();
        const memoryIds = memories.map((m) => m.id);
        const memoryIdSet = new Set(memoryIds);
        if (memoryIds.length > 0) {
          await db.memories.bulkDelete(memoryIds);
        }

        const allLinks = await db.memoryLinks.toArray();
        const linkIdsToDelete = allLinks
          .filter(
            (link) =>
              link.characterId === characterId ||
              memoryIdSet.has(link.memoryId) ||
              conversationIdSet.has(link.targetConversationId) ||
              (link.sourceConversationId
                ? conversationIdSet.has(link.sourceConversationId)
                : false),
          )
          .map((link) => link.id);
        if (linkIdsToDelete.length > 0) {
          await db.memoryLinks.bulkDelete(linkIdsToDelete);
        }

        await db.groupMembers.where('characterId').equals(characterId).delete();

        if (existing?.avatarAssetId) {
          await db.mediaAssets.delete(existing.avatarAssetId);
        }
        await db.characters.delete(characterId);
      },
    );
  }

  // Clean up drawer localStorage pointers
  if (typeof window !== 'undefined') {
    const nextPinned = readPinnedCharacterIds().filter((id) => id !== characterId);
    writePinnedCharacterIds(nextPinned);
    if (readActiveCharacterId() === characterId) {
      window.localStorage.removeItem(ACTIVE_CHARACTER_KEY);
    }
  }

  emitCharactersUpdated();
}
