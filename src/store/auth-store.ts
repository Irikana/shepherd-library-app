// 认证状态管理
import { create } from 'zustand';
import { deleteToken, getToken, setToken } from '../lib/auth';
import { validateToken } from '../lib/github-client';
import { fetchVersion } from '../lib/version';

interface AuthState {
  isAuthenticated: boolean | null; // null = 初始化中
  login: string | null;
  version: string | null;
  loading: boolean;
  error: string | null;

  init: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshVersion: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: null,
  login: null,
  version: null,
  loading: false,
  error: null,

  init: async () => {
    const token = await getToken();
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }
    set({ loading: true, error: null });
    try {
      const { login } = await validateToken(token);
      set({ isAuthenticated: true, login, loading: false });
      // 后台拉取版本号（不阻塞登录流程）
      fetchVersion().then((v) => set({ version: v })).catch(() => {});
    } catch (err) {
      // Token 失效，清除并要求重新登录
      await deleteToken();
      set({
        isAuthenticated: false,
        loading: false,
        error: (err as Error).message,
      });
    }
  },

  loginWithToken: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const { login } = await validateToken(token);
      await setToken(token);
      set({ isAuthenticated: true, login, loading: false });
      // 登录后拉取版本号
      fetchVersion().then((v) => set({ version: v })).catch(() => {});
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
      throw err;
    }
  },

  logout: async () => {
    await deleteToken();
    set({ isAuthenticated: false, login: null, version: null, error: null });
  },

  refreshVersion: async () => {
    try {
      const v = await fetchVersion();
      set({ version: v });
    } catch {
      // 忽略版本号拉取失败
    }
  },

  clearError: () => set({ error: null }),
}));
