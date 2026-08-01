// Token 存储 — Web 端 fallback
// Metro 在 Web 平台自动选择此文件（.web.ts 后缀优先于 .ts）
// 使用 localStorage（非加密，仅开发/调试用；原生端用 expo-secure-store）
import { TOKEN_KEY } from './config';

export async function getToken(): Promise<string | null> {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  localStorage.setItem(TOKEN_KEY, token);
}

export async function deleteToken(): Promise<void> {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // 忽略不存在的键
  }
}
