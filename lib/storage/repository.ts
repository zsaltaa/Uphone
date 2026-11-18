import {
  UPHONE_SCHEMA_VERSION,
  type UphoneBackupBundle,
  type UphoneExportData,
} from '@/types/uphone';

export interface PersistenceHealth {
  storageAvailable: boolean;
  schemaVersion: number;
}

export interface BackupValidationResult {
  valid: boolean;
  reason?: string;
}

export function createEmptyExportData(): UphoneExportData {
  return {
    users: [],
    characters: [],
    conversations: [],
    messages: [],
    groups: [],
    groupMembers: [],
    memories: [],
    memoryLinks: [],
    apiConfigs: [],
    appSettings: [],
    mediaManifest: [],
  };
}

export function createEmptyBackupBundle(exportedAt = Date.now()): UphoneBackupBundle {
  return {
    schemaVersion: UPHONE_SCHEMA_VERSION,
    appName: 'Uphone',
    exportedAt,
    data: createEmptyExportData(),
  };
}

export function validateBackupBundle(input: unknown): BackupValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, reason: 'Backup payload must be a JSON object.' };
  }

  const candidate = input as Partial<UphoneBackupBundle>;
  if (candidate.appName !== 'Uphone') {
    return { valid: false, reason: 'Invalid app identifier in backup bundle.' };
  }

  if (typeof candidate.schemaVersion !== 'number' || candidate.schemaVersion < 1) {
    return { valid: false, reason: 'Missing or unsupported schemaVersion.' };
  }

  if (!candidate.data || typeof candidate.data !== 'object') {
    return { valid: false, reason: 'Missing data payload in backup bundle.' };
  }

  const requiredCollections: Array<keyof UphoneExportData> = [
    'users',
    'characters',
    'conversations',
    'messages',
    'groups',
    'groupMembers',
    'memories',
    'memoryLinks',
    'apiConfigs',
    'appSettings',
    'mediaManifest',
  ];

  for (const key of requiredCollections) {
    if (!Array.isArray(candidate.data[key])) {
      return { valid: false, reason: `Collection "${key}" must be an array.` };
    }
  }

  return { valid: true };
}

export function checkBrowserPersistenceSupport(): PersistenceHealth {
  const storageAvailable =
    typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

  return {
    storageAvailable,
    schemaVersion: UPHONE_SCHEMA_VERSION,
  };
}
