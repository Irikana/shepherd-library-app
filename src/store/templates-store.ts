// 正文编辑模板状态管理
// 本地持久化储存用户的习惯格式与自定义模板，支持增删改查
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EditorTemplate {
  id: string;
  title: string;
  content: string;
  description?: string;
  updatedAt: string;
}

const STORAGE_KEY = 'slywrite-editor-templates-v1';

export const DEFAULT_TEMPLATES: EditorTemplate[] = [
  {
    id: 'std-article',
    title: '标准文章结构',
    description: '引言、主要内容与总结的三段式通用结构',
    content: '## 引言\n\n§\n\n## 主要内容\n\n\n\n## 总结与思考\n',
    updatedAt: '2026-10-05',
  },
  {
    id: 'memo-todo',
    title: '备忘与待办',
    description: '记录今日重点、进展记录与后续规划',
    content: '### 今日重点\n\n- [ ] §\n- [ ] \n\n### 进展记录\n\n\n\n### 后续规划\n',
    updatedAt: '2026-10-05',
  },
  {
    id: 'reading-quote',
    title: '资料摘录与评注',
    description: '引用框摘录核心内容，配出处与个人思考',
    content: '<div class="quote-box-grey">\n  §摘录文字或核心论点\n</div>\n\n**出处与来源**：\n**思考与批注**：\n',
    updatedAt: '2026-10-05',
  },
  {
    id: 'qa-analysis',
    title: '问题与分析',
    description: '现象、原因剖析与解决方案记录',
    content: '### 问题背景\n\n§\n\n### 根因分析\n\n\n\n### 解决方案与验证\n',
    updatedAt: '2026-10-05',
  },
];

interface TemplatesState {
  templates: EditorTemplate[];
  ready: boolean;
  loadTemplates: () => Promise<void>;
  addTemplate: (title: string, content: string, description?: string) => Promise<void>;
  updateTemplate: (id: string, title: string, content: string, description?: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export const useTemplatesStore = create<TemplatesState>((set, get) => ({
  templates: DEFAULT_TEMPLATES,
  ready: false,

  loadTemplates: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({ templates: parsed, ready: true });
          return;
        }
      }
      set({ templates: DEFAULT_TEMPLATES, ready: true });
    } catch {
      set({ templates: DEFAULT_TEMPLATES, ready: true });
    }
  },

  addTemplate: async (title, content, description) => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const newT: EditorTemplate = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim() || '未命名模板',
      content,
      description: description?.trim() || undefined,
      updatedAt: dateStr,
    };
    const next = [newT, ...get().templates];
    set({ templates: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },

  updateTemplate: async (id, title, content, description) => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const next = get().templates.map((t) =>
      t.id === id
        ? {
            ...t,
            title: title.trim() || t.title,
            content,
            description: description?.trim() || undefined,
            updatedAt: dateStr,
          }
        : t,
    );
    set({ templates: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },

  deleteTemplate: async (id) => {
    const next = get().templates.filter((t) => t.id !== id);
    set({ templates: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },

  resetToDefaults: async () => {
    set({ templates: DEFAULT_TEMPLATES });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
  },
}));

// 初始化自动加载
useTemplatesStore.getState().loadTemplates();
