import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterDrawerCharacters,
  sortDrawerCharacters,
  togglePinnedCharacterId,
  type DrawerCharacterItem,
} from '../storage/drawerData';
import { validateAvatarFile, validateNickname } from '../storage/userService';
import { PROFILE_SETTINGS_ITEMS, RESERVED_ROUTES } from '../navigation/routes';

const SAMPLE_CHARS: DrawerCharacterItem[] = [
  {
    id: 'chr_1',
    name: '林夏',
    tagline: '深夜咖啡馆老板',
    lastMessageAt: 1000,
    updatedAt: 1000,
    isPinned: false,
  },
  {
    id: 'chr_2',
    name: 'Aiden',
    tagline: 'Orbital navigator',
    lastMessageAt: 500,
    updatedAt: 500,
    isPinned: true,
  },
  {
    id: 'chr_3',
    name: '沈墨',
    tagline: '古籍修复师',
    updatedAt: 2000,
    isPinned: false,
  },
];

test('filterDrawerCharacters filters by name and remarks with fuzzy matching', () => {
  assert.equal(filterDrawerCharacters(SAMPLE_CHARS, '').length, 3);
  assert.deepEqual(
    filterDrawerCharacters(SAMPLE_CHARS, 'orbital').map((c) => c.id),
    ['chr_2'],
  );
  assert.deepEqual(
    filterDrawerCharacters(SAMPLE_CHARS, '沈墨').map((c) => c.id),
    ['chr_3'],
  );
  // Fuzzy subsequence & cross-field token matches
  assert.deepEqual(
    filterDrawerCharacters(SAMPLE_CHARS, '林 咖').map((c) => c.id),
    ['chr_1'],
  );
  assert.deepEqual(
    filterDrawerCharacters(SAMPLE_CHARS, 'adn').map((c) => c.id),
    ['chr_2'],
  );
  assert.deepEqual(
    filterDrawerCharacters(SAMPLE_CHARS, '修师').map((c) => c.id),
    ['chr_3'],
  );
  assert.equal(filterDrawerCharacters(SAMPLE_CHARS, '不存在').length, 0);
});

test('sortDrawerCharacters places pinned items first, then recent chats or createdAt order', () => {
  const sorted = sortDrawerCharacters(SAMPLE_CHARS);
  assert.deepEqual(
    sorted.map((c) => c.id),
    ['chr_2', 'chr_1', 'chr_3'],
  );

  const withCreated: DrawerCharacterItem[] = [
    { id: 'chr_a', name: 'A', createdAt: 100, updatedAt: 300, isPinned: false },
    { id: 'chr_b', name: 'B', createdAt: 300, updatedAt: 100, isPinned: false },
    { id: 'chr_c', name: 'C', createdAt: 200, updatedAt: 200, isPinned: true },
  ];
  assert.deepEqual(
    sortDrawerCharacters(withCreated, 'created_desc').map((c) => c.id),
    ['chr_c', 'chr_b', 'chr_a'],
  );
  assert.deepEqual(
    sortDrawerCharacters(withCreated, 'created_asc').map((c) => c.id),
    ['chr_c', 'chr_a', 'chr_b'],
  );
});

test('togglePinnedCharacterId adds and removes IDs cleanly', () => {
  const added = togglePinnedCharacterId(['chr_1'], 'chr_2');
  assert.deepEqual(added, ['chr_1', 'chr_2']);
  const removed = togglePinnedCharacterId(added, 'chr_1');
  assert.deepEqual(removed, ['chr_2']);
});

test('validateNickname and validateAvatarFile enforce boundaries', () => {
  assert.equal(validateNickname('   ').valid, false);
  assert.equal(validateNickname('林小星').valid, true);
  assert.equal(validateNickname('a'.repeat(41)).valid, false);

  assert.equal(validateAvatarFile({ type: 'text/plain', size: 100 }).valid, false);
  assert.equal(validateAvatarFile({ type: 'image/png', size: 6 * 1024 * 1024 }).valid, false);
  assert.equal(validateAvatarFile({ type: 'image/png', size: 1024 }).valid, true);
});

test('PROFILE_SETTINGS_ITEMS exposes all 5 unified settings categories for User Profile', () => {
  assert.equal(PROFILE_SETTINGS_ITEMS.length, 5);
  assert.equal(RESERVED_ROUTES.profile, '/profile');
  const ids = PROFILE_SETTINGS_ITEMS.map((item) => item.id);
  assert.deepEqual(ids, [
    'api_settings',
    'appearance',
    'data_management',
    'formatter',
    'general_settings',
  ]);
});
