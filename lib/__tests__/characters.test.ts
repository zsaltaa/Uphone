import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compileCharacterPersonaPrompt,
  normalizeCharacterRecord,
  sanitizeCustomFields,
  validateCharacterAvatarUrl,
  validateCharacterInput,
} from '../storage/characterService';

test('validateCharacterInput enforces required name, avatar URL format, and custom field keys', () => {
  assert.equal(validateCharacterInput({ name: '   ' }).valid, false);
  assert.equal(validateCharacterInput({ name: 'a'.repeat(61) }).valid, false);
  assert.equal(validateCharacterInput({ name: '林夏' }).valid, true);

  assert.equal(validateCharacterAvatarUrl('').valid, true);
  assert.equal(validateCharacterAvatarUrl('https://example.com/a.png').valid, true);
  assert.equal(validateCharacterAvatarUrl('data:image/png;base64,AAA').valid, true);
  assert.equal(validateCharacterAvatarUrl('ftp://bad/a.png').valid, false);

  assert.equal(
    validateCharacterInput({
      name: '林夏',
      customFields: [{ id: 'cf_1', key: '  ', value: '有内容无键名' }],
    }).valid,
    false,
  );
  assert.equal(
    validateCharacterInput({
      name: '林夏',
      customFields: [{ id: 'cf_1', key: '代表花语', value: '白山茶' }],
    }).valid,
    true,
  );
});

test('sanitizeCustomFields trims values and removes completely blank entries', () => {
  const cleaned = sanitizeCustomFields([
    { id: 'cf_1', key: ' 生日 ', value: ' 10月14日 ' },
    { id: 'cf_2', key: '   ', value: '   ' },
  ]);
  assert.equal(cleaned.length, 1);
  assert.deepEqual(cleaned[0], { id: 'cf_1', key: '生日', value: '10月14日' });
});

test('compileCharacterPersonaPrompt combines free-form persona sections and custom fields', () => {
  const prompt = compileCharacterPersonaPrompt({
    persona: '独立书店店主',
    personality: '温柔细腻、慢热',
    speakingStyle: '轻声细语',
    customFields: [{ id: 'cf_1', key: '常喝饮品', value: '桂花乌龙' }],
  });
  assert.match(prompt, /【人物人设】\n独立书店店主/);
  assert.match(prompt, /【性格特点】\n温柔细腻、慢热/);
  assert.match(prompt, /【说话风格】\n轻声细语/);
  assert.match(prompt, /【自定义信息】\n- 常喝饮品: 桂花乌龙/);
});

test('normalizeCharacterRecord preserves createdAt, isPinned, tags, and syncs remark/tagline on edit', () => {
  const created = normalizeCharacterRecord(
    {
      name: '顾淮安',
      remark: '深夜电台主播',
      gender: '男',
      age: '27岁',
      persona: '城市深夜频率主理人',
      personality: '沉稳温和',
      appearance: '戴细框眼镜',
      speakingStyle: '低沉舒缓',
      background: '曾旅居南方小镇',
      relationship: '认识三年的听友兼邻里',
      otherNotes: '喜欢下雨夜',
      customFields: [{ id: 'cf_1', key: '节目时间', value: '23:00' }],
    },
    undefined,
    1700000001000,
    { avatarUrl: 'https://example.com/gu.jpg' },
  );

  assert.match(created.id, /^chr_/);
  assert.equal(created.name, '顾淮安');
  assert.equal(created.remark, '深夜电台主播');
  assert.equal(created.tagline, '深夜电台主播');
  assert.equal(created.avatar, 'https://example.com/gu.jpg');
  assert.equal(created.isPinned, false);
  assert.equal(created.createdAt, 1700000001000);
  assert.equal(created.updatedAt, 1700000001000);

  const edited = normalizeCharacterRecord(
    {
      id: created.id,
      name: '顾淮安·新版',
      remark: '温柔声线主播',
      persona: '更新后的人设长文本',
    },
    { ...created, isPinned: true, tags: ['radio'] },
    1700000009000,
    { avatarAssetId: 'ast_123' },
  );

  assert.equal(edited.id, created.id);
  assert.equal(edited.createdAt, 1700000001000);
  assert.equal(edited.updatedAt, 1700000009000);
  assert.equal(edited.isPinned, true);
  assert.deepEqual(edited.tags, ['radio']);
  assert.equal(edited.avatarAssetId, 'ast_123');
  assert.equal(edited.remark, '温柔声线主播');
  assert.equal(edited.tagline, '温柔声线主播');
});
