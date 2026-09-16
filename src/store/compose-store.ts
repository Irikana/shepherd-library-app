// 撰写表单状态管理（内存态，跨 compose <-> preview 导航共享）
// 0.0.7：文章与新闻撰写合并为同一入口，新闻 = 文章 + 「在新闻板块展示」选项
// 词条统一：知识词条不再是独立的 knowledge-store 会话，而是同一份表单里的 form.entryType='knowledge'
//
// draftId 的复用规则（「文章个体不明确」缺陷的修复点，改动前请先读这段）：
// 1. 「新建」只由入口动作决定：首页「撰写文章」调 startNewArticle()，「撰写知识词条」调 startNewKnowledge()，
//    语义都是「清空会话表单 + 生成新 draftId」。因此草稿箱里已有草稿时，点入口得到的仍是空白新稿。
// 2. 「继续编辑」只有草稿箱一个入口：它调 loadDraft(id, form) 显式带上草稿 id。
// 3. 会话本身不落盘：撰写页卸载（返回退出撰写流程）时会把最新表单 flush 成草稿并 endSession() 清掉 draftId，
//    所以再次从入口进入一定是新会话；从预览页 router.back() 返回撰写页不算退出（页面未卸载），draftId 保持不变。
// 4. 兜底：若撰写页挂载时 draftId 为 null（未经入口动作直接进入、或发布后 reset 又回到该页），
//    按当前 entryType 现开一个新会话，避免出现「有内容但没有草稿 id 可保存」的状态。
import { create } from 'zustand';
import type { ArticleFormData, ArticleType, EntryType, NewsKind } from '../types';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const defaultForm: ArticleFormData = {
  entryType: 'article',
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
  aliases: '',
  knowledgeCategory: 'phenomenon',
  relatedEntries: '',
  isNews: false,
  hidden: false,
};

/** 空白表单（每次调用重算创建日期，避免跨天沿用模块加载时的日期） */
export function blankForm(entryType: EntryType): ArticleFormData {
  return { ...defaultForm, entryType, createDate: today() };
}

/** 新草稿 id（时间戳 + 随机后缀） */
function newDraftId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface ComposeState {
  form: ArticleFormData;
  /** 当前草稿 id（用于自动保存/恢复），null 表示无草稿上下文 */
  draftId: string | null;
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
  /** 开始一篇新文章：清会话表单 + 生成新 draftId */
  startNewArticle: () => void;
  /** 开始一个新知识词条：清会话表单 + 生成新 draftId（entryType='knowledge'） */
  startNewKnowledge: () => void;
  /** 从草稿恢复表单（唯一「继续编辑」入口，必须带草稿 id） */
  loadDraft: (id: string, form: ArticleFormData) => void;
  /** 退出撰写会话：只清 draftId（草稿已落盘），保留表单便于返回预览页时继续查看 */
  endSession: () => void;
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

/** 会话级瞬态清空（表单之外的所有状态回到初始值） */
const transientState = {
  locked: { meta: false, body: false },
  scrollPositions: { meta: 0, body: 0 },
  generatedHtml: null,
  uploadStatus: 'idle' as const,
  uploadError: null,
  uploadedPath: null,
  newsKind: 'text' as const,
  posterUri: null,
  posterBase64: null,
  publishBusy: false,
};

export const useComposeStore = create<ComposeState>((set) => ({
  form: { ...defaultForm },
  draftId: null,
  ...transientState,

  setField: (key, value) =>
    set((state) => ({ form: { ...state.form, [key]: value } })),

  toggleTag: (tag) =>
    set((state) => {
      const tags = [...state.form.tags];
      const idx = tags.indexOf(tag);
      if (idx >= 0) tags.splice(idx, 1);
      else tags.push(tag);
      return { form: { ...state.form, tags } };
    }),

  setArticleType: (t) => set((state) => ({ form: { ...state.form, articleType: t } })),

  setGeneratedHtml: (html) => set({ generatedHtml: html }),

  startNewArticle: () =>
    set({ form: blankForm('article'), draftId: newDraftId(), ...transientState }),

  startNewKnowledge: () =>
    set({ form: blankForm('knowledge'), draftId: newDraftId(), ...transientState }),

  loadDraft: (id, form) =>
    set({
      draftId: id,
      // 清理历史遗留的「无」标签（0.0.12 起「无」不再是标签）；entryType 由调用方规范化后带入
      form: {
        ...defaultForm,
        ...form,
        tags: (form.tags ?? []).filter((t) => t !== '无'),
      },
      ...transientState,
    }),

  endSession: () => set({ draftId: null, ...transientState }),

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
      ...transientState,
    }),

  setUploadStatus: (s, error, path) =>
    set({ uploadStatus: s, uploadError: error ?? null, uploadedPath: path ?? null }),
}));
