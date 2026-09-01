// 主题系统：浅色 / 深色 / 跟随系统 / 温和主题（暖米、雾蓝、森绿）
// 所有组件通过 useTheme() 获取当前色板，样式用 createStyles(colors) 函数化
import { useColorScheme } from 'react-native';
import { useSettingsStore } from './store/settings-store';

export type ThemeMode = 'light' | 'dark' | 'system' | 'warm' | 'mist' | 'sage';

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

/** 温和主题 · 暖米（柔和纸感）：低饱和暖白 + 暖棕，温和不刺眼 */
export const WARM_PALETTE: Palette = {
  accent: '#8a6d4b',
  accentLight: '#b08d63',
  bg: '#faf6ee',
  bgSubtle: '#f4eee2',
  bgMuted: '#ece4d4',
  border: '#e0d6c2',
  borderDark: '#cfc1a6',
  text: '#3b3226',
  textSecondary: '#6b5f4d',
  textLight: '#988b73',
  danger: '#b04e3f',
  success: '#4e8d5f',
  warning: '#a5822f',
  infoBg: '#f6f0e3',
  dangerBg: '#f9ece8',
  successBg: '#eef4ec',
  tagAiBg: '#faf0d8',
  tagAiText: '#96742b',
  tagEditedBg: '#f9e4e0',
  tagEditedText: '#a8443a',
  tagNewsBg: 'rgba(138,109,75,0.14)',
  tagNewsBorder: '#c9b294',
  tagNewsText: '#8a6d4b',
  tagNovelBg: '#f1e8f5',
  tagNovelBorder: '#cbb4d6',
  tagNovelText: '#7a5a8a',
};

/** 温和主题 · 雾蓝（静谧灰蓝）：低饱和冷灰蓝，柔和宁静 */
export const MIST_PALETTE: Palette = {
  accent: '#5a7d99',
  accentLight: '#7fa3bf',
  bg: '#f4f7fa',
  bgSubtle: '#edf2f7',
  bgMuted: '#e4ebf2',
  border: '#d3dde8',
  borderDark: '#bfccda',
  text: '#2d3a46',
  textSecondary: '#5a6b7a',
  textLight: '#8b9bab',
  danger: '#b0524d',
  success: '#4f8a72',
  warning: '#a1843c',
  infoBg: '#e8f0f7',
  dangerBg: '#f8ebeb',
  successBg: '#ebf4ef',
  tagAiBg: '#f8f0d9',
  tagAiText: '#96742b',
  tagEditedBg: '#f8e6e6',
  tagEditedText: '#a84848',
  tagNewsBg: 'rgba(90,125,153,0.16)',
  tagNewsBorder: '#aec6da',
  tagNewsText: '#4e718c',
  tagNovelBg: '#efe8f6',
  tagNovelBorder: '#cdbae0',
  tagNovelText: '#76528f',
};

/** 温和主题 · 森绿（淡雅护眼）：低饱和灰绿 + 浅绿背景，清新温和 */
export const SAGE_PALETTE: Palette = {
  accent: '#5c7a5e',
  accentLight: '#7f9d80',
  bg: '#f5f7f2',
  bgSubtle: '#eef2e9',
  bgMuted: '#e5ebdf',
  border: '#d5ddd0',
  borderDark: '#c2cdb8',
  text: '#2e3a2e',
  textSecondary: '#5c6b59',
  textLight: '#8b9884',
  danger: '#ad554c',
  success: '#4f8a63',
  warning: '#a18238',
  infoBg: '#e9f1e7',
  dangerBg: '#f8ece9',
  successBg: '#ecf4ec',
  tagAiBg: '#f8f0d9',
  tagAiText: '#96742b',
  tagEditedBg: '#f8e6e4',
  tagEditedText: '#b0493f',
  tagNewsBg: 'rgba(92,122,94,0.16)',
  tagNewsBorder: '#b5c9b6',
  tagNewsText: '#557456',
  tagNovelBg: '#efe8f6',
  tagNovelBorder: '#cdbae0',
  tagNovelText: '#76528f',
};

/**
 * 当前主题色板 hook。
 * themeMode 为 'system' 时跟随系统外观（useColorScheme）；
 * 温和主题（暖米/雾蓝/森绿）为固定浅色调，不随系统切换。
 */
export function useTheme(): { isDark: boolean; colors: Palette } {
  const mode = useSettingsStore((s) => s.themeMode);
  const system = useColorScheme();
  const colors =
    mode === 'dark' || (mode === 'system' && system === 'dark')
      ? DARK_PALETTE
      : mode === 'warm'
        ? WARM_PALETTE
        : mode === 'mist'
          ? MIST_PALETTE
          : mode === 'sage'
            ? SAGE_PALETTE
            : LIGHT_PALETTE;
  const isDark =
    mode === 'dark' || (mode === 'system' && system === 'dark');
  return { isDark, colors };
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
