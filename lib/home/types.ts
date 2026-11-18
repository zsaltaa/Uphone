export type DesktopWidgetType =
  | 'clock'
  | 'weather'
  | 'quote'
  | 'date'
  | 'note'
  | 'recent_chats'
  | 'custom_slot';

export type DesktopWidgetSize = 'sm' | 'md' | 'lg';

export interface DesktopWidgetConfig {
  id: string;
  type: DesktopWidgetType;
  size: DesktopWidgetSize;
  order: number;
  isVisible: boolean;
}

export interface QuoteItem {
  id: string;
  textZh: string;
  textEn: string;
  author: string;
}

export interface WeatherData {
  configured: false;
  providerName?: string;
}

export interface NoteState {
  id: string;
  content: string;
  updatedAt: number;
}

export type HomeBackgroundPresetId = 'default' | 'mist' | 'dawn' | 'midnight' | 'custom_image';

export interface HomeBackgroundConfig {
  presetId: HomeBackgroundPresetId;
  customImageUrl?: string;
}
