// 主题系统：浅色 / 深色 / 跟随系统
// 所有组件通过 useTheme() 获取当前色板，样式用 createStyles(colors) 函数化
import { useColorScheme } from 'react-native';
import { useSettingsStore } from './store/settings-store';

export type ThemeMode = 'light' | 'dark' | 'system';

/** 色板结构 */
export interface Palette {
  accent: string;
  accentLight: string;
  bg: string;
  bgSubtle: string;
  bgMuted: string;
  border: string;
  borderDark: string;
  text: string;
  textSecondary: string;
  textLight: string;
  danger: string;
  success: string;
  warning: string;
  infoBg: string;
  dangerBg: string;
  successBg: string;
  tagAiBg: string;
  tagAiText: string;
  tagEditedBg: string;
  tagEditedText: string;
  tagNewsBg: string;
  tagNewsBorder: string;
  tagNewsText: string;
  tagNovelBg: string;
  tagNovelBorder: string;
  tagNovelText: string;
}

/** 浅色色板（对齐网站扁平化设计：无圆角） */
export const LIGHT_PALETTE: Palette = {
  accent: '#2c3e50',
  accentLight: '#5d9ccc',
  bg: '#ffffff',
  bgSubtle: '#fafafa',
  bgMuted: '#f5f5f5',
  border: '#e0e0e0',
  borderDark: '#cccccc',
  text: '#1a1a1a',
  textSecondary: '#555555',
  textLight: '#888888',
  danger: '#c0392b',
  success: '#27ae60',
  warning: '#b8860b',
  infoBg: '#f0f7fd',
  dangerBg: '#fdf2f2',
  successBg: '#f0faf3',
  tagAiBg: '#fff8e6',
  tagAiText: '#b8860b',
  tagEditedBg: '#fce4ec',
  tagEditedText: '#c62828',
  tagNewsBg: 'rgba(41,128,185,0.14)',
  tagNewsBorder: '#a8cfeb',
  tagNewsText: '#2980b9',
  tagNovelBg: '#f3e8fd',
  tagNovelBorder: '#d7b8ec',
  tagNovelText: '#7d3c98',
} as const;

/** 深色色板 */
export const DARK_PALETTE: Palette = {
  accent: '#5d9ccc',
  accentLight: '#7fb3e0',
  bg: '#1c1f24',
  bgSubtle: '#16181c',
  bgMuted: '#21252b',
  border: '#2e333a',
  borderDark: '#3a4048',
  text: '#e8eaed',
  textSecondary: '#b0b6bf',
  textLight: '#7d8590',
  danger: '#e57373',
  success: '#58c98c',
  warning: '#d4a94f',
  infoBg: '#1d2a38',
  dangerBg: '#33211f',
  successBg: '#1c2f22',
  tagAiBg: '#3a3320',
  tagAiText: '#e3c56d',
  tagEditedBg: '#3a2328',
  tagEditedText: '#e59aa8',
  tagNewsBg: 'rgba(93,156,204,0.22)',
  tagNewsBorder: '#5d9ccc',
  tagNewsText: '#8ab4d8',
  tagNovelBg: 'rgba(178,140,220,0.22)',
  tagNovelBorder: '#8e6bb3',
  tagNovelText: '#c9a7e0',
};

/**
 * 当前主题色板 hook。
 * themeMode 为 'system' 时跟随系统外观（useColorScheme）。
 */
export function useTheme(): { isDark: boolean; colors: Palette } {
  const mode = useSettingsStore((s) => s.themeMode);
  const system = useColorScheme();
  const isDark = mode === 'dark' || (mode === 'system' && system === 'dark');
  return { isDark, colors: isDark ? DARK_PALETTE : LIGHT_PALETTE };
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const FONT = {
  size: 15,
  lineHeight: 22,
  mono: 'monospace',
} as const;
