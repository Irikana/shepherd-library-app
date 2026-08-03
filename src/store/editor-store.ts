// 内容编辑器状态（文件路径 + 内容 + 版本 sha + 文章元数据），供编辑器页面使用
import { create } from 'zustand';
import type { ArticleFormData, ArticleType } from '../types';
import {
  extractBodyHtml,
  isArticleHtml,
  markdownToBodyHtml,
  parseArticleMetadata,
  replaceBodyHtml,
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

  /** 各标签页锁定状态（true = 只读防误触，与撰写页锁一致） */
  locked: { meta: boolean; body: boolean; source: boolean };

  /** 加载文件进入编辑器（自动检测文章 HTML 并解析元数据） */
  load: (path: string, content: string, sha?: string | null, name?: string) => void;
  /** 新建文件模式 */
  loadNew: () => void;
  /** 更新源码内容 */
  setContent: (content: string) => void;
  /** 更新正文区段 HTML（同步写回完整文件内容） */
  setBodyHtml: (bodyHtml: string) => void;
  /** 更新正文 Markdown（撰写式编辑；渲染为 HTML 并写回完整文件内容） */
  setBodyMarkdown: (markdown: string) => void;
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

export const useEditorStore = create<EditorState>((set) => ({
  path: '',
  name: '',
  originalContent: '',
  content: '',
  sha: null,
  isNew: false,
  dirty: false,
  isArticle: false,
  metadata: null,
  metadataDirty: false,
  bodyHtml: null,
  bodyMarkdown: null,
  bodyDirty: false,
  locked: { meta: false, body: false, source: false },

  load: (path, content, sha = null, name) => {
    // 检测是否为文章 HTML，如果是则解析元数据
    // en/ 英文版文章由网站同步生成，元数据结构为英文标签，不做表单编辑（避免误改英文版）
    const article = !path.startsWith('en/') && isArticleHtml(content) ? parseArticleMetadata(content, path) : null;
    const bodyHtml = article ? extractBodyHtml(content) : null;
    set({
      path,
      name: name ?? path.split('/').pop() ?? '',
      originalContent: content,
      content,
      sha,
      isNew: false,
      dirty: false,
      isArticle: !!article,
      metadata: article,
      metadataDirty: false,
      bodyHtml,
      bodyMarkdown: bodyHtml ? htmlToMarkdown(bodyHtml) : null,
      bodyDirty: false,
      locked: { meta: false, body: false, source: false },
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
      metadata: null,
      metadataDirty: false,
      bodyHtml: null,
      bodyMarkdown: null,
      bodyDirty: false,
      locked: { meta: false, body: false, source: false },
    }),

  setContent: (content) =>
    set((state) => ({
      content,
      // 源码可能修改了正文区段，同步重新提取，保证「正文」标签页与「源码」标签页内容一致
      bodyHtml: state.isArticle ? extractBodyHtml(content) : null,
      dirty: content !== state.originalContent,
    })),

  setBodyHtml: (bodyHtml) =>
    set((state) => {
      if (!state.isArticle) return {};
      const content = replaceBodyHtml(state.content, bodyHtml);
      return {
        bodyHtml,
        content,
        dirty: content !== state.originalContent,
      };
    }),

  setBodyMarkdown: (markdown) =>
    set((state) => {
      if (!state.isArticle || !state.metadata) return {};
      const bodyHtml = markdownToBodyHtml(markdown, state.metadata.footnotes);
      const content = replaceBodyHtml(state.content, bodyHtml);
      return {
        bodyMarkdown: markdown,
        bodyHtml,
        content,
        dirty: content !== state.originalContent,
        bodyDirty: true,
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
    set((state) => ({
      path,
      name: state.name || path.split('/').pop() || '',
      originalContent: state.content,
      sha,
      isNew: false,
      dirty: false,
      metadataDirty: false,
      bodyHtml: state.isArticle ? extractBodyHtml(state.content) : null,
      // 保存后重新以当前正文为基准还原 Markdown（保留撰写式编辑一致性）
      bodyMarkdown: state.isArticle && state.bodyHtml ? htmlToMarkdown(state.bodyHtml) : null,
      bodyDirty: false,
    })),
}));
