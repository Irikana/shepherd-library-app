// 内容编辑器状态（文件路径 + 内容 + 版本 sha），供编辑器页面使用
import { create } from 'zustand';

export interface EditorState {
  /** 正在编辑的文件路径（新建时为空字符串） */
  path: string;
  /** 文件显示名 */
  name: string;
  /** 文件原始内容（保存时作为基准） */
  originalContent: string;
  /** 当前编辑内容 */
  content: string;
  /** 文件的 sha（更新已存在文件时需要） */
  sha: string | null;
  /** 是否新建文件 */
  isNew: boolean;
  /** 是否已修改（相对原始内容） */
  dirty: boolean;
  /** 加载文件进入编辑器 */
  load: (path: string, content: string, sha?: string | null, name?: string) => void;
  /** 新建文件模式 */
  loadNew: () => void;
  /** 更新内容 */
  setContent: (content: string) => void;
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

  load: (path, content, sha = null, name) =>
    set({
      path,
      name: name ?? path.split('/').pop() ?? '',
      originalContent: content,
      content,
      sha,
      isNew: false,
      dirty: false,
    }),

  loadNew: () =>
    set({
      path: '',
      name: '',
      originalContent: '',
      content: '',
      sha: null,
      isNew: true,
      dirty: false,
    }),

  setContent: (content) =>
    set((state) => ({
      content,
      dirty: content !== state.originalContent,
    })),

  markSaved: (path, sha) =>
    set((state) => ({
      path,
      name: state.name || path.split('/').pop() || '',
      originalContent: state.content,
      sha,
      isNew: false,
      dirty: false,
    })),
}));
