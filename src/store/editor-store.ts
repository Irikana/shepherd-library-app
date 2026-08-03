// 内容编辑器状态（文件路径 + 内容 + 版本 sha + 文章元数据），供编辑器页面使用
import { create } from 'zustand';
import type { ArticleFormData, ArticleType } from '../types';
import { isArticleHtml, parseArticleMetadata } from '../lib/article-parser';

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

  /** 加载文件进入编辑器（自动检测文章 HTML 并解析元数据） */
  load: (path: string, content: string, sha?: string | null, name?: string) => void;
  /** 新建文件模式 */
  loadNew: () => void;
  /** 更新源码内容 */
  setContent: (content: string) => void;
  /** 更新元数据字段 */
  setMetadata: <K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) => void;
  /** 切换标签（元数据表单用） */
  toggleMetaTag: (tag: string) => void;
  /** 设置文章性质 */
  setMetaArticleType: (t: ArticleType) => void;
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

  load: (path, content, sha = null, name) => {
    // 检测是否为文章 HTML，如果是则解析元数据
    const article = isArticleHtml(content) ? parseArticleMetadata(content, path) : null;
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
    }),

  setContent: (content) =>
    set((state) => ({
      content,
      dirty: content !== state.originalContent,
    })),

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
      if (tag === '无') {
        return {
          metadata: { ...state.metadata, tags: ['无'] },
          metadataDirty: true,
        };
      }
      const filtered = tags.filter((t) => t !== '无');
      const idx = filtered.indexOf(tag);
      if (idx >= 0) filtered.splice(idx, 1);
      else filtered.push(tag);
      return {
        metadata: { ...state.metadata, tags: filtered.length ? filtered : [] },
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

  markSaved: (path, sha) =>
    set((state) => ({
      path,
      name: state.name || path.split('/').pop() || '',
      originalContent: state.content,
      sha,
      isNew: false,
      dirty: false,
      metadataDirty: false,
    })),
}));
