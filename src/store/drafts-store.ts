// 草稿管理：撰写中的文章/知识词条自动缓存到本机，退出重进后可选择恢复
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ArticleFormData, ComposeKind, KnowledgeEntryFormData } from '../types';

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
      const list: Draft[] = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) {
        set({ drafts: sortByUpdated(list), loaded: true });
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
