'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '@/components/providers/AppProviders';
import { useNavigationDrawer } from '@/components/navigation/NavigationProvider';
import { useToast } from '@/components/ui/Toast';
import { useSystemClock } from '@/hooks/use-system-clock';
import { getReservedWeatherState } from '@/lib/home/weather';
import {
  DEFAULT_DESKTOP_WIDGETS,
  reorderDesktopWidgets,
  sortDesktopWidgets,
  toggleDesktopWidgetVisibility,
  updateDesktopWidgetSize,
  type WidgetLayoutManager,
} from '@/lib/home/widgets';
import {
  loadDesktopWidgetLayout,
  loadHomeBackground,
  loadHomeNote,
  saveDesktopWidgetLayout,
  saveHomeBackground,
  saveHomeNote,
} from '@/lib/home/persistence';
import type {
  DesktopWidgetConfig,
  DesktopWidgetSize,
  HomeBackgroundConfig,
  NoteState,
} from '@/lib/home/types';
import { pageTransitionVariants } from '@/lib/motion/presets';
import { HomeTopHeader } from './HomeTopHeader';
import {
  BackgroundPickerModal,
  HOME_WALLPAPER_STYLES,
} from './BackgroundPickerModal';
import { ClockWidget } from './widgets/ClockWidget';
import { DateWidget } from './widgets/DateWidget';
import { WeatherWidget } from './widgets/WeatherWidget';
import { NoteWidget } from './widgets/NoteWidget';
import { RecentChatsWidget } from './widgets/RecentChatsWidget';
import { CustomSlotWidget } from './widgets/CustomSlotWidget';

export interface HomeDesktopProps {
  /** Reserved navigation drawer callback */
  onOpenDrawer?: () => void;
}

const SIZE_SPAN_CLASSES: Record<DesktopWidgetSize, string> = {
  sm: 'col-span-1',
  md: 'col-span-2',
  lg: 'col-span-2 row-span-2',
};

export function HomeDesktop({ onOpenDrawer }: HomeDesktopProps) {
  const { locale, resolvedTheme, toggleLocale, toggleTheme } = useAppContext();
  const { openDrawer } = useNavigationDrawer();
  const { showToast } = useToast();
  const now = useSystemClock();
  const isZh = locale === 'zh-CN';

  const [widgets, setWidgets] = useState<DesktopWidgetConfig[]>(() => [
    ...DEFAULT_DESKTOP_WIDGETS,
  ]);
  const [note, setNote] = useState<NoteState>({
    id: 'home_primary_note',
    content: '',
    updatedAt: 0,
  });
  const [background, setBackground] = useState<HomeBackgroundConfig>({
    presetId: 'default',
  });
  const [bgModalOpen, setBgModalOpen] = useState(false);

  const weather = useMemo(() => getReservedWeatherState(), []);

  useEffect(() => {
    let active = true;
    Promise.all([
      loadHomeNote(),
      loadHomeBackground(),
      loadDesktopWidgetLayout(),
    ]).then(([savedNote, savedBg, savedLayout]) => {
      if (!active) {
        return;
      }
      setNote(savedNote);
      setBackground(savedBg);
      setWidgets(savedLayout);
    });
    return () => {
      active = false;
    };
  }, []);

  // Reserved widget edit & sort manager contract for future customization mode
  const widgetLayoutManager = useMemo<WidgetLayoutManager>(
    () => ({
      widgets: sortDesktopWidgets(widgets),
      reorder: (sourceId: string, targetId: string) => {
        const next = reorderDesktopWidgets(widgets, sourceId, targetId);
        setWidgets(next);
        void saveDesktopWidgetLayout(next);
        return next;
      },
      resize: (id: string, size: DesktopWidgetSize) => {
        const next = updateDesktopWidgetSize(widgets, id, size);
        setWidgets(next);
        void saveDesktopWidgetLayout(next);
        return next;
      },
      toggleVisibility: (id: string) => {
        const next = toggleDesktopWidgetVisibility(widgets, id);
        setWidgets(next);
        void saveDesktopWidgetLayout(next);
        return next;
      },
    }),
    [widgets],
  );

  const handleSaveNote = useCallback(
    async (content: string) => {
      const saved = await saveHomeNote(content);
      setNote(saved);
      showToast({
        tone: 'success',
        title: isZh ? '便签已保存' : 'Note saved',
      });
    },
    [isZh, showToast],
  );

  const handleBackgroundChange = useCallback(
    async (next: HomeBackgroundConfig) => {
      setBackground(next);
      await saveHomeBackground(next);
      showToast({
        tone: 'info',
        title: isZh ? '桌面背景已更新' : 'Wallpaper updated',
      });
    },
    [isZh, showToast],
  );

  const handleOpenDrawer = useCallback(() => {
    if (onOpenDrawer) {
      onOpenDrawer();
      return;
    }
    openDrawer();
  }, [onOpenDrawer, openDrawer]);

  const backgroundStyle = useMemo<React.CSSProperties>(() => {
    if (background.presetId === 'custom_image' && background.customImageUrl) {
      return {
        backgroundImage: `linear-gradient(to bottom, rgba(59, 44, 48, 0.12), rgba(59, 44, 48, 0.22)), url(${background.customImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    const presetKey =
      background.presetId === 'custom_image' ? 'default' : background.presetId;
    const preset = HOME_WALLPAPER_STYLES[presetKey];
    return {
      background: resolvedTheme === 'dark' ? preset.darkBg : preset.lightBg,
    };
  }, [background, resolvedTheme]);

  const visibleWidgets = useMemo(
    () =>
      widgetLayoutManager.widgets.filter(
        (w) => w.isVisible && w.type !== 'quote' && w.type !== 'custom_slot',
      ),
    [widgetLayoutManager.widgets],
  );

  const renderWidget = (config: DesktopWidgetConfig) => {
    switch (config.type) {
      case 'clock':
        return <ClockWidget now={now} locale={locale} />;
      case 'date':
        return <DateWidget now={now} locale={locale} />;
      case 'weather':
        return (
          <WeatherWidget
            weather={weather}
            locale={locale}
            onTap={() =>
              showToast({
                tone: 'info',
                title: isZh ? '天气接口已预留' : 'Weather API reserved',
                description: isZh
                  ? '尚未配置天气数据源，不展示模拟气温。'
                  : 'No weather API connected yet.',
              })
            }
          />
        );
      case 'note':
        return (
          <NoteWidget
            note={note}
            locale={locale}
            onSaveNote={handleSaveNote}
          />
        );
      case 'recent_chats':
        return (
          <RecentChatsWidget
            locale={locale}
            onTap={handleOpenDrawer}
          />
        );
      case 'custom_slot':
        return <CustomSlotWidget locale={locale} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={backgroundStyle}
      className="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden text-[var(--uphone-text)] transition-[background] duration-300"
    >
      <HomeTopHeader
        locale={locale}
        resolvedTheme={resolvedTheme}
        onOpenDrawer={handleOpenDrawer}
        onOpenBackgroundPicker={() => setBgModalOpen(true)}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto w-full max-w-[680px] flex-1 px-4 pt-2 pb-10 sm:px-6 sm:pt-4 sm:pb-12">
        <motion.section
          aria-label={isZh ? '桌面小组件区域' : 'Desktop Widgets'}
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 gap-3 sm:gap-4"
        >
          {visibleWidgets.map((widget) => (
            <div key={widget.id} className={SIZE_SPAN_CLASSES[widget.size]}>
              {renderWidget(widget)}
            </div>
          ))}
        </motion.section>
      </main>

      <BackgroundPickerModal
        open={bgModalOpen}
        onClose={() => setBgModalOpen(false)}
        locale={locale}
        value={background}
        onChange={handleBackgroundChange}
        onToggleLocale={toggleLocale}
      />
    </div>
  );
}
