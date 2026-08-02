// 草稿管理：撰写中的文章自动缓存到本机，退出重进后可选择恢复
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ArticleFormData } from '../types';

export interface Draft {
  id: string;
  title: string;
  updatedAt: number;
  form: ArticleFormData;
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
