// 撰写表单状态管理（内存态，跨 compose <-> preview 导航共享）
import { create } from 'zustand';
import type { ArticleFormData, ArticleTagName, ArticleType } from '../types';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const defaultForm: ArticleFormData = {
  title: '',
  author: '薛柯道',
  createDate: today(),
  articleType: '信息文章',
  tags: [],
  recordingDuration: '',
  bodyMarkdown: '',
  footerNote: '',
  footnotes: [],
  includeMathJax: false,
};

interface ComposeState {
  form: ArticleFormData;
  generatedHtml: string | null;
  uploadStatus: 'idle' | 'uploading' | 'done' | 'error';
  uploadError: string | null;
  uploadedPath: string | null;

  setField: <K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) => void;
  toggleTag: (tag: ArticleTagName) => void;
  setArticleType: (t: ArticleType) => void;
  setGeneratedHtml: (html: string | null) => void;
  reset: () => void;
  setUploadStatus: (s: ComposeState['uploadStatus'], error?: string, path?: string) => void;
}

export const useComposeStore = create<ComposeState>((set) => ({
  form: { ...defaultForm },
  generatedHtml: null,
  uploadStatus: 'idle',
  uploadError: null,
  uploadedPath: null,

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

  reset: () => set({ form: { ...defaultForm }, generatedHtml: null, uploadStatus: 'idle', uploadError: null, uploadedPath: null }),

  setUploadStatus: (s, error, path) =>
    set({ uploadStatus: s, uploadError: error ?? null, uploadedPath: path ?? null }),
}));
