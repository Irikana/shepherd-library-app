// 撰写表单状态管理（内存态，跨 compose <-> preview 导航共享）
// 0.0.7：文章与新闻撰写合并为同一入口，新闻 = 文章 + 「在新闻板块展示」选项
import { create } from 'zustand';
import type { ArticleFormData, ArticleType, ComposeKind, NewsKind } from '../types';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const defaultForm: ArticleFormData = {
  title: '',
  titleEn: '',
  author: '薛柯道',
  createDate: today(),
  articleType: '信息文章',
  tags: [],
  recordingDuration: '',
  bodyMarkdown: '',
  footerNote: '',
  footnotes: [],
  includeMathJax: false,
  category: 'normal',
  isNews: false,
  hidden: false,
};

interface ComposeState {
  form: ArticleFormData;
  /** 当前草稿 id（用于自动保存/恢复），null 表示无草稿上下文 */
  draftId: string | null;
  /** 当前撰写会话类型（旧草稿兼容标记，决定恢复时的跳转页面） */
  kind: ComposeKind;
  /** 各标签页的锁定状态（true = 只读防误触），默认均未锁定 */
  locked: { meta: boolean; body: boolean };
  /** 各标签页的滚动位置（contentOffsetY），切换时保留浏览进度 */
  scrollPositions: { meta: number; body: number };
  generatedHtml: string | null;
  uploadStatus: 'idle' | 'uploading' | 'done' | 'error';
  uploadError: string | null;
  uploadedPath: string | null;
  /** 新闻形态（form.isNews 时有效）：文字新闻 / 海报新闻 */
  newsKind: NewsKind;
  /** 海报图片（瞬态，不进入草稿持久化） */
  posterUri: string | null;
  posterBase64: string | null;
  /** 全局上传/发布进行中标记（跨页面防重复提交） */
  publishBusy: boolean;

  setField: <K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) => void;
  toggleTag: (tag: string) => void;
  setArticleType: (t: ArticleType) => void;
  setGeneratedHtml: (html: string | null) => void;
  /** 开始一篇新文章：生成草稿 id */
  startDraft: () => void;
  /** 开始撰写（旧新闻入口兼容）：生成草稿 id 并标记会话类型 */
  startDraftWithKind: (kind: ComposeKind) => void;
  /** 从草稿恢复表单 */
  loadDraft: (id: string, form: ArticleFormData, kind?: ComposeKind) => void;
  /** 切换某个标签页的锁定状态 */
  toggleLock: (tab: 'meta' | 'body') => void;
  /** 记录标签页滚动位置（仅记录，不触发草稿保存） */
  setScrollPosition: (tab: 'meta' | 'body', y: number) => void;
  /** 设置新闻形态 */
  setNewsKind: (k: NewsKind) => void;
  /** 设置海报图片（选择后）或清除 */
  setPoster: (uri: string | null, base64: string | null) => void;
  /** 设置全局上传/发布进行中标记 */
  setPublishBusy: (b: boolean) => void;
  reset: () => void;
  setUploadStatus: (s: ComposeState['uploadStatus'], error?: string, path?: string) => void;
}

export const useComposeStore = create<ComposeState>((set) => ({
  form: { ...defaultForm },
  draftId: null,
  kind: 'article',
  locked: { meta: false, body: false },
  scrollPositions: { meta: 0, body: 0 },
  generatedHtml: null,
  uploadStatus: 'idle',
  uploadError: null,
  uploadedPath: null,
  newsKind: 'text',
  posterUri: null,
  posterBase64: null,
  publishBusy: false,

  setField: (key, value) =>
    set((state) => ({ form: { ...state.form, [key]: value } })),

  toggleTag: (tag) =>
    set((state) => {
      const tags = [...state.form.tags];
      if (tag === '无') {
        return { form: { ...state.form, tags: ['无'] } };
      }
      // 移除"无"
      const filtered = tags.filter((t) => t !== '无');
      const idx = filtered.indexOf(tag);
      if (idx >= 0) filtered.splice(idx, 1);
      else filtered.push(tag);
      return { form: { ...state.form, tags: filtered.length ? filtered : ['无'] } };
    }),

  setArticleType: (t) => set((state) => ({ form: { ...state.form, articleType: t } })),

  setGeneratedHtml: (html) => set({ generatedHtml: html }),

  startDraft: () =>
    set({
      draftId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }),

  startDraftWithKind: (kind) =>
    set({
      draftId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind,
    }),

  loadDraft: (id, form, kind = 'article') =>
    set({
      draftId: id,
      kind,
      form: { ...defaultForm, ...form },
      generatedHtml: null,
      uploadStatus: 'idle',
      uploadError: null,
      uploadedPath: null,
      locked: { meta: false, body: false },
      scrollPositions: { meta: 0, body: 0 },
      newsKind: 'text',
      posterUri: null,
      posterBase64: null,
      publishBusy: false,
    }),

  toggleLock: (tab) =>
    set((state) => ({
      locked: { ...state.locked, [tab]: !state.locked[tab] },
    })),

  setScrollPosition: (tab, y) =>
    set((state) => ({
      scrollPositions: { ...state.scrollPositions, [tab]: y },
    })),

  setNewsKind: (k) => set({ newsKind: k }),

  setPoster: (uri, base64) => set({ posterUri: uri, posterBase64: base64 }),

  setPublishBusy: (b) => set({ publishBusy: b }),

  reset: () =>
    set({
      form: { ...defaultForm },
      draftId: null,
      kind: 'article',
      locked: { meta: false, body: false },
      scrollPositions: { meta: 0, body: 0 },
      generatedHtml: null,
      uploadStatus: 'idle',
      uploadError: null,
      uploadedPath: null,
      newsKind: 'text',
      posterUri: null,
      posterBase64: null,
      publishBusy: false,
    }),

  setUploadStatus: (s, error, path) =>
    set({ uploadStatus: s, uploadError: error ?? null, uploadedPath: path ?? null }),
}));
