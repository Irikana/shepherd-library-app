// 站点可配置选项（文章分类 / 标签与标签颜色 / 上传目录 / 网站联系方式）
// 配置文件 slywrite-config.json 存放于网站仓库根目录，App 负责读写；
// 文件只存「用户自定义项」，内置项（ARTICLE_CATEGORIES / DEFAULT_TAGS / DEFAULT_UPLOAD_DIRS）始终存在
import { getFile } from './github-client';
import { normalizeTagColors, type TagColorMap } from './tag-colors';

/** 上传目录选项 */
export interface UploadDir {
  label: string;
  value: string;
}

/** 配置文件在仓库中的路径（网站仓库根目录） */
export const SITE_CONFIG_PATH = 'slywrite-config.json';

/** 内置标签（不可删除；无标签时页面直接显示"无"字，不占用标签位） */
export const DEFAULT_TAGS: string[] = ['新闻', '小说', '包含AI', '有删减'];

/** 内置上传目录（不可删除） */
export const DEFAULT_UPLOAD_DIRS: UploadDir[] = [
  { label: 'image/poster/ 海报', value: 'image/poster/' },
  { label: 'image/ 根目录', value: 'image/' },
  { label: 'docs/paper-figures/ 论文配图', value: 'docs/paper-figures/' },
];

/**
 * 联系方式条目（网站冻结顶栏「联系」下拉菜单的数据源，作者可在 App 设置页编辑）。
 * value 与 url 均可留空——留空时网站只显示标签名，不显示可复制值 / 不生成链接。
 */
export interface ContactChannel {
  /** 渠道标识（决定网站图标形状：qq / wechat / facebook / mail / link） */
  key: string;
  /** 显示名（如「QQ」「微信」「FaceBook」） */
  label: string;
  /** 展示值（号码 / 微信号 / 昵称），作者自行填写；网站点击可复制 */
  value: string;
  /** 可点击链接（如 Facebook 主页），留空则不生成链接 */
  url: string;
  /** 备注（如「加好友请注明来意」） */
  note: string;
}

/** 默认联系渠道（值一律留空，由作者在 App 中填写，不代为编造个人信息） */
export const DEFAULT_CONTACT_CHANNELS: ContactChannel[] = [
  { key: 'qq', label: 'QQ', value: '', url: '', note: '' },
  { key: 'wechat', label: '微信', value: '', url: '', note: '' },
  { key: 'facebook', label: 'FaceBook', value: '', url: '', note: '' },
];

/** 上传目录选项规范化：补齐缺失字段，丢弃结构非法项 */
export function normalizeContact(raw: unknown): ContactChannel[] {
  const list = Array.isArray(raw) ? raw : [];
  const out: ContactChannel[] = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const it = item as Partial<ContactChannel>;
    const key = typeof it.key === 'string' ? it.key.trim() : '';
    if (!key) continue;
    out.push({
      key,
      label: typeof it.label === 'string' ? it.label : key,
      value: typeof it.value === 'string' ? it.value : '',
      url: typeof it.url === 'string' ? it.url : '',
      note: typeof it.note === 'string' ? it.note : '',
    });
  }
  return out;
}

/** 用户自定义项（与仓库配置文件结构一致） */
export interface SiteConfigCustom {
  categories: { key: string; label: string; dir: string; anchor: string; enAnchor: string }[];
  tags: string[];
  /** 标签颜色（标签名 → #rrggbb；未列出的标签跟随 App/站点主题默认色） */
  tagColors: TagColorMap;
  uploadDirs: UploadDir[];
  /** 网站联系方式（冻结顶栏「联系」下拉菜单数据源） */
  contact: ContactChannel[];
}

export const EMPTY_CUSTOM: SiteConfigCustom = {
  categories: [],
  tags: [],
  tagColors: {},
  uploadDirs: [],
  contact: [],
};

/** 从仓库加载配置文件；文件不存在或解析失败时返回空自定义项 */
export async function loadSiteConfig(): Promise<SiteConfigCustom> {
  try {
    const { content } = await getFile(SITE_CONFIG_PATH);
    return parseSiteConfig(content);
  } catch {
    return { ...EMPTY_CUSTOM };
  }
}

/** 解析配置文件内容（结构容错：旧文件没有 tagColors / contact 字段时按默认处理） */
export function parseSiteConfig(content: string): SiteConfigCustom {
  const parsed = JSON.parse(content) as Partial<SiteConfigCustom>;
  return {
    categories: Array.isArray(parsed?.categories) ? parsed.categories : [],
    tags: Array.isArray(parsed?.tags) ? parsed.tags.filter((t) => typeof t === 'string') : [],
    tagColors: normalizeTagColors(parsed?.tagColors),
    uploadDirs: Array.isArray(parsed?.uploadDirs) ? parsed.uploadDirs : [],
    contact: normalizeContact(parsed?.contact),
  };
}


/** 将中文/任意标签转成安全目录名（kebab-case）；无法转英文时返回 fallback */
export function slugifyDir(label: string, fallback: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}
