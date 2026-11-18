import { getUphoneDb } from '@/lib/storage/db';
import type { Character, Conversation } from '@/types/uphone';

export type DrawerCharacterSortMode = 'created_desc' | 'created_asc' | 'recent';

export interface DrawerCharacterItem {
  id: string;
  name: string;
  tagline?: string;
  avatarUrl?: string;
  avatarBlob?: Blob | null;
  lastMessageAt?: number;
  createdAt?: number;
  updatedAt: number;
  isPinned: boolean;
}

const PINNED_STORAGE_KEY = 'uphone.drawer.pinnedCharacters';
const ACTIVE_CHARACTER_KEY = 'uphone.drawer.activeCharacterId';
const SORT_MODE_KEY = 'uphone.drawer.sortMode';

function isFuzzyMatch(haystack: string, pattern: string): boolean {
  if (!pattern) {
    return true;
  }
  if (haystack.includes(pattern)) {
    return true;
  }
  let idx = 0;
  for (let i = 0; i < haystack.length && idx < pattern.length; i += 1) {
    if (haystack[i] === pattern[idx]) {
      idx += 1;
    }
  }
  return idx === pattern.length;
}

export function filterDrawerCharacters(
  items: readonly DrawerCharacterItem[],
  query: string,
): DrawerCharacterItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [...items];
  }
  const tokens = normalized.split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    const nameLower = item.name.toLowerCase();
    const taglineLower = (item.tagline ?? '').toLowerCase();
    const combinedLower = `${nameLower} ${taglineLower}`.trim();
    return tokens.every(
      (token) =>
        isFuzzyMatch(nameLower, token) ||
        isFuzzyMatch(taglineLower, token) ||
        isFuzzyMatch(combinedLower, token),
    );
  });
}

export function sortDrawerCharacters(
  items: readonly DrawerCharacterItem[],
  sortMode: DrawerCharacterSortMode = 'recent',
): DrawerCharacterItem[] {
  return [...items].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    if (sortMode === 'created_desc') {
      const createdA = a.createdAt ?? a.updatedAt;
      const createdB = b.createdAt ?? b.updatedAt;
      if (createdA !== createdB) {
        return createdB - createdA;
      }
      return b.updatedAt - a.updatedAt;
    }

    if (sortMode === 'created_asc') {
      const createdA = a.createdAt ?? a.updatedAt;
      const createdB = b.createdAt ?? b.updatedAt;
      if (createdA !== createdB) {
        return createdA - createdB;
      }
      return a.updatedAt - b.updatedAt;
    }

    const timeA = a.lastMessageAt ?? 0;
    const timeB = b.lastMessageAt ?? 0;
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    return b.updatedAt - a.updatedAt;
  });
}

export function togglePinnedCharacterId(
  pinnedIds: readonly string[],
  characterId: string,
): string[] {
  if (pinnedIds.includes(characterId)) {
    return pinnedIds.filter((id) => id !== characterId);
  }
  return [...pinnedIds, characterId];
}

export function readPinnedCharacterIds(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(PINNED_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function writePinnedCharacterIds(ids: readonly string[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(ids));
}

export function readActiveCharacterId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(ACTIVE_CHARACTER_KEY);
}

export function writeActiveCharacterId(characterId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(ACTIVE_CHARACTER_KEY, characterId);
}

export function readDrawerSortMode(): DrawerCharacterSortMode {
  if (typeof window === 'undefined') {
    return 'created_desc';
  }
  const value = window.localStorage.getItem(SORT_MODE_KEY);
  if (value === 'created_asc' || value === 'created_desc') {
    return value;
  }
  return 'created_desc';
}

export function writeDrawerSortMode(mode: DrawerCharacterSortMode): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(SORT_MODE_KEY, mode);
}

/**
 * Reads characters and their latest conversation timestamps from the unified Dexie data layer.
 * Returns an empty list if no characters have been created yet (no mock characters).
 */
export async function loadDrawerCharacters(
  sortMode: DrawerCharacterSortMode = 'created_desc',
): Promise<DrawerCharacterItem[]> {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const db = getUphoneDb();
    const [characters, conversations] = await Promise.all([
      db.characters.toArray(),
      db.conversations.toArray(),
    ]);

    const activeChars = characters.filter((c: Character) => !c.isArchived);
    if (activeChars.length === 0) {
      return [];
    }

    const latestByCharacter = new Map<string, number>();
    conversations.forEach((conv: Conversation) => {
      if (conv.kind === 'single' && conv.characterId && conv.lastMessageAt) {
        const prev = latestByCharacter.get(conv.characterId) ?? 0;
        if (conv.lastMessageAt > prev) {
          latestByCharacter.set(conv.characterId, conv.lastMessageAt);
        }
      }
    });

    const pinnedSet = new Set(readPinnedCharacterIds());
    const items: DrawerCharacterItem[] = await Promise.all(
      activeChars.map(async (char) => {
        let avatarBlob: Blob | null = null;
        if (char.avatarAssetId) {
          const asset = await db.mediaAssets.get(char.avatarAssetId);
          avatarBlob = asset?.blob ?? null;
        }
        const isPinned =
          typeof char.isPinned === 'boolean' ? char.isPinned : pinnedSet.has(char.id);
        return {
          id: char.id,
          name: char.name,
          tagline: char.remark || char.tagline || char.nickname,
          avatarUrl: char.avatar,
          avatarBlob,
          lastMessageAt: latestByCharacter.get(char.id),
          createdAt: char.createdAt,
          updatedAt: char.updatedAt,
          isPinned,
        };
      }),
    );

    return sortDrawerCharacters(items, sortMode);
  } catch {
    return [];
  }
}
