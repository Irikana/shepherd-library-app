// 知识馆条目撰写表单状态（内存态 + 草稿）
import { create } from 'zustand';
import type { KnowledgeCategory, KnowledgeEntryFormData } from '../types';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const defaultKnowledgeForm: KnowledgeEntryFormData = {
  title: '',
  titleEn: '',
  category: 'phenomenon',
  aliases: '',
  createDate: today(),
  bodyMarkdown: '',
};

interface KnowledgeState {
  form: KnowledgeEntryFormData;
  /** 当前草稿 id（用于自动保存/恢复），null 表示无草稿上下文 */
  draftId: string | null;
  /** 生成的词条页 HTML（跳转预览用） */
  generatedHtml: string | null;

  setField: <K extends keyof KnowledgeEntryFormData>(key: K, value: KnowledgeEntryFormData[K]) => void;
  /** 开始一个新词条：生成草稿 id */
  startDraft: () => void;
  /** 从草稿恢复表单 */
  loadDraft: (id: string, form: KnowledgeEntryFormData) => void;
  setGeneratedHtml: (html: string | null) => void;
  reset: () => void;
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  form: { ...defaultKnowledgeForm },
  draftId: null,
  generatedHtml: null,

  setField: (key, value) =>
    set((state) => ({ form: { ...state.form, [key]: value } })),

  startDraft: () =>
    set({
      draftId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }),

  loadDraft: (id, form) =>
    set({
      draftId: id,
      form: { ...defaultKnowledgeForm, ...form },
      generatedHtml: null,
    }),

  setGeneratedHtml: (html) => set({ generatedHtml: html }),

  reset: () =>
    set({
      form: { ...defaultKnowledgeForm },
      draftId: null,
      generatedHtml: null,
    }),
}));
