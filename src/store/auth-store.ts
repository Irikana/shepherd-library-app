// 认证状态管理
import { create } from 'zustand';
import { deleteToken, getToken, setToken } from '../lib/auth';
import { validateToken } from '../lib/github-client';

interface AuthState {
  isAuthenticated: boolean | null; // null = 初始化中
  login: string | null;
  loading: boolean;
  error: string | null;

  init: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: null,
  login: null,
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
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
      throw err;
    }
  },

  logout: async () => {
    await deleteToken();
    set({ isAuthenticated: false, login: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
