import test from 'node:test';
import assert from 'node:assert/strict';
import { createId, isScopedId } from '../id';
import { createEmptyBackupBundle, validateBackupBundle } from '../storage/repository';
import { clampFontScale, resolveEffectiveTheme } from '../theme/tokens';
import { getLocaleMessages } from '../i18n';
import { truncateText } from '../formatters';
import { UPHONE_SCHEMA_VERSION } from '../../types/uphone';

test('createId generates unique prefix-scoped IDs', () => {
  const idA = createId('chr');
  const idB = createId('chr');
  assert.notEqual(idA, idB);
  assert.equal(isScopedId(idA, 'chr'), true);
  assert.equal(isScopedId(idA, 'cnv'), false);
});

test('backup bundle creation and validation preserve schemaVersion', () => {
  const bundle = createEmptyBackupBundle(1700000000000);
  assert.equal(bundle.schemaVersion, UPHONE_SCHEMA_VERSION);
  assert.equal(bundle.appName, 'Uphone');
  assert.equal(validateBackupBundle(bundle).valid, true);

  assert.equal(validateBackupBundle(null).valid, false);
  assert.equal(
    validateBackupBundle({ ...bundle, appName: 'Other' }).valid,
    false,
  );
});

test('theme resolution and font scale clamping behave deterministically', () => {
  assert.equal(resolveEffectiveTheme('system', true), 'dark');
  assert.equal(resolveEffectiveTheme('system', false), 'light');
  assert.equal(resolveEffectiveTheme('dark', false), 'dark');

  assert.equal(clampFontScale(0.5), 0.85);
  assert.equal(clampFontScale(1.8), 1.3);
  assert.equal(clampFontScale(1.125), 1.13);
});

test('i18n lookup and text truncation return expected strings', () => {
  assert.equal(getLocaleMessages('zh-CN').appName, 'Uphone');
  assert.equal(getLocaleMessages('en-US').appName, 'Uphone');
  assert.equal(truncateText('hello world', 5), 'hell…');
  assert.equal(truncateText('hi', 5), 'hi');
});
