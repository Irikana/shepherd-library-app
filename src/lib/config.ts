// 仓库与 API 配置

export const REPO_CONFIG = {
  owner: 'Irikana',
  repo: 'Irikana.github.io',
  branch: 'main',
} as const;

export const GITHUB_API = 'https://api.github.com';

export const SITE_BASE_URL = 'https://irikana.github.io';

// 速率限制告警阈值
export const RATE_LIMIT_WARN_THRESHOLD = 100;

// Token 在 SecureStore 中的键名
export const TOKEN_KEY = 'gh-pat';
