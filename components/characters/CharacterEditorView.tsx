'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Camera,
  Check,
  Link2,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { TopBar } from '@/components/layout/TopBar';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { createId } from '@/lib/id';
import { RESERVED_ROUTES } from '@/lib/navigation/routes';
import {
  getCharacterSnapshot,
  saveCharacter,
  validateCharacterAvatarUrl,
  validateCharacterInput,
} from '@/lib/storage/characterService';
import { validateAvatarFile } from '@/lib/storage/userService';
import type { CharacterCustomField } from '@/types/uphone';

interface CharacterFormState {
  name: string;
  remark: string;
  gender: string;
  age: string;
  avatarUrl: string;
  persona: string;
  personality: string;
  appearance: string;
  speakingStyle: string;
  background: string;
  relationship: string;
  otherNotes: string;
  customFields: CharacterCustomField[];
}

const EMPTY_FORM_STATE: CharacterFormState = {
  name: '',
  remark: '',
  gender: '',
  age: '',
  avatarUrl: '',
  persona: '',
  personality: '',
  appearance: '',
  speakingStyle: '',
  background: '',
  relationship: '',
  otherNotes: '',
  customFields: [],
};

export function CharacterEditorView() {
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');
  const characterIdParam = searchParams.get('characterId');
  const isEditMode = Boolean(characterIdParam && actionParam !== 'new');
  const editorKey = isEditMode ? `edit:${characterIdParam}` : 'create';

  return (
    <CharacterEditorForm
      key={editorKey}
      isEditMode={isEditMode}
      characterIdParam={characterIdParam}
    />
  );
}

function CharacterEditorForm({
  isEditMode,
  characterIdParam,
}: {
  isEditMode: boolean;
  characterIdParam: string | null;
}) {
  const router = useRouter();
  const { locale } = useAppContext();
  const { showToast } = useToast();
  const isZh = locale === 'zh-CN';

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CharacterFormState>(EMPTY_FORM_STATE);
  const [persistedBlob, setPersistedBlob] = useState<Blob | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [avatarUrlError, setAvatarUrlError] = useState<string | undefined>(undefined);

  // Load existing character when editing
  useEffect(() => {
    if (!isEditMode || !characterIdParam) {
      return;
    }

    let active = true;
    getCharacterSnapshot(characterIdParam)
      .then((snapshot) => {
        if (!active) {
          return;
        }
        if (!snapshot) {
          setNotFound(true);
          return;
        }
        const { character, avatarBlob } = snapshot;
        setForm({
          name: character.name ?? '',
          remark: character.remark ?? character.tagline ?? '',
          gender: character.gender ?? '',
          age: character.age ?? '',
          avatarUrl: character.avatar ?? '',
          persona: character.persona ?? '',
          personality: character.personality ?? '',
          appearance: character.appearance ?? '',
          speakingStyle: character.speakingStyle ?? '',
          background: character.background ?? '',
          relationship: character.relationship ?? '',
          otherNotes: character.otherNotes ?? '',
          customFields: (character.customFields ?? []).map((f) => ({ ...f })),
        });
        setPersistedBlob(avatarBlob);
        setPendingFile(null);
        setRemoveAvatar(false);
        setShowUrlInput(Boolean(character.avatar));
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isEditMode, characterIdParam]);

  const persistedBlobUrl = useMemo(() => {
    if (!persistedBlob || typeof URL === 'undefined') {
      return null;
    }
    return URL.createObjectURL(persistedBlob);
  }, [persistedBlob]);

  useEffect(() => {
    if (!persistedBlobUrl) {
      return;
    }
    return () => URL.revokeObjectURL(persistedBlobUrl);
  }, [persistedBlobUrl]);

  const pendingPreviewUrl = useMemo(() => {
    if (!pendingFile || typeof URL === 'undefined') {
      return null;
    }
    return URL.createObjectURL(pendingFile);
  }, [pendingFile]);

  useEffect(() => {
    if (!pendingPreviewUrl) {
      return;
    }
    return () => URL.revokeObjectURL(pendingPreviewUrl);
  }, [pendingPreviewUrl]);

  const trimmedUrl = form.avatarUrl.trim();
  const activePreviewSrc = removeAvatar
    ? null
    : pendingPreviewUrl ?? (trimmedUrl || persistedBlobUrl);

  const handleFieldChange = <K extends keyof CharacterFormState>(
    key: K,
    value: CharacterFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'name' && nameError) {
      setNameError(undefined);
    }
    if (key === 'avatarUrl' && avatarUrlError) {
      setAvatarUrlError(undefined);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const check = validateAvatarFile(file);
    if (!check.valid) {
      showToast({
        tone: 'danger',
        title: isZh ? '头像图片不可用' : 'Invalid avatar image',
        description: check.reason,
      });
      return;
    }
    setPendingFile(file);
    setRemoveAvatar(false);
    handleFieldChange('avatarUrl', '');
    setAvatarUrlError(undefined);
    event.target.value = '';
  };

  const handleUrlInputChange = (nextUrl: string) => {
    setForm((prev) => ({ ...prev, avatarUrl: nextUrl }));
    if (nextUrl.trim()) {
      setPendingFile(null);
      setRemoveAvatar(false);
    }
    if (avatarUrlError) {
      setAvatarUrlError(undefined);
    }
  };

  const handleRemoveAvatar = () => {
    setPendingFile(null);
    setPersistedBlob(null);
    setRemoveAvatar(true);
    setForm((prev) => ({ ...prev, avatarUrl: '' }));
    setAvatarUrlError(undefined);
  };

  const handleAddCustomField = () => {
    setForm((prev) => ({
      ...prev,
      customFields: [
        ...prev.customFields,
        { id: createId('cf'), key: '', value: '' },
      ],
    }));
  };

  const handleUpdateCustomField = (
    fieldId: string,
    patch: Partial<Pick<CharacterCustomField, 'key' | 'value'>>,
  ) => {
    setForm((prev) => ({
      ...prev,
      customFields: prev.customFields.map((item) =>
        item.id === fieldId ? { ...item, ...patch } : item,
      ),
    }));
  };

  const handleRemoveCustomField = (fieldId: string) => {
    setForm((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((item) => item.id !== fieldId),
    }));
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(RESERVED_ROUTES.home);
  };

  const handleSave = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (isSaving) {
      return;
    }

    const inputPayload = {
      id: isEditMode && characterIdParam ? characterIdParam : undefined,
      name: form.name,
      remark: form.remark,
      gender: form.gender,
      age: form.age,
      avatarUrl: form.avatarUrl,
      newAvatarFile: pendingFile,
      removeAvatar,
      persona: form.persona,
      personality: form.personality,
      appearance: form.appearance,
      speakingStyle: form.speakingStyle,
      background: form.background,
      relationship: form.relationship,
      otherNotes: form.otherNotes,
      customFields: form.customFields,
    };

    const check = validateCharacterInput(inputPayload);
    if (!check.valid) {
      if (!form.name.trim() || form.name.trim().length > 60) {
        setNameError(check.reason);
      } else {
        const urlCheck = validateCharacterAvatarUrl(form.avatarUrl);
        if (!urlCheck.valid) {
          setAvatarUrlError(urlCheck.reason);
        }
      }
      showToast({
        tone: 'danger',
        title: isZh ? '请检查输入内容' : 'Please check your input',
        description: check.reason,
      });
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveCharacter(inputPayload);
      setPersistedBlob(saved.avatarBlob);
      setPendingFile(null);
      setRemoveAvatar(false);
      setForm({
        name: saved.character.name,
        remark: saved.character.remark ?? '',
        gender: saved.character.gender ?? '',
        age: saved.character.age ?? '',
        avatarUrl: saved.character.avatar ?? '',
        persona: saved.character.persona ?? '',
        personality: saved.character.personality ?? '',
        appearance: saved.character.appearance ?? '',
        speakingStyle: saved.character.speakingStyle ?? '',
        background: saved.character.background ?? '',
        relationship: saved.character.relationship ?? '',
        otherNotes: saved.character.otherNotes ?? '',
        customFields: (saved.character.customFields ?? []).map((f) => ({ ...f })),
      });

      showToast({
        tone: 'success',
        title: isEditMode
          ? isZh
            ? `已保存「${saved.character.name}」的修改`
            : `Updated ${saved.character.name}`
          : isZh
            ? `已创建角色「${saved.character.name}」`
            : `Created ${saved.character.name}`,
        description: isZh
          ? '已持久化保存并同步至左侧角色列表。'
          : 'Saved locally and synced to the drawer character list.',
      });

      if (!isEditMode) {
        router.replace(
          `${RESERVED_ROUTES.characters}?action=edit&characterId=${encodeURIComponent(saved.character.id)}`,
        );
      }
    } catch (error) {
      showToast({
        tone: 'danger',
        title: isZh ? '保存失败' : 'Save failed',
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const pageTitle = isEditMode
    ? isZh
      ? '编辑角色'
      : 'Edit Character'
    : isZh
      ? '创建角色'
      : 'Create Character';

  return (
    <div className="uphone-viewport flex min-h-[100dvh] flex-col bg-[var(--uphone-bg)] text-[var(--uphone-text)]">
      <TopBar
        left={
          <IconButton
            aria-label={isZh ? '返回上一页' : 'Go back'}
            variant="ghost"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </IconButton>
        }
        title={pageTitle}
        right={
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={isSaving}
            disabled={isLoading || notFound}
            leftIcon={<Check className="h-3.5 w-3.5" strokeWidth={2} />}
            onClick={() => handleSave()}
          >
            {isZh ? '保存' : 'Save'}
          </Button>
        }
      />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-5 pb-12 sm:px-6">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loading size="md" label={isZh ? '正在读取角色档案…' : 'Loading character…'} />
          </div>
        ) : notFound ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <EmptyState
              icon={<UserRound className="h-6 w-6" strokeWidth={1.65} />}
              title={isZh ? '未找到该角色' : 'Character Not Found'}
              description={
                isZh
                  ? '该角色可能已被删除，或链接参数无效。你可以重新创建角色或返回首页。'
                  : 'This character may have been deleted or the link is invalid.'
              }
              action={
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <Button
                    variant="secondary"
                    onClick={() => router.push(RESERVED_ROUTES.home)}
                  >
                    {isZh ? '返回首页' : 'Back Home'}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => router.replace(`${RESERVED_ROUTES.characters}?action=new`)}
                  >
                    {isZh ? '创建新角色' : 'Create Character'}
                  </Button>
                </div>
              }
            />
          </div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={handleSave}
            className="space-y-5"
          >
            {/* 1. 基础资料 */}
            <Card variant="elevated" padding="lg" className="space-y-5">
              <div className="flex items-center justify-between gap-2 border-b border-[var(--uphone-border)] pb-3">
                <div>
                  <h1 className="text-sm font-semibold tracking-tight text-[var(--uphone-text)]">
                    {isZh ? '基础资料' : 'Basic Profile'}
                  </h1>
                  <p className="mt-0.5 text-xs text-[var(--uphone-text-muted)]">
                    {isZh
                      ? '设置角色头像、名称与用于在侧边抽屉识别的备注信息。'
                      : 'Set avatar, name, and remarks shown in the drawer.'}
                  </p>
                </div>
              </div>

              {/* Avatar Upload & URL Preview */}
              <div className="flex flex-col items-center gap-3.5 rounded-[var(--uphone-radius-xl)] border border-[var(--uphone-border)] bg-[var(--uphone-surface)]/75 px-4 py-5 text-center">
                <Avatar
                  src={activePreviewSrc}
                  alt={form.name || (isZh ? '角色头像' : 'Character avatar')}
                  fallbackText={form.name || 'AI'}
                  size="xl"
                  shape="squircle"
                />

                <div className="space-y-1">
                  <p className="text-xs font-medium text-[var(--uphone-text)]">
                    {isZh ? '角色头像' : 'Character Avatar'}
                  </p>
                  <p className="text-[11px] text-[var(--uphone-text-muted)]">
                    {isZh
                      ? '支持本地图片上传（持久化至 IndexedDB）或填写在线图片链接'
                      : 'Upload a local image or enter an image URL'}
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  aria-label={isZh ? '上传角色头像图片' : 'Upload character avatar'}
                  onChange={handleFileChange}
                  className="sr-only"
                />

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<Camera className="h-3.5 w-3.5" strokeWidth={1.75} />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {activePreviewSrc
                      ? isZh
                        ? '更换本地图片'
                        : 'Replace Image'
                      : isZh
                        ? '上传本地图片'
                        : 'Upload Image'}
                  </Button>

                  <Button
                    type="button"
                    variant={showUrlInput ? 'secondary' : 'ghost'}
                    size="sm"
                    leftIcon={<Link2 className="h-3.5 w-3.5" strokeWidth={1.75} />}
                    onClick={() => setShowUrlInput((prev) => !prev)}
                  >
                    {isZh ? '图片 URL' : 'Image URL'}
                  </Button>

                  {activePreviewSrc && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      leftIcon={<Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />}
                      onClick={handleRemoveAvatar}
                    >
                      {isZh ? '删除头像' : 'Remove'}
                    </Button>
                  )}
                </div>

                {showUrlInput && (
                  <div className="w-full max-w-md pt-1 text-left">
                    <Input
                      aria-label={isZh ? '头像图片链接 URL' : 'Avatar image URL'}
                      placeholder="https://example.com/avatar.jpg"
                      value={form.avatarUrl}
                      onChange={(e) => handleUrlInputChange(e.target.value)}
                      error={avatarUrlError}
                    />
                  </div>
                )}
              </div>

              {/* Name, Remark, Gender, Age */}
              <div className="space-y-4">
                <Input
                  label={isZh ? '角色名称 *' : 'Character Name *'}
                  placeholder={isZh ? '例如：林夏、顾淮安…' : 'e.g. Lin Xia, Aiden…'}
                  value={form.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  error={nameError}
                  maxLength={60}
                  aria-required="true"
                />

                <Input
                  label={isZh ? '角色备注' : 'Remark / Tagline'}
                  placeholder={
                    isZh
                      ? '一句话印象或身份，用于列表展示与搜索'
                      : 'Short role tagline shown and searchable in the drawer'
                  }
                  value={form.remark}
                  onChange={(e) => handleFieldChange('remark', e.target.value)}
                  maxLength={100}
                />

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <Input
                    label={isZh ? '角色性别（可选）' : 'Gender (Optional)'}
                    placeholder={isZh ? '例如：女、男、非二元…' : 'Optional'}
                    value={form.gender}
                    onChange={(e) => handleFieldChange('gender', e.target.value)}
                    maxLength={32}
                  />
                  <Input
                    label={isZh ? '角色年龄（可选）' : 'Age (Optional)'}
                    placeholder={isZh ? '例如：24岁、未知…' : 'Optional'}
                    value={form.age}
                    onChange={(e) => handleFieldChange('age', e.target.value)}
                    maxLength={32}
                  />
                </div>
              </div>
            </Card>

            {/* 2. 人物设定 */}
            <Card variant="elevated" padding="lg" className="space-y-4">
              <div className="border-b border-[var(--uphone-border)] pb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles
                    className="h-4 w-4 text-[var(--uphone-accent)]"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <h2 className="text-sm font-semibold tracking-tight text-[var(--uphone-text)]">
                    {isZh ? '人物设定' : 'Persona & Lore'}
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-[var(--uphone-text-muted)]">
                  {isZh
                    ? '支持自由书写长文本设定，所有栏位均不限制固定模板。'
                    : 'Free-form multi-line editors supporting detailed, long-form character writing.'}
                </p>
              </div>

              <Textarea
                label={isZh ? '人物人设' : 'Core Persona'}
                placeholder={
                  isZh
                    ? '描述角色的核心身份、职业日常、价值观或整体人设定位…'
                    : 'Core identity, lifestyle, values, and role positioning…'
                }
                value={form.persona}
                onChange={(e) => handleFieldChange('persona', e.target.value)}
                rows={4}
              />

              <Textarea
                label={isZh ? '性格特点' : 'Personality'}
                placeholder={
                  isZh
                    ? '温柔克制、偶尔嘴硬心软、对细节敏感或内心隐藏的小习惯…'
                    : 'Temperament, emotional nuances, habits, strengths and flaws…'
                }
                value={form.personality}
                onChange={(e) => handleFieldChange('personality', e.target.value)}
                rows={3}
              />

              <Textarea
                label={isZh ? '外貌描述' : 'Appearance'}
                placeholder={
                  isZh
                    ? '发色、眉眼气质、常见穿搭风格、随身物件或给人的第一印象…'
                    : 'Hair, eyes, posture, signature style, and visual presence…'
                }
                value={form.appearance}
                onChange={(e) => handleFieldChange('appearance', e.target.value)}
                rows={3}
              />

              <Textarea
                label={isZh ? '说话风格' : 'Speaking Style'}
                placeholder={
                  isZh
                    ? '语速语调、常用语气词、对待不同情绪时的表达习惯或口头禅…'
                    : 'Tone, cadence, phrasing habits, and conversational nuances…'
                }
                value={form.speakingStyle}
                onChange={(e) => handleFieldChange('speakingStyle', e.target.value)}
                rows={3}
              />

              <Textarea
                label={isZh ? '人物背景故事' : 'Background Story'}
                placeholder={
                  isZh
                    ? '成长经历、重要的过往转折、一直记在心里的事或当前生活状态…'
                    : 'Upbringing, turning points, cherished memories, and current life…'
                }
                value={form.background}
                onChange={(e) => handleFieldChange('background', e.target.value)}
                rows={4}
              />

              <Textarea
                label={isZh ? '与 User 的关系' : 'Relationship with User'}
                placeholder={
                  isZh
                    ? '青梅竹马、合租室友、久别重逢的旧友、或刚认识的温柔邻居…'
                    : 'How this character knows User and the emotional dynamic between them…'
                }
                value={form.relationship}
                onChange={(e) => handleFieldChange('relationship', e.target.value)}
                rows={3}
              />

              <Textarea
                label={isZh ? '其他补充设定' : 'Additional Notes'}
                placeholder={
                  isZh
                    ? '喜欢的季节、饮食偏好、作息习惯、禁忌话题或其他希望保留的细节…'
                    : 'Preferences, routines, boundaries, or extra lore details…'
                }
                value={form.otherNotes}
                onChange={(e) => handleFieldChange('otherNotes', e.target.value)}
                rows={3}
              />
            </Card>

            {/* 3. 自定义信息 */}
            <Card variant="elevated" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--uphone-border)] pb-3">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-[var(--uphone-text)]">
                    {isZh ? '自定义信息' : 'Custom Fields'}
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--uphone-text-muted)]">
                    {isZh
                      ? '按需补充专属属性，例如生日、MBTI、代表花语或专属暗号。'
                      : 'Add any extra attributes such as birthday, traits, or motifs.'}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<Plus className="h-3.5 w-3.5" strokeWidth={1.75} />}
                  onClick={handleAddCustomField}
                >
                  {isZh ? '添加字段' : 'Add Field'}
                </Button>
              </div>

              {form.customFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[var(--uphone-radius-lg)] border border-dashed border-[var(--uphone-border-strong)] bg-[var(--uphone-surface)]/55 px-4 py-6 text-center">
                  <p className="text-xs text-[var(--uphone-text-muted)]">
                    {isZh
                      ? '暂未添加自定义字段，点击上方“添加字段”即可自由扩展角色属性。'
                      : 'No custom fields yet. Tap "Add Field" to define your own attributes.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.customFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="space-y-2.5 rounded-[var(--uphone-radius-lg)] border border-[var(--uphone-border)] bg-[var(--uphone-surface)] p-3.5"
                    >
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Input
                            label={
                              isZh ? `字段名称 #${index + 1}` : `Field Name #${index + 1}`
                            }
                            placeholder={isZh ? '例如：生日 / MBTI / 代表香气' : 'Field key…'}
                            value={field.key}
                            onChange={(e) =>
                              handleUpdateCustomField(field.id, { key: e.target.value })
                            }
                            maxLength={50}
                          />
                        </div>
                        <IconButton
                          type="button"
                          aria-label={isZh ? '删除该自定义字段' : 'Remove custom field'}
                          variant="ghost"
                          onClick={() => handleRemoveCustomField(field.id)}
                          className="mb-0.5 text-[var(--uphone-text-muted)] hover:text-[var(--uphone-danger)]"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                        </IconButton>
                      </div>

                      <Textarea
                        label={isZh ? '字段内容' : 'Field Content'}
                        placeholder={isZh ? '输入该字段的详细内容…' : 'Enter field value…'}
                        value={field.value}
                        onChange={(e) =>
                          handleUpdateCustomField(field.id, { value: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Button type="button" variant="ghost" onClick={handleBack}>
                {isZh ? '取消' : 'Cancel'}
              </Button>
              <Button type="submit" variant="primary" loading={isSaving}>
                {isEditMode
                  ? isZh
                    ? '保存修改'
                    : 'Save Changes'
                  : isZh
                    ? '保存角色'
                    : 'Create Character'}
              </Button>
            </div>
          </motion.form>
        )}
      </main>
    </div>
  );
}
