import Dexie, { type Table } from 'dexie';
import type { DesktopWidgetConfig, HomeBackgroundConfig, NoteState } from './types';
import { DEFAULT_DESKTOP_WIDGETS } from './widgets';

const HOME_DB_NAME = 'uphone_home_db';
const DEFAULT_NOTE_ID = 'home_primary_note';
const DEFAULT_LAYOUT_KEY = 'home_widget_layout';
const DEFAULT_BG_KEY = 'home_background';

interface HomePreferenceRecord {
  key: string;
  value: unknown;
  updatedAt: number;
}

class UphoneHomeDatabase extends Dexie {
  notes!: Table<NoteState, string>;
  preferences!: Table<HomePreferenceRecord, string>;

  constructor() {
    super(HOME_DB_NAME);
    this.version(1).stores({
      notes: 'id, updatedAt',
      preferences: 'key, updatedAt',
    });
  }
}

let homeDb: UphoneHomeDatabase | null = null;

function getHomeDb(): UphoneHomeDatabase {
  if (typeof window === 'undefined') {
    throw new Error('Home persistence is only available in browser environments.');
  }
  if (!homeDb) {
    homeDb = new UphoneHomeDatabase();
  }
  return homeDb;
}

export async function loadHomeNote(): Promise<NoteState> {
  if (typeof window === 'undefined') {
    return { id: DEFAULT_NOTE_ID, content: '', updatedAt: 0 };
  }
  try {
    const db = getHomeDb();
    const record = await db.notes.get(DEFAULT_NOTE_ID);
    if (record) {
      return record;
    }
  } catch {
    // Fallback to localStorage if IndexedDB is restricted
  }

  const fallback = window.localStorage.getItem('uphone.home.note');
  if (fallback) {
    try {
      return JSON.parse(fallback) as NoteState;
    } catch {
      return { id: DEFAULT_NOTE_ID, content: fallback, updatedAt: Date.now() };
    }
  }
  return { id: DEFAULT_NOTE_ID, content: '', updatedAt: 0 };
}

export async function saveHomeNote(content: string): Promise<NoteState> {
  const next: NoteState = {
    id: DEFAULT_NOTE_ID,
    content,
    updatedAt: Date.now(),
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem('uphone.home.note', JSON.stringify(next));
    try {
      const db = getHomeDb();
      await db.notes.put(next);
    } catch {
      // Keep localStorage mirror even if IndexedDB fails
    }
  }

  return next;
}

export async function loadHomeBackground(): Promise<HomeBackgroundConfig> {
  const fallbackDefault: HomeBackgroundConfig = { presetId: 'default' };
  if (typeof window === 'undefined') {
    return fallbackDefault;
  }

  try {
    const db = getHomeDb();
    const pref = await db.preferences.get(DEFAULT_BG_KEY);
    if (pref?.value && typeof pref.value === 'object') {
      return pref.value as HomeBackgroundConfig;
    }
  } catch {
    // Ignore and inspect localStorage
  }

  const raw = window.localStorage.getItem('uphone.home.background');
  if (raw) {
    try {
      return JSON.parse(raw) as HomeBackgroundConfig;
    } catch {
      return fallbackDefault;
    }
  }
  return fallbackDefault;
}

export async function saveHomeBackground(config: HomeBackgroundConfig): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem('uphone.home.background', JSON.stringify(config));
  try {
    const db = getHomeDb();
    await db.preferences.put({
      key: DEFAULT_BG_KEY,
      value: config,
      updatedAt: Date.now(),
    });
  } catch {
    // Kept in localStorage
  }
}

export async function loadDesktopWidgetLayout(): Promise<DesktopWidgetConfig[]> {
  if (typeof window === 'undefined') {
    return [...DEFAULT_DESKTOP_WIDGETS];
  }
  try {
    const db = getHomeDb();
    const pref = await db.preferences.get(DEFAULT_LAYOUT_KEY);
    if (Array.isArray(pref?.value) && pref.value.length > 0) {
      const sanitized = (pref.value as DesktopWidgetConfig[])
        .filter((item) => item.type !== 'quote')
        .map((item) =>
          item.type === 'custom_slot' ? { ...item, isVisible: false } : item,
        );
      if (sanitized.length > 0) {
        return sanitized;
      }
    }
  } catch {
    // Fallback
  }
  return [...DEFAULT_DESKTOP_WIDGETS];
}

export async function saveDesktopWidgetLayout(widgets: DesktopWidgetConfig[]): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const db = getHomeDb();
    await db.preferences.put({
      key: DEFAULT_LAYOUT_KEY,
      value: widgets,
      updatedAt: Date.now(),
    });
  } catch {
    // Ignore storage error
  }
}
