// 草稿管理：撰写中的文章/知识词条自动缓存到本机，退出重进后可选择恢复
// 0.0.15.8：只有「真正编辑过」的表单才写入草稿箱——点开撰写没写任何内容不再产生未命名草稿；
// 会话中创建过草稿后又把内容全部撤销回默认值的，该草稿会被清掉
// 词条统一后（缺陷 C）：草稿表单只有一种形状（ArticleFormData），文章与词条靠 form.entryType 区分；
// 旧草稿（无 entryType）按 Draft.kind 推导，旧知识词条表单字段（category=知识馆分类）在读取时迁移
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { blankForm, defaultForm } from './compose-store';
import type { ArticleFormData, EntryType, KnowledgeCategory, KnowledgeEntryFormData } from '../types';

/** 当天日期串（与 compose-store 的 blankForm 保持同一算法，用于判断日期是否被真正改过） */
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** 文章表单相对默认值是否有真实编辑（标题/正文/标签/日期/作者/开关/词条字段等任一偏离即算） */
export function articleFormEdited(form: ArticleFormData): boolean {
  if (
    form.title?.trim() ||
    form.titleEn?.trim() ||
    form.bodyMarkdown?.trim() ||
    form.footerNote?.trim() ||
    form.recordingDuration?.trim() ||
    form.aliases?.trim()
  ) return true;
  if ((form.tags?.length ?? 0) > 0) return true;
  if ((form.footnotes ?? []).some((f) => f?.trim())) return true;
  if (form.isNews || form.includeMathJax || form.hidden) return true;
  if (form.articleType && form.articleType !== defaultForm.articleType) return true;
  if (form.category && form.category !== defaultForm.category) return true;
  if (form.knowledgeCategory && form.knowledgeCategory !== defaultForm.knowledgeCategory) return true;
  if (form.author && form.author !== defaultForm.author) return true;
  // 创建日期与「今天」比，而不是与模块加载时算出的 defaultForm 比：
  // App 常驻跨过后半夜再新建时，两者会差一天，空白稿会被误判为「已编辑」而落进草稿箱
  if (form.createDate && form.createDate !== todayStr()) return true;
  return false;
}

/** 旧版知识词条草稿（未并入统一表单前的形状）是否算真实编辑；仅用于旧草稿的清理与迁移判断 */
export function legacyKnowledgeFormEdited(form: KnowledgeEntryFormData): boolean {
  const legacyDefaultCategory: KnowledgeCategory = 'phenomenon';
  if (
    form.title?.trim() ||
    form.titleEn?.trim() ||
    form.aliases?.trim() ||
    form.bodyMarkdown?.trim()
  ) return true;
  if (form.category && form.category !== legacyDefaultCategory) return true;
  if (form.createDate && form.createDate !== todayStr()) return true;
  return false;
}

/** 草稿表单：统一表单（现行）或旧版知识词条表单（历史遗留，读取时迁移） */
export type DraftForm = ArticleFormData | KnowledgeEntryFormData;

export interface Draft {
  id: string;
  title: string;
  updatedAt: number;
  form: DraftForm;
  /** 草稿类型标记：普通文章 / 新闻（0.0.6 起）/ 知识词条（0.0.16 起）。
   * 现行写入规则：form.entryType==='knowledge' 时写 'knowledge'，否则写 'article'；
   * 读取时该字段只作为「旧草稿没有 form.entryType」的兜底推导依据 */
  kind?: EntryType | 'news';
}

/** 草稿的条目类型：优先读表单 entryType，旧草稿没有该字段时按 kind 推导 */
export function draftEntryType(draft: Draft): EntryType {
  const form = draft.form as Partial<ArticleFormData>;
  if (form?.entryType === 'knowledge' || form?.entryType === 'article') return form.entryType;
  return draft.kind === 'knowledge' ? 'knowledge' : 'article';
}

/** 写入草稿时的 kind 值（与 entryType 对齐；旧版本 App 靠 kind 决定恢复到哪个页面） */
export function draftKindOf(form: ArticleFormData): EntryType {
  return form.entryType === 'knowledge' ? 'knowledge' : 'article';
}

/** 合并草稿表单：忽略旧草稿里显式为 undefined/null 的字段，避免默认值被空值覆盖 */
function mergeForm(base: ArticleFormData, raw: Partial<ArticleFormData>): ArticleFormData {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(raw)) {
    if (v !== undefined && v !== null) out[k] = v;
  }
  return out as unknown as ArticleFormData;
}

/** 把任意版本的草稿表单规整成统一表单（含旧知识词条字段迁移与旧新闻草稿兼容） */
export function normalizeDraftForm(draft: Draft): ArticleFormData {
  const entryType = draftEntryType(draft);
  const blank = blankForm(entryType);
  const raw = (draft.form ?? {}) as Partial<ArticleFormData & KnowledgeEntryFormData>;

  // 旧版知识词条草稿：没有 entryType，且 category 存的是知识馆分类（phenomenon/recallable/traceable）
  if (entryType === 'knowledge' && !raw.entryType) {
    const legacy = raw as KnowledgeEntryFormData;
    return mergeForm(blank, {
      title: legacy.title ?? '',
      titleEn: legacy.titleEn ?? '',
      aliases: legacy.aliases ?? '',
      createDate: legacy.createDate?.trim() || blank.createDate,
      bodyMarkdown: legacy.bodyMarkdown ?? '',
      knowledgeCategory: legacy.category ?? 'phenomenon',
      entryType: 'knowledge',
    });
  }

  const form = mergeForm(blank, { ...raw, entryType });
  // 0.0.7 起新闻不再是独立类型：旧新闻草稿（kind='news'）恢复时自动开启「在新闻板块展示」
  if (draft.kind === 'news' && !form.isNews) {
    form.isNews = true;
    form.category = 'normal';
  }
  return form;
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
          // 旧版知识词条草稿按其专有形状判断；其余（含统一表单）走文章判断
          if (draftEntryType(d) === 'knowledge' && !(d.form as Partial<ArticleFormData>).entryType) {
            return legacyKnowledgeFormEdited(d.form as KnowledgeEntryFormData);
          }
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
