// 站点可配置选项（文章分类 / 标签 / 上传目录）
// 配置文件 slywrite-config.json 存放于网站仓库根目录，App 负责读写；
// 文件只存「用户自定义项」，内置项（ARTICLE_CATEGORIES / DEFAULT_TAGS / DEFAULT_UPLOAD_DIRS）始终存在
import { getFile } from './github-client';

/** 上传目录选项 */
export interface UploadDir {
  label: string;
  value: string;
}

/** 配置文件在仓库中的路径（网站仓库根目录） */
export const SITE_CONFIG_PATH = 'slywrite-config.json';

/** 内置标签（不可删除；「无」为特殊占位） */
export const DEFAULT_TAGS: string[] = ['新闻', '小说', '包含AI', '有删减', '无'];

/** 内置上传目录（不可删除） */
export const DEFAULT_UPLOAD_DIRS: UploadDir[] = [
  { label: 'image/poster/ 海报', value: 'image/poster/' },
  { label: 'image/ 根目录', value: 'image/' },
  { label: 'docs/paper-figures/ 论文配图', value: 'docs/paper-figures/' },
];

/** 用户自定义项（与仓库配置文件结构一致） */
export interface SiteConfigCustom {
  categories: { key: string; label: string; dir: string; anchor: string; enAnchor: string }[];
  tags: string[];
  uploadDirs: UploadDir[];
}

export const EMPTY_CUSTOM: SiteConfigCustom = { categories: [], tags: [], uploadDirs: [] };

/** 从仓库加载配置文件；文件不存在或解析失败时返回空自定义项 */
export async function loadSiteConfig(): Promise<SiteConfigCustom> {
  try {
    const { content } = await getFile(SITE_CONFIG_PATH);
    const parsed = JSON.parse(content) as Partial<SiteConfigCustom>;
    return {
      categories: Array.isArray(parsed?.categories) ? parsed.categories : [],
      tags: Array.isArray(parsed?.tags) ? parsed.tags.filter((t) => typeof t === 'string') : [],
      uploadDirs: Array.isArray(parsed?.uploadDirs) ? parsed.uploadDirs : [],
    };
  } catch {
    return { ...EMPTY_CUSTOM };
  }
}

/** 将中文/任意标签转成安全目录名（kebab-case）；无法转英文时返回 fallback */
export function slugifyDir(label: string, fallback: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}
