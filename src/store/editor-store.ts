// 内容编辑器状态（文件路径 + 内容 + 版本 sha + 文章元数据 / 页面正文），供编辑器页面使用
// 两类 HTML 都支持撰写式（Markdown）正文编辑：
// - isArticle：library 下的 App 文章页（article-meta + page-title-main），可编辑元数据 + 正文
// - isPage：其他页面（入口页、说明页、知识馆页、主页板块等），可编辑正文容器 + 页面主标题
import { create } from 'zustand';
import type { ArticleFormData, ArticleType } from '../types';
import {
  extractBodyHtml,
  getPageTitle,
  isArticleHtml,
  isPageHtml,
  markdownToBodyHtml,
  parseArticleMetadata,
  replaceBodyHtml,
  updatePageTitle,
} from '../lib/article-parser';
import { htmlToMarkdown } from '../lib/html-to-markdown';

export interface EditorState {
  /** 正在编辑的文件路径（新建时为空字符串） */
  path: string;
  /** 文件显示名 */
  name: string;
  /** 文件原始内容（保存时作为基准） */
  originalContent: string;
  /** 当前编辑内容（源码编辑器中的 HTML/文本） */
  content: string;
  /** 文件的 sha（更新已存在文件时需要） */
  sha: string | null;
  /** 是否新建文件 */
  isNew: boolean;
  /** 源码是否已修改（相对原始内容） */
  dirty: boolean;

  /** 是否为 App 生成的文章 HTML（可使用元数据表单编辑） */
  isArticle: boolean;
  /** 是否为「其他页面」的内容 HTML（无元数据表单，但支持正文与页面标题编辑） */
  isPage: boolean;
  /** 是否支持撰写式正文编辑（文章页或内容页面） */
  canEditBody: boolean;
  /** 页面主标题（page-title-main 内容；无该容器时为 null） */
  pageTitle: string | null;
  /** 解析出的文章元数据（仅 isArticle 时有值） */
  metadata: ArticleFormData | null;
  /** 元数据是否已修改 */
  metadataDirty: boolean;
  /** 正文区段 HTML（left-align 内部；无正文区段或非文章时为 null） */
  bodyHtml: string | null;
  /** 正文区段的 Markdown 还原（撰写式编辑用；转换失败或非文章时为 null） */
  bodyMarkdown: string | null;
  /** 正文 Markdown 是否已修改（相对 load 时的还原值） */
  bodyDirty: boolean;
  /** 正文 Markdown 是否过期（源码标签页编辑后未重新还原；切回正文页时惰性刷新，避免每击键跑一次转换） */
  bodyStale: boolean;

  /** 各标签页锁定状态（true = 只读防误触，与撰写页锁一致） */
  locked: { meta: boolean; body: boolean; source: boolean };

  /** 加载文件进入编辑器（自动检测文章 HTML / 内容页面 HTML 并解析可编辑区段） */
  load: (path: string, content: string, sha?: string | null, name?: string) => void;
  /** 新建文件模式 */
  loadNew: () => void;
  /** 更新源码内容 */
  setContent: (content: string) => void;
  /** 惰性刷新正文 Markdown（从当前正文 HTML 重新还原，清除过期标记） */
  refreshBodyMarkdown: () => void;
  /** 更新正文区段 HTML（同步写回完整文件内容） */
  setBodyHtml: (bodyHtml: string) => void;
  /** 更新正文 Markdown（撰写式编辑；渲染为 HTML 并写回完整文件内容） */
  setBodyMarkdown: (markdown: string) => void;
  /** 更新页面主标题（内容页面模式；写回 page-title-main 容器） */
  setPageTitle: (title: string) => void;
  /** 更新元数据字段 */
  setMetadata: <K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) => void;
  /** 切换标签（元数据表单用） */
  toggleMetaTag: (tag: string) => void;
  /** 设置文章性质 */
  setMetaArticleType: (t: ArticleType) => void;
  /** 切换某个标签页的锁定状态（防误触） */
  toggleLock: (tab: 'meta' | 'body' | 'source') => void;
  /** 保存成功后的同步 */
  markSaved: (path: string, sha: string | null) => void;
}

/** 由内容重新推导可编辑状态（load / markSaved 共用） */
function deriveEditable(path: string, content: string) {
  // en/ 英文版文章由网站同步生成，元数据结构为英文标签，不做表单编辑（避免误改英文版）；
  // 但正文容器仍可编辑
  const article = !path.startsWith('en/') && isArticleHtml(content) ? parseArticleMetadata(content, path) : null;
  const isPage = !article && isPageHtml(content);
  const canEditBody = !!article || isPage;
  const bodyHtml = canEditBody ? extractBodyHtml(content, !!article) : null;
  return {
    isArticle: !!article,
    isPage,
    canEditBody,
    pageTitle: canEditBody && !article ? getPageTitle(content) : null,
    metadata: article,
    bodyHtml,
    bodyMarkdown: bodyHtml !== null ? htmlToMarkdown(bodyHtml) : null,
  };
}

export const useEditorStore = create<EditorState>((set) => ({
  path: '',
  name: '',
  originalContent: '',
  content: '',
  sha: null,
  isNew: false,
  dirty: false,
  isArticle: false,
  isPage: false,
  canEditBody: false,
  pageTitle: null,
  metadata: null,
  metadataDirty: false,
  bodyHtml: null,
  bodyMarkdown: null,
  bodyDirty: false,
  bodyStale: false,
  locked: { meta: false, body: false, source: false },

  load: (path, content, sha = null, name) => {
    const derived = deriveEditable(path, content);
    set({
      path,
      name: name ?? path.split('/').pop() ?? '',
      originalContent: content,
      content,
      sha,
      isNew: false,
      dirty: false,
      metadataDirty: false,
      bodyDirty: false,
      bodyStale: false,
      locked: { meta: false, body: false, source: false },
      ...derived,
    });
  },

  loadNew: () =>
    set({
      path: '',
      name: '',
      originalContent: '',
      content: '',
      sha: null,
      isNew: true,
      dirty: false,
      isArticle: false,
      isPage: false,
      canEditBody: false,
      pageTitle: null,
      metadata: null,
      metadataDirty: false,
      bodyHtml: null,
      bodyMarkdown: null,
      bodyDirty: false,
      bodyStale: false,
      locked: { meta: false, body: false, source: false },
    }),

  setContent: (content) =>
    set((state) => {
      // 源码可能修改了正文区段：同步重新提取（廉价字符串操作），并标记 Markdown 过期。
      // 不在每次击键都跑 HTML → Markdown 还原（大正文会卡输入），切回「正文」标签页时
      // 由 refreshBodyMarkdown 惰性刷新，保证正文页与源码页一致（避免旧 Markdown 覆盖源码编辑）
      const bodyHtml = state.canEditBody ? extractBodyHtml(content, state.isArticle) : null;
      return {
        content,
        bodyHtml,
        bodyStale: state.canEditBody,
        bodyMarkdown: state.canEditBody && bodyHtml === null ? null : state.bodyMarkdown,
        pageTitle: state.isPage ? getPageTitle(content) : state.pageTitle,
        dirty: content !== state.originalContent,
      };
    }),

  refreshBodyMarkdown: () =>
    set((state) => {
      if (!state.canEditBody || !state.bodyStale) return {};
      const bodyMarkdown = state.bodyHtml !== null ? htmlToMarkdown(state.bodyHtml) : null;
      return { bodyMarkdown, bodyStale: false };
    }),

  setBodyHtml: (bodyHtml) =>
    set((state) => {
      if (!state.canEditBody) return {};
      const content = replaceBodyHtml(state.content, bodyHtml, state.isArticle);
      return {
        bodyHtml,
        content,
        dirty: content !== state.originalContent,
      };
    }),

  setBodyMarkdown: (markdown) =>
    set((state) => {
      if (!state.canEditBody) return {};
      const bodyHtml = markdownToBodyHtml(markdown, state.metadata?.footnotes ?? []);
      const content = replaceBodyHtml(state.content, bodyHtml, state.isArticle);
      return {
        bodyMarkdown: markdown,
        bodyHtml,
        content,
        dirty: content !== state.originalContent,
        bodyDirty: true,
        bodyStale: false,
      };
    }),

  setPageTitle: (title) =>
    set((state) => {
      if (state.pageTitle === null) return {};
      const content = updatePageTitle(state.content, title);
      return {
        pageTitle: title,
        content,
        dirty: content !== state.originalContent,
      };
    }),

  setMetadata: (key, value) =>
    set((state) => {
      if (!state.metadata) return {};
      return {
        metadata: { ...state.metadata, [key]: value },
        metadataDirty: true,
      };
    }),

  toggleMetaTag: (tag) =>
    set((state) => {
      if (!state.metadata) return {};
      const tags = [...state.metadata.tags];
      const idx = tags.indexOf(tag);
      if (idx >= 0) tags.splice(idx, 1);
      else tags.push(tag);
      return {
        metadata: { ...state.metadata, tags },
        metadataDirty: true,
      };
    }),

  setMetaArticleType: (t) =>
    set((state) => {
      if (!state.metadata) return {};
      return {
        metadata: { ...state.metadata, articleType: t },
        metadataDirty: true,
      };
    }),

  toggleLock: (tab) =>
    set((state) => ({
      locked: { ...state.locked, [tab]: !state.locked[tab] },
    })),

  markSaved: (path, sha) =>
    set((state) => {
      const derived = deriveEditable(path, state.content);
      return {
        path,
        name: state.name || path.split('/').pop() || '',
        originalContent: state.content,
        sha,
        isNew: false,
        dirty: false,
        metadataDirty: false,
        bodyDirty: false,
        bodyStale: false,
        // 保存后重新以当前正文为基准还原 Markdown（保留撰写式编辑一致性）
        ...derived,
      };
    }),
}));
