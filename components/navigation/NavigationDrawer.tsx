'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import {
  ArrowUpDown,
  MoreHorizontal,
  PencilLine,
  Pin,
  PinOff,
  Plus,
  Search,
  Smartphone,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { useNavigationDrawer } from './NavigationProvider';
import {
  CharacterDeleteDialog,
  type CharacterDeleteTarget,
} from '@/components/characters/CharacterDeleteDialog';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { backdropVariants, drawerLeftVariants } from '@/lib/motion/presets';
import { RESERVED_ROUTES } from '@/lib/navigation/routes';
import {
  CHARACTERS_UPDATED_EVENT,
  setCharacterPinned,
} from '@/lib/storage/characterService';
import {
  filterDrawerCharacters,
  loadDrawerCharacters,
  readActiveCharacterId,
  readDrawerSortMode,
  sortDrawerCharacters,
  writeActiveCharacterId,
  writeDrawerSortMode,
  type DrawerCharacterItem,
  type DrawerCharacterSortMode,
} from '@/lib/storage/drawerData';

const LONG_PRESS_DURATION_MS = 460;
const LONG_PRESS_MOVE_THRESHOLD_PX = 10;

export function NavigationDrawer() {
  const router = useRouter();
  const { locale } = useAppContext();
  const { isDrawerOpen, closeDrawer, user, avatarUrl } = useNavigationDrawer();
  const { showToast } = useToast();
  const isZh = locale === 'zh-CN';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<DrawerCharacterSortMode>(() => readDrawerSortMode());
  const [characters, setCharacters] = useState<DrawerCharacterItem[]>([]);
  const [activeCharId, setActiveCharId] = useState<string | null>(null);
  const [menuCharacter, setMenuCharacter] = useState<DrawerCharacterItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CharacterDeleteTarget | null>(null);

  const longPressTimerRef = useRef<number | null>(null);
  const longPressOriginRef = useRef<{ x: number; y: number } | null>(null);
  const suppressNextClickRef = useRef(false);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressOriginRef.current = null;
  };

  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, []);

  const refreshCharacters = useCallback(async (mode: DrawerCharacterSortMode) => {
    const items = await loadDrawerCharacters(mode);
    setActiveCharId(readActiveCharacterId());
    setCharacters(items);
  }, []);

  // Lock background page scroll when drawer is open & close on ESC
  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (deleteTarget) {
          setDeleteTarget(null);
          return;
        }
        if (menuCharacter) {
          setMenuCharacter(null);
          return;
        }
        closeDrawer();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isDrawerOpen, closeDrawer, menuCharacter, deleteTarget]);

  // Load real characters on open and stay synced with CHARACTERS_UPDATED_EVENT
  useEffect(() => {
    let active = true;
    loadDrawerCharacters(sortMode).then((items) => {
      if (active) {
        setActiveCharId(readActiveCharacterId());
        setCharacters(items);
      }
    });

    const onUpdated = () => {
      void refreshCharacters(sortMode);
    };
    window.addEventListener(CHARACTERS_UPDATED_EVENT, onUpdated);
    return () => {
      active = false;
      window.removeEventListener(CHARACTERS_UPDATED_EVENT, onUpdated);
    };
  }, [isDrawerOpen, sortMode, refreshCharacters]);

  // Manage character avatar ObjectURLs cleanly
  const charAvatarUrls = useMemo(() => {
    const urls: Record<string, string> = {};
    if (typeof URL === 'undefined') {
      return urls;
    }
    characters.forEach((item) => {
      if (item.avatarBlob) {
        urls[item.id] = URL.createObjectURL(item.avatarBlob);
      }
    });
    return urls;
  }, [characters]);

  useEffect(() => {
    return () => {
      Object.values(charAvatarUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [charAvatarUrls]);

  const filteredCharacters = useMemo(
    () => sortDrawerCharacters(filterDrawerCharacters(characters, searchQuery), sortMode),
    [characters, searchQuery, sortMode],
  );

  const navigateTo = (href: string) => {
    clearLongPressTimer();
    setMenuCharacter(null);
    setDeleteTarget(null);
    closeDrawer();
    router.push(href);
  };

  const handleToggleSortMode = () => {
    const nextMode: DrawerCharacterSortMode =
      sortMode === 'created_desc' ? 'created_asc' : 'created_desc';
    setSortMode(nextMode);
    writeDrawerSortMode(nextMode);
  };

  const handleSelectCharacter = (character: DrawerCharacterItem) => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    writeActiveCharacterId(character.id);
    setActiveCharId(character.id);
    navigateTo(`${RESERVED_ROUTES.chat}?characterId=${encodeURIComponent(character.id)}`);
  };

  const handlePointerDownRow = (
    event: React.PointerEvent<HTMLDivElement>,
    character: DrawerCharacterItem,
  ) => {
    if (event.button !== 0 && event.pointerType === 'mouse') {
      return;
    }
    clearLongPressTimer();
    suppressNextClickRef.current = false;
    longPressOriginRef.current = { x: event.clientX, y: event.clientY };

    longPressTimerRef.current = window.setTimeout(() => {
      suppressNextClickRef.current = true;
      longPressTimerRef.current = null;
      setMenuCharacter(character);
    }, LONG_PRESS_DURATION_MS);
  };

  const handlePointerMoveRow = (event: React.PointerEvent<HTMLDivElement>) => {
    const origin = longPressOriginRef.current;
    if (!origin) {
      return;
    }
    const dx = Math.abs(event.clientX - origin.x);
    const dy = Math.abs(event.clientY - origin.y);
    if (dx > LONG_PRESS_MOVE_THRESHOLD_PX || dy > LONG_PRESS_MOVE_THRESHOLD_PX) {
      clearLongPressTimer();
    }
  };

  const handleTogglePin = async (character: DrawerCharacterItem) => {
    const nextPinned = !character.isPinned;
    await setCharacterPinned(character.id, nextPinned);
    setCharacters((prev) =>
      sortDrawerCharacters(
        prev.map((item) =>
          item.id === character.id ? { ...item, isPinned: nextPinned } : item,
        ),
        sortMode,
      ),
    );
    setMenuCharacter(null);
    showToast({
      tone: 'info',
      title: nextPinned
        ? isZh
          ? `已置顶「${character.name}」`
          : `Pinned ${character.name}`
        : isZh
          ? `已取消置顶「${character.name}」`
          : `Unpinned ${character.name}`,
    });
  };

  const handleEditCharacter = (character: DrawerCharacterItem) => {
    navigateTo(
      `${RESERVED_ROUTES.characters}?action=edit&characterId=${encodeURIComponent(character.id)}`,
    );
  };

  const handleRequestDelete = (character: DrawerCharacterItem) => {
    setMenuCharacter(null);
    setDeleteTarget({ id: character.id, name: character.name });
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (menuCharacter || deleteTarget) {
      return;
    }
    if (info.offset.x < -72 || info.velocity.x < -300) {
      closeDrawer();
    }
  };

  const displayName = user?.displayName?.trim() || 'Uphone User';

  return (
    <>
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Right semi-transparent backdrop — clicking closes drawer */}
            <motion.div
              data-testid="drawer-backdrop"
              variants={backdropVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={closeDrawer}
              aria-hidden="true"
              className="fixed inset-0 bg-[var(--uphone-overlay)]"
            />

            {/* Left Slide-Out Drawer Panel: 82vw, max 360px, full height */}
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={isZh ? 'Uphone 导航抽屉' : 'Uphone Navigation Drawer'}
              variants={drawerLeftVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              drag="x"
              dragDirectionLock
              dragConstraints={{ left: -360, right: 0 }}
              dragElastic={{ left: 0.12, right: 0 }}
              onDragEnd={handleDragEnd}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex h-[100dvh] w-[82vw] max-w-[360px] flex-col overflow-hidden border-r border-[var(--uphone-border)] bg-[var(--uphone-surface)] pt-safe pb-safe pl-safe shadow-[var(--uphone-shadow-lg)]"
            >
              {/* 1. Fixed Top Brand Area: Logo + Name + Close Button ONLY */}
              <div className="shrink-0 flex items-center justify-between gap-2 px-4 pt-3 pb-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--uphone-border)] bg-gradient-to-br from-[var(--uphone-accent-soft)] to-[var(--uphone-champagne)] text-[var(--uphone-accent)]">
                    <Smartphone className="h-[18px] w-[18px]" strokeWidth={1.65} aria-hidden="true" />
                  </span>
                  <span className="uphone-display-serif truncate text-[19px] font-medium tracking-[0.06em] text-[var(--uphone-text)]">
                    Uphone
                  </span>
                </div>

                <IconButton
                  aria-label={isZh ? '关闭导航抽屉' : 'Close navigation drawer'}
                  variant="ghost"
                  onClick={closeDrawer}
                  className="text-[var(--uphone-text-muted)] hover:text-[var(--uphone-text)]"
                >
                  <X className="h-5 w-5" strokeWidth={1.65} aria-hidden="true" />
                </IconButton>
              </div>

              {/* 2. Fixed Search Area */}
              <div
                className="shrink-0 border-b border-[var(--uphone-border)] px-4 pt-1 pb-3"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Input
                  aria-label={isZh ? '搜索角色' : 'Search characters'}
                  placeholder={isZh ? '搜索角色名称或备注…' : 'Search name or notes…'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftSlot={<Search className="h-4 w-4" strokeWidth={1.65} aria-hidden="true" />}
                  rightSlot={
                    searchQuery ? (
                      <button
                        type="button"
                        aria-label={isZh ? '清空搜索' : 'Clear search'}
                        onClick={() => setSearchQuery('')}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--uphone-text-muted)] hover:bg-[var(--uphone-surface-muted)] cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={1.65} />
                      </button>
                    ) : undefined
                  }
                />
              </div>

              {/* 3. Middle Scrollable Character List (Independent Scroll) */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
                {characters.length === 0 ? (
                  <div className="flex min-h-full flex-col items-center justify-center py-4">
                    <EmptyState
                      bordered={false}
                      icon={<Users className="h-5 w-5" strokeWidth={1.65} aria-hidden="true" />}
                      title={isZh ? '暂无角色' : 'No Characters Yet'}
                      description={
                        isZh
                          ? '添加角色后，将在这里展示并支持点击进入聊天、长按管理。'
                          : 'Added characters will appear here for quick chat and long-press management.'
                      }
                      action={
                        <Button
                          size="sm"
                          variant="primary"
                          leftIcon={<Plus className="h-3.5 w-3.5" strokeWidth={1.75} />}
                          onClick={() => navigateTo(`${RESERVED_ROUTES.characters}?action=new`)}
                        >
                          {isZh ? '添加角色' : 'Add Character'}
                        </Button>
                      }
                      className="px-4 py-6"
                    />
                  </div>
                ) : filteredCharacters.length === 0 ? (
                  <div className="flex min-h-full flex-col items-center justify-center py-4">
                    <EmptyState
                      bordered={false}
                      icon={<Search className="h-5 w-5" strokeWidth={1.65} aria-hidden="true" />}
                      title={isZh ? '未找到匹配角色' : 'No Matching Characters'}
                      description={
                        isZh
                          ? '试试其他名称、备注关键词，或清空搜索条件。'
                          : 'Try another keyword or clear the search box.'
                      }
                      action={
                        <Button size="sm" variant="secondary" onClick={() => setSearchQuery('')}>
                          {isZh ? '清空搜索' : 'Clear Search'}
                        </Button>
                      }
                      className="px-4 py-6"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1.5 pb-0.5 text-[11px] text-[var(--uphone-text-subtle)]">
                      <span>
                        {isZh ? `共 ${filteredCharacters.length} 位角色` : `${filteredCharacters.length} Characters`}
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleSortMode}
                        aria-label={isZh ? '切换按创建时间排序' : 'Toggle sort by creation time'}
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-[var(--uphone-text-muted)] transition-colors hover:bg-[var(--uphone-surface-muted)] hover:text-[var(--uphone-text)] cursor-pointer"
                      >
                        <ArrowUpDown className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                        <span>
                          {sortMode === 'created_desc'
                            ? isZh
                              ? '创建时间：最新'
                              : 'Newest'
                            : isZh
                              ? '创建时间：最早'
                              : 'Oldest'}
                        </span>
                      </button>
                    </div>

                    <ul className="flex flex-col gap-1" role="list">
                      {filteredCharacters.map((item) => {
                        const isSelected = activeCharId === item.id;
                        const itemAvatarSrc = charAvatarUrls[item.id] ?? item.avatarUrl;
                        return (
                          <li key={item.id}>
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => handleSelectCharacter(item)}
                              onPointerDown={(e) => handlePointerDownRow(e, item)}
                              onPointerMove={handlePointerMoveRow}
                              onPointerUp={clearLongPressTimer}
                              onPointerCancel={clearLongPressTimer}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                clearLongPressTimer();
                                setMenuCharacter(item);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleSelectCharacter(item);
                                }
                              }}
                              className={`flex min-h-[60px] w-full select-none items-center gap-3 rounded-[var(--uphone-radius-lg)] border px-3 py-2 text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? 'border-[var(--uphone-accent)]/25 bg-[var(--uphone-accent-soft)]'
                                  : 'border-transparent hover:bg-[var(--uphone-surface-muted)]/75'
                              }`}
                            >
                              <Avatar
                                src={itemAvatarSrc}
                                alt={item.name}
                                fallbackText={item.name}
                                size="md"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`truncate text-sm font-medium ${
                                      isSelected
                                        ? 'text-[var(--uphone-accent)]'
                                        : 'text-[var(--uphone-text)]'
                                    }`}
                                  >
                                    {item.name}
                                  </span>
                                  {item.isPinned && (
                                    <Pin
                                      className="h-3 w-3 shrink-0 text-[var(--uphone-accent)]"
                                      strokeWidth={1.75}
                                      aria-label={isZh ? '已置顶' : 'Pinned'}
                                    />
                                  )}
                                </div>
                                <p className="mt-0.5 truncate text-xs text-[var(--uphone-text-muted)]">
                                  {item.tagline || (isZh ? '暂无备注' : 'No remarks')}
                                </p>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    <button
                      type="button"
                      onClick={() => navigateTo(`${RESERVED_ROUTES.characters}?action=new`)}
                      className="mt-1 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-[var(--uphone-radius-lg)] border border-dashed border-[var(--uphone-border-strong)] px-3 py-2 text-xs font-medium text-[var(--uphone-text-muted)] transition-colors hover:bg-[var(--uphone-surface-muted)]/65 hover:text-[var(--uphone-text)] cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                      <span>{isZh ? '添加角色' : 'Add Character'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Fixed Bottom User Profile Card ONLY */}
              <div className="shrink-0 border-t border-[var(--uphone-border)] bg-[var(--uphone-surface)] px-3.5 py-3">
                <button
                  type="button"
                  aria-label={isZh ? '进入 User 个人资料与应用设置' : 'Open User Profile and App Settings'}
                  onClick={() => navigateTo(RESERVED_ROUTES.profile)}
                  className="flex min-h-[60px] w-full items-center justify-between gap-3 rounded-[var(--uphone-radius-xl)] border border-[var(--uphone-border)] bg-[var(--uphone-surface-elevated)] px-3 py-2 text-left shadow-[var(--uphone-shadow-xs)] transition-colors hover:bg-[var(--uphone-surface-muted)]/65 cursor-pointer"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      src={avatarUrl}
                      alt={displayName}
                      fallbackText={displayName}
                      size="md"
                      shape="squircle"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--uphone-text)]">
                        {displayName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[var(--uphone-text-muted)]">
                        {isZh ? '个人资料与应用设置' : 'Profile & App Settings'}
                      </p>
                    </div>
                  </div>
                  <MoreHorizontal
                    className="h-4 w-4 shrink-0 text-[var(--uphone-text-muted)]"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Long-press / Context Management Menu for Character Row */}
      <Modal
        open={Boolean(menuCharacter)}
        onClose={() => setMenuCharacter(null)}
        title={menuCharacter ? menuCharacter.name : ''}
        description={
          menuCharacter?.tagline ||
          (isZh ? '选择要对该角色执行的管理操作' : 'Choose a management action')
        }
        closeLabel={isZh ? '关闭角色管理菜单' : 'Close character menu'}
        footer={
          <Button variant="ghost" onClick={() => setMenuCharacter(null)}>
            {isZh ? '取消' : 'Cancel'}
          </Button>
        }
      >
        {menuCharacter && (
          <div className="flex flex-col gap-2 py-1">
            <button
              type="button"
              onClick={() => handleTogglePin(menuCharacter)}
              className="flex min-h-[48px] w-full items-center gap-3 rounded-[var(--uphone-radius-md)] border border-[var(--uphone-border)] bg-[var(--uphone-surface)] px-3.5 py-2.5 text-left text-sm font-medium text-[var(--uphone-text)] transition-colors hover:bg-[var(--uphone-surface-muted)] cursor-pointer"
            >
              {menuCharacter.isPinned ? (
                <PinOff className="h-4 w-4 shrink-0 text-[var(--uphone-accent)]" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Pin className="h-4 w-4 shrink-0 text-[var(--uphone-accent)]" strokeWidth={1.75} aria-hidden="true" />
              )}
              <span>
                {menuCharacter.isPinned
                  ? isZh
                    ? '取消置顶'
                    : 'Unpin Character'
                  : isZh
                    ? '置顶角色'
                    : 'Pin Character'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleEditCharacter(menuCharacter)}
              className="flex min-h-[48px] w-full items-center gap-3 rounded-[var(--uphone-radius-md)] border border-[var(--uphone-border)] bg-[var(--uphone-surface)] px-3.5 py-2.5 text-left text-sm font-medium text-[var(--uphone-text)] transition-colors hover:bg-[var(--uphone-surface-muted)] cursor-pointer"
            >
              <PencilLine className="h-4 w-4 shrink-0 text-[var(--uphone-text-muted)]" strokeWidth={1.75} aria-hidden="true" />
              <span>{isZh ? '编辑角色' : 'Edit Character'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleRequestDelete(menuCharacter)}
              className="flex min-h-[48px] w-full items-center gap-3 rounded-[var(--uphone-radius-md)] border border-[var(--uphone-border)] bg-[var(--uphone-danger-soft)]/50 px-3.5 py-2.5 text-left text-sm font-medium text-[var(--uphone-danger)] transition-colors hover:bg-[var(--uphone-danger-soft)] cursor-pointer"
            >
              <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>{isZh ? '删除角色' : 'Delete Character'}</span>
            </button>
          </div>
        )}
      </Modal>

      {/* Secondary Confirmation Dialog for Safe Character Deletion */}
      <CharacterDeleteDialog
        target={deleteTarget}
        locale={locale === 'en-US' ? 'en-US' : 'zh-CN'}
        onClose={() => setDeleteTarget(null)}
        onDeleted={(deletedId) => {
          setCharacters((prev) => prev.filter((item) => item.id !== deletedId));
          if (activeCharId === deletedId) {
            setActiveCharId(null);
          }
        }}
      />
    </>
  );
}
