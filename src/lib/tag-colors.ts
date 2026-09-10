// 标签颜色：内置标签默认沿用主题色板；用户为任意标签（内置或自定义）设置的颜色存于站点配置
// slywrite-config.json 的 tagColors（{ 标签名: '#rrggbb' }），随配置同步到网站仓库，App 与站点共享。
// 本模块负责：颜色规范化、可读前景色推导、以及「设置颜色后」的芯片样式与站点 HTML 内联样式生成。

/** 标签名 → 十六进制颜色（#rrggbb） */
export type TagColorMap = Record<string, string>;

/** 一组可直接用于 React Native 的标签芯片样式 */
export interface TagChipStyle {
  borderColor: string;
  backgroundColor: string;
  textColor: string;
}

/** 预设色板（扁平、低饱和，适合做标签底色；与站点主题气质一致） */
export const PRESET_TAG_COLORS: { label: string; value: string }[] = [
  { label: '靛青', value: '#2c3e50' },
  { label: '湖蓝', value: '#2980b9' },
  { label: '天青', value: '#1a7f9c' },
  { label: '森绿', value: '#2e7d53' },
  { label: '橄榄', value: '#6b8e23' },
  { label: '麦金', value: '#b8860b' },
  { label: '陶土', value: '#a5624b' },
  { label: '砖红', value: '#b0493f' },
  { label: '绛紫', value: '#7d3c98' },
  { label: '藕荷', value: '#9b6ea0' },
  { label: '玫红', value: '#c2547d' },
  { label: '落霞', value: '#d2795e' },
  { label: '石墨', value: '#4a4a4a' },
  { label: '灰蓝', value: '#5d7a91' },
  { label: '松墨', value: '#1f4e40' },
  { label: '咖啡', value: '#6f4e37' },
];

/** 校验并规范化颜色输入；非法返回 null。支持 #rgb 与 #rrggbb（大小写均可） */
export function normalizeHex(input: string): string | null {
  const raw = (input ?? '').trim().toLowerCase();
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/.exec(raw);
  if (!m) return null;
  let hex = m[1];
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  return `#${hex}`;
}

/** #rrggbb → [r,g,b]；非法返回 null */
export function hexToRgb(hex: string): [number, number, number] | null {
  const norm = normalizeHex(hex);
  if (!norm) return null;
  const n = parseInt(norm.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** 带透明度的 rgba() 字符串（RN 与 CSS 通用）；非法颜色返回 fallback */
export function rgba(hex: string, alpha: number, fallback = 'transparent'): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return fallback;
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
}

/** 与白色（t=1）或黑色（t=-1）线性混合；t 取 -1..1 */
export function mix(hex: string, t: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const target = t >= 0 ? 255 : 0;
  const k = Math.abs(Math.max(-1, Math.min(1, t)));
  return rgbToHex(rgb[0] + (target - rgb[0]) * k, rgb[1] + (target - rgb[1]) * k, rgb[2] + (target - rgb[2]) * k);
}

/** 相对亮度（0 暗 → 1 亮，WCAG 口径的线性亮度） */
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const lin = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** 在该底色上可读的前景色（纯黑 / 纯白） */
export function readableOn(hex: string): string {
  return luminance(hex) > 0.42 ? '#1a1a1a' : '#ffffff';
}

/**
 * 由用户设置的颜色推导标签芯片样式（浅色主题下用淡底+深字，深色主题下用暗底+亮字）。
 * 颜色非法时返回 null（调用方回落到主题默认色）。
 */
export function tagChipStyle(hex: string | undefined | null, isDark: boolean): TagChipStyle | null {
  const norm = hex ? normalizeHex(hex) : null;
  if (!norm) return null;
  if (isDark) {
    return {
      borderColor: rgba(norm, 0.85),
      backgroundColor: rgba(norm, 0.26),
      textColor: luminance(norm) < 0.45 ? mix(norm, 0.62) : norm,
    };
  }
  return {
    borderColor: rgba(norm, 0.6),
    backgroundColor: rgba(norm, 0.12),
    textColor: luminance(norm) > 0.62 ? mix(norm, -0.5) : norm,
  };
}

/**
 * 站点文章 HTML 中彩色标签的内联样式片段（.article-tag 覆写）。
 * 底色与描边用带透明度的用户色（叠加在页面底色上，浅色/深色主题都成立）；
 * 文字色用 color-mix 与 currentColor 混合——浏览器不支持时该声明自动失效，
 * 回落到站点自身 .article-tag 的主题色，永远不会出现「深色字压深色底」。
 */
export function tagInlineStyleCss(hex: string | undefined | null): string | null {
  const norm = hex ? normalizeHex(hex) : null;
  if (!norm) return null;
  return `border-color:${rgba(norm, 0.55)};background-color:${rgba(norm, 0.16)};color:color-mix(in srgb,${norm} 72%,currentColor)`;
}

/** 归一化配置文件中的 tagColors（丢弃非法项） */
export function normalizeTagColors(raw: unknown): TagColorMap {
  const out: TagColorMap = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [name, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof name !== 'string' || !name) continue;
    const norm = typeof value === 'string' ? normalizeHex(value) : null;
    if (norm) out[name] = norm;
  }
  return out;
}
