import { createId } from '@/lib/id';
import { getUphoneDb } from '@/lib/storage/db';
import type { MediaAssetRecord, User } from '@/types/uphone';

export const USER_UPDATED_EVENT = 'uphone:user-updated';
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB

export interface UserProfileSnapshot {
  user: User;
  avatarBlob: Blob | null;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateNickname(nickname: string): ValidationResult {
  const trimmed = nickname.trim();
  if (!trimmed) {
    return { valid: false, reason: '昵称不能为空 / Display name cannot be empty.' };
  }
  if (trimmed.length > 40) {
    return { valid: false, reason: '昵称长度不能超过 40 个字符 / Max 40 characters.' };
  }
  return { valid: true };
}

export function validateAvatarFile(file: { type: string; size: number }): ValidationResult {
  if (!file.type.startsWith('image/')) {
    return { valid: false, reason: '请选择有效的图片文件 / Please select a valid image file.' };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { valid: false, reason: '图片大小不能超过 5MB / Image size must be under 5MB.' };
  }
  return { valid: true };
}

export function createDefaultUserRecord(now = Date.now()): User {
  return {
    id: createId('usr'),
    displayName: 'Uphone User',
    bio: '',
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  };
}

export async function loadActiveUserProfile(): Promise<UserProfileSnapshot> {
  if (typeof window === 'undefined') {
    return { user: createDefaultUserRecord(0), avatarBlob: null };
  }

  const db = getUphoneDb();
  const existingUsers = await db.users.toArray();
  let user = existingUsers.find((u) => u.isDefault) ?? existingUsers[0];

  if (!user) {
    user = createDefaultUserRecord();
    await db.users.put(user);
  }

  let avatarBlob: Blob | null = null;
  if (user.avatarAssetId) {
    const asset = await db.mediaAssets.get(user.avatarAssetId);
    if (asset?.blob) {
      avatarBlob = asset.blob;
    }
  }

  return { user, avatarBlob };
}

export interface SaveUserProfileInput {
  displayName: string;
  bio?: string;
  newAvatarFile?: File | null;
  removeAvatar?: boolean;
}

export async function saveActiveUserProfile(
  input: SaveUserProfileInput,
): Promise<UserProfileSnapshot> {
  const nameCheck = validateNickname(input.displayName);
  if (!nameCheck.valid) {
    throw new Error(nameCheck.reason);
  }

  const db = getUphoneDb();
  const current = await loadActiveUserProfile();
  const now = Date.now();
  let nextAvatarAssetId = current.user.avatarAssetId;
  let nextAvatarBlob = current.avatarBlob;

  if (input.removeAvatar) {
    if (current.user.avatarAssetId) {
      await db.mediaAssets.delete(current.user.avatarAssetId);
    }
    nextAvatarAssetId = undefined;
    nextAvatarBlob = null;
  } else if (input.newAvatarFile) {
    const fileCheck = validateAvatarFile(input.newAvatarFile);
    if (!fileCheck.valid) {
      throw new Error(fileCheck.reason);
    }

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
    if (current.user.avatarAssetId) {
      await db.mediaAssets.delete(current.user.avatarAssetId);
    }
    nextAvatarAssetId = assetId;
    nextAvatarBlob = input.newAvatarFile;
  }

  const updatedUser: User = {
    ...current.user,
    displayName: input.displayName.trim(),
    bio: input.bio !== undefined ? input.bio.trim() : current.user.bio,
    avatarAssetId: nextAvatarAssetId,
    updatedAt: now,
  };

  await db.users.put(updatedUser);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(USER_UPDATED_EVENT));
  }

  return {
    user: updatedUser,
    avatarBlob: nextAvatarBlob,
  };
}
