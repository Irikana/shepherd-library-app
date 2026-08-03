// 站点配置状态：文章分类 / 标签 / 上传目录 的自定义管理
// 数据源：仓库根目录 slywrite-config.json（真正意义上的创建，App 与网站共享）；
// 本地 AsyncStorage 缓存保证离线可用；修改后自动同步回仓库
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFile, putFile } from '../lib/github-client';
import { ARTICLE_CATEGORIES, insertCategorySection, removeCategorySection, type ArticleCategory } from '../lib/article-sync';
import {
  DEFAULT_TAGS,
  DEFAULT_UPLOAD_DIRS,
  EMPTY_CUSTOM,
  SITE_CONFIG_PATH,
  slugifyDir,
  type SiteConfigCustom,
  type UploadDir,
} from '../lib/site-config';

const CACHE_KEY = 'slywrite-site-config';

/** 自定义分类输入（设置页创建时使用） */
export interface NewCategoryInput {
  label: string; // 中文显示名（页面标题/锚点）
  enLabel: string; // 英文显示名（英文版锚点）
  dir: string; // 仓库目录（kebab-case，相对 library/）
}

interface ConfigState {
  /** 合并后的分类（内置 + 自定义） */
  categories: ArticleCategory[];
  /** 合并后的标签（内置 + 自定义） */
  tags: string[];
  /** 合并后的上传目录（内置 + 自定义） */
  uploadDirs: UploadDir[];
  /** 自定义项（与仓库配置一致） */
  custom: SiteConfigCustom;
  /** 仓库配置文件 sha（更新用） */
  sha: string | null;
  loaded: boolean;
  /** 是否正在同步仓库 */
  saving: boolean;
  syncError: string | null;

  load: () => Promise<void>;
  /** 将自定义配置写回仓库（PUT，带 sha 冲突保护） */
  persist: (next: SiteConfigCustom) => Promise<{ ok: boolean; error?: string }>;
  /** 读取中英文 library.html 并应用分类章节操作（best-effort） */
  applyCategorySections: (
    category: ArticleCategory,
    action: 'insert' | 'remove',
  ) => Promise<string[]>;
  /** 创建自定义分类（同步写入仓库配置文件 + library.html 中英文版章节） */
  addCategory: (input: NewCategoryInput) => Promise<{ ok: boolean; error?: string }>;
  removeCategory: (key: string) => Promise<{ ok: boolean; error?: string }>;
  addTag: (name: string) => Promise<{ ok: boolean; error?: string }>;
  removeTag: (name: string) => Promise<{ ok: boolean; error?: string }>;
  addUploadDir: (label: string, value: string) => Promise<{ ok: boolean; error?: string }>;
  removeUploadDir: (value: string) => Promise<{ ok: boolean; error?: string }>;
}

function mergeCategories(custom: ArticleCategory[]): ArticleCategory[] {
  const merged = [...ARTICLE_CATEGORIES];
  for (const c of custom) {
    if (!merged.some((b) => b.key === c.key)) merged.push(c);
  }
  return merged;
}

function mergeTags(custom: string[]): string[] {
  // 过滤历史遗留的「无」标签（0.0.12 起「无」不再是标签，无标签时页面直接显示"无"字）
  const cleaned = custom.filter((t) => t !== '无');
  return [...DEFAULT_TAGS, ...cleaned.filter((t) => !DEFAULT_TAGS.includes(t))];
}

function mergeUploadDirs(custom: UploadDir[]): UploadDir[] {
  return [
    ...DEFAULT_UPLOAD_DIRS,
    ...custom.filter((d) => !DEFAULT_UPLOAD_DIRS.some((b) => b.value === d.value)),
  ];
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  categories: ARTICLE_CATEGORIES,
  tags: DEFAULT_TAGS,
  uploadDirs: DEFAULT_UPLOAD_DIRS,
  custom: { ...EMPTY_CUSTOM, categories: [], tags: [], uploadDirs: [] },
  sha: null,
  loaded: false,
  saving: false,
  syncError: null,

  load: async () => {
    // 仓库配置优先，失败（离线/404）回退本地缓存
    try {
      const { content, sha } = await getFile(SITE_CONFIG_PATH);
      const parsed = JSON.parse(content) as Partial<SiteConfigCustom>;
      const custom: SiteConfigCustom = {
        categories: Array.isArray(parsed?.categories) ? parsed.categories : [],
        tags: Array.isArray(parsed?.tags) ? parsed.tags.filter((t) => typeof t === 'string') : [],
        uploadDirs: Array.isArray(parsed?.uploadDirs) ? parsed.uploadDirs : [],
      };
      set({
        custom,
        sha,
        categories: mergeCategories(custom.categories),
        tags: mergeTags(custom.tags),
        uploadDirs: mergeUploadDirs(custom.uploadDirs),
        loaded: true,
        syncError: null,
      });
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(custom)).catch(() => {});
      return;
    } catch {
      // 回退缓存
    }
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      const custom = raw ? (JSON.parse(raw) as SiteConfigCustom) : { ...EMPTY_CUSTOM, categories: [], tags: [], uploadDirs: [] };
      set({
        custom,
        categories: mergeCategories(custom.categories ?? []),
        tags: mergeTags(custom.tags ?? []),
        uploadDirs: mergeUploadDirs(custom.uploadDirs ?? []),
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  /** 将自定义配置写回仓库（PUT，带 sha 冲突保护） */
  persist: async (next: SiteConfigCustom): Promise<{ ok: boolean; error?: string }> => {
    const { sha } = get();
    set({ saving: true, syncError: null });
    try {
      // 先拉最新 sha，避免覆盖他人改动
      let currentSha = sha;
      try {
        const fresh = await getFile(SITE_CONFIG_PATH);
        currentSha = fresh.sha;
      } catch {
        currentSha = null; // 仓库还没有配置文件（新建）
      }
      await putFile(SITE_CONFIG_PATH, JSON.stringify(next, null, 2), {
        sha: currentSha ?? undefined,
        message: '站点自定义配置更新（移动端 App）',
      });
      set({ custom: next, sha: currentSha, saving: false });
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next)).catch(() => {});
      return { ok: true };
    } catch (err) {
      set({ saving: false, syncError: (err as Error).message });
      return { ok: false, error: (err as Error).message };
    }
  },

  /** 读取中英文 library.html 并应用章节操作（best-effort，任一失败不阻塞整体） */
  applyCategorySections: async (
    category: ArticleCategory,
    action: 'insert' | 'remove',
  ): Promise<string[]> => {
    const messages: string[] = [];
    const files = [
      { path: 'library/library.html', english: false, fileLabel: 'library.html' },
      { path: 'en/library/library.html', english: true, fileLabel: 'en/library.html' },
    ];
    for (const f of files) {
      try {
        const { content, sha } = await getFile(f.path);
        const updated =
          action === 'insert'
            ? insertCategorySection(content, category, f.english)
            : removeCategorySection(content, category, f.english);
        if (updated !== content) {
          await putFile(f.path, updated, {
            sha,
            message: `自定义分类${action === 'insert' ? '创建' : '移除'}：${category.label}（移动端 App）`,
          });
          messages.push(`${f.fileLabel} 已${action === 'insert' ? '添加' : '移除'}分类章节`);
        }
      } catch {
        messages.push(`${f.fileLabel} 同步失败（可手动维护）`);
      }
    }
    return messages;
  },

  addCategory: async (input: NewCategoryInput) => {
    const label = input.label.trim();
    if (!label) return { ok: false, error: '分类名称不能为空' };
    const key = `custom-${Date.now().toString(36)}`;
    const dir = slugifyDir(input.dir.trim() || label, key);
    const category: ArticleCategory = {
      key,
      label,
      dir,
      anchor: label,
      enAnchor: input.enLabel.trim() || label,
    };
    const next: SiteConfigCustom = {
      ...get().custom,
      categories: [...get().custom.categories, category],
    };
    // 先同步仓库配置文件
    const persisted = await get().persist(next);
    if (!persisted.ok) return persisted;
    // 再同步 library.html 章节（失败不撤销配置文件，提示用户）
    await get().applyCategorySections(category, 'insert');
    set({
      custom: next,
      categories: mergeCategories(next.categories),
    });
    return { ok: true };
  },

  removeCategory: async (key: string) => {
    const target = get().custom.categories.find((c) => c.key === key);
    if (!target) return { ok: false, error: '未找到该自定义分类' };
    const next: SiteConfigCustom = {
      ...get().custom,
      categories: get().custom.categories.filter((c) => c.key !== key),
    };
    const persisted = await get().persist(next);
    if (!persisted.ok) return persisted;
    await get().applyCategorySections(target, 'remove');
    set({
      custom: next,
      categories: mergeCategories(next.categories),
    });
    return { ok: true };
  },

  addTag: async (name: string) => {
    const n = name.trim();
    if (!n) return { ok: false, error: '标签名称不能为空' };
    if (get().tags.includes(n)) return { ok: false, error: '该标签已存在' };
    const next: SiteConfigCustom = { ...get().custom, tags: [...get().custom.tags, n] };
    const persisted = await get().persist(next);
    if (!persisted.ok) return persisted;
    set({ custom: next, tags: mergeTags(next.tags) });
    return { ok: true };
  },

  removeTag: async (name: string) => {
    if (DEFAULT_TAGS.includes(name)) return { ok: false, error: '内置标签不可删除' };
    const next: SiteConfigCustom = { ...get().custom, tags: get().custom.tags.filter((t) => t !== name) };
    const persisted = await get().persist(next);
    if (!persisted.ok) return persisted;
    set({ custom: next, tags: mergeTags(next.tags) });
    return { ok: true };
  },

  addUploadDir: async (label: string, value: string) => {
    const l = label.trim();
    const v = value.trim();
    if (!l || !v) return { ok: false, error: '目录名称与路径都不能为空' };
    if (!/^[a-z0-9][a-z0-9/_-]*\/?$/i.test(v)) {
      return { ok: false, error: '目录路径只允许英文、数字、/、_、-，且以 / 结尾' };
    }
    const dirValue = v.endsWith('/') ? v : `${v}/`;
    if (get().uploadDirs.some((d) => d.value === dirValue)) {
      return { ok: false, error: '该目录已存在' };
    }
    const next: SiteConfigCustom = {
      ...get().custom,
      uploadDirs: [...get().custom.uploadDirs, { label: l, value: dirValue }],
    };
    const persisted = await get().persist(next);
    if (!persisted.ok) return persisted;
    set({ custom: next, uploadDirs: mergeUploadDirs(next.uploadDirs) });
    return { ok: true };
  },

  removeUploadDir: async (value: string) => {
    if (DEFAULT_UPLOAD_DIRS.some((d) => d.value === value)) {
      return { ok: false, error: '内置目录不可删除' };
    }
    const next: SiteConfigCustom = {
      ...get().custom,
      uploadDirs: get().custom.uploadDirs.filter((d) => d.value !== value),
    };
    const persisted = await get().persist(next);
    if (!persisted.ok) return persisted;
    set({ custom: next, uploadDirs: mergeUploadDirs(next.uploadDirs) });
    return { ok: true };
  },
}));
