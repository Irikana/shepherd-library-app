// 草稿管理：撰写中的文章/知识词条自动缓存到本机，退出重进后可选择恢复
// 0.0.15.8：只有「真正编辑过」的表单才写入草稿箱——点开撰写没写任何内容不再产生未命名草稿；
// 会话中创建过草稿后又把内容全部撤销回默认值的，该草稿会被清掉
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultForm } from './compose-store';
import { defaultKnowledgeForm } from './knowledge-store';
import type { ArticleFormData, ComposeKind, KnowledgeEntryFormData } from '../types';

/** 文章表单相对默认值是否有真实编辑（标题/正文/标签/日期/作者/开关等任一偏离即算） */
export function articleFormEdited(form: ArticleFormData): boolean {
  if (
    form.title?.trim() ||
    form.titleEn?.trim() ||
    form.bodyMarkdown?.trim() ||
    form.footerNote?.trim() ||
    form.recordingDuration?.trim()
  ) return true;
  if ((form.tags?.length ?? 0) > 0) return true;
  if ((form.footnotes ?? []).some((f) => f?.trim())) return true;
  if (form.isNews || form.includeMathJax || form.hidden) return true;
  if (form.articleType && form.articleType !== defaultForm.articleType) return true;
  if (form.category && form.category !== defaultForm.category) return true;
  if (form.author && form.author !== defaultForm.author) return true;
  if (form.createDate && form.createDate !== defaultForm.createDate) return true;
  return false;
}

/** 知识词条表单相对默认值是否有真实编辑 */
export function knowledgeFormEdited(form: KnowledgeEntryFormData): boolean {
  if (
    form.title?.trim() ||
    form.titleEn?.trim() ||
    form.aliases?.trim() ||
    form.bodyMarkdown?.trim()
  ) return true;
  if (form.category && form.category !== defaultKnowledgeForm.category) return true;
  if (form.createDate && form.createDate !== defaultKnowledgeForm.createDate) return true;
  return false;
}

/** 草稿表单：文章草稿或知识词条草稿（kind 区分） */
export type DraftForm = ArticleFormData | KnowledgeEntryFormData;

export interface Draft {
  id: string;
  title: string;
  updatedAt: number;
  form: DraftForm;
  /** 草稿类型：普通文章 / 新闻（0.0.6 起；旧草稿无此字段，恢复时按普通文章处理）/ 知识词条（0.0.16 起） */
  kind?: ComposeKind | 'knowledge';
}

const DRAFTS_KEY = 'slywrite-drafts';

interface DraftsState {
  drafts: Draft[];
  loaded: boolean;
  init: () => Promise<void>;
  upsert: (d: Draft) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

function sortByUpdated(drafts: Draft[]): Draft[] {
  return [...drafts].sort((a, b) => b.updatedAt - a.updatedAt);
}

export const useDraftsStore = create<DraftsState>((set, get) => ({
  drafts: [],
  loaded: false,

  init: async () => {
    try {
      const raw = await AsyncStorage.getItem(DRAFTS_KEY);
      let list: Draft[] = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) {
        // 清理历史遗留的空草稿（旧版本点开撰写页就会保存的「未命名」冗余草稿）：
        // 标题/英文名/正文全空即视为无价值（旧草稿日期与当天默认日期不同会误判为「已编辑」，故单独判空）
        const isEmptyLegacy = (d: Draft) => {
          const f = d.form as Partial<ArticleFormData & KnowledgeEntryFormData> | undefined;
          if (!f) return true;
          return !(f.title ?? '').trim() && !(f.titleEn ?? '').trim() && !(f.bodyMarkdown ?? '').trim();
        };
        const cleaned = list.filter((d) => {
          if (!d || !d.form) return false;
          if (isEmptyLegacy(d)) return false;
          if (d.kind === 'knowledge') return knowledgeFormEdited(d.form as KnowledgeEntryFormData);
          return articleFormEdited(d.form as ArticleFormData);
        });
        set({ drafts: sortByUpdated(cleaned), loaded: true });
        if (cleaned.length !== list.length) {
          try {
            await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(cleaned));
          } catch {
            // 持久化失败不阻塞
          }
        }
      } else {
        set({ drafts: [], loaded: true });
      }
    } catch {
      set({ drafts: [], loaded: true });
    }
  },

  upsert: async (d: Draft) => {
    const next = sortByUpdated([...get().drafts.filter((x) => x.id !== d.id), d]);
    set({ drafts: next });
    try {
      await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
    } catch {
      // 持久化失败不阻塞编辑
    }
  },

  remove: async (id: string) => {
    const next = get().drafts.filter((x) => x.id !== id);
    set({ drafts: next });
    try {
      await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
    } catch {
      // 忽略
    }
  },
}));
