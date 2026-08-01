// GitHub REST API 客户端
// 封装 Contents API（单文件读写）与 Git Data API 低层操作（多文件原子提交用）
import { GITHUB_API, REPO_CONFIG } from './config';
import { getToken } from './auth';
import { encodePath } from './path-codec';
import { rateLimit } from './rate-limit';
import { b64decode, b64encode } from './base64';
import type { RepoContentItem, TreeItem, TreeCreateItem } from '../types';

const API_BASE = `${GITHUB_API}/repos/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}`;

export class GitHubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
  }
}

/** 通用请求：自动带 Token、解析速率限制头 */
async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  if (!token) throw new GitHubError('未登录，请先输入 Token', 401);
  const url = path.startsWith('http') ? path : `${GITHUB_API}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  rateLimit.update(res.headers);
  return res;
}

/** 解析错误响应体 */
async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.message || res.statusText;
  } catch {
    return res.statusText;
  }
}

// ──────────────────────────────────────────────
// Token 验证（登录页用，Token 尚未存储）
// ──────────────────────────────────────────────

export async function validateToken(
  token: string,
): Promise<{ login: string; repoName: string; permissions: { push: boolean } }> {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // 1. 验证 Token 本身有效
  const userRes = await fetch(`${GITHUB_API}/user`, { headers });
  if (!userRes.ok) {
    const msg = await parseError(userRes);
    if (userRes.status === 401) throw new GitHubError('Token 无效或已过期', 401);
    throw new GitHubError(`验证用户失败：${msg}`, userRes.status);
  }
  const user = await userRes.json();

  // 2. 验证对目标仓库有访问权限
  const repoRes = await fetch(API_BASE, { headers });
  if (!repoRes.ok) {
    const msg = await parseError(repoRes);
    if (repoRes.status === 404) {
      throw new GitHubError(
        `无法访问仓库 ${REPO_CONFIG.owner}/${REPO_CONFIG.repo}（404）。请确认 Token 已授权该仓库的 Contents 读写权限。`,
        404,
      );
    }
    throw new GitHubError(`验证仓库失败：${msg}`, repoRes.status);
  }
  const repo = await repoRes.json();
  if (!repo.permissions?.push) {
    throw new GitHubError('Token 对该仓库没有写入权限，请重新生成含 Contents:Read and write 的 Token', 403);
  }

  rateLimit.update(repoRes.headers);
  return { login: user.login, repoName: repo.full_name, permissions: { push: repo.permissions.push } };
}

// ──────────────────────────────────────────────
// Contents API — 单文件读写
// ──────────────────────────────────────────────

/** 读取单个文本文件（自动 base64 解码） */
export async function getFile(
  path: string,
  ref: string = REPO_CONFIG.branch,
): Promise<{ content: string; sha: string }> {
  const res = await request(`${API_BASE}/contents/${encodePath(path)}?ref=${ref}`);
  if (!res.ok) {
    const msg = await parseError(res);
    throw new GitHubError(`读取文件失败（${path}）：${msg}`, res.status);
  }
  const data = await res.json();
  return { content: b64decode(data.content), sha: data.sha };
}

/** 列出目录内容 */
export async function listDir(
  dir: string,
  ref: string = REPO_CONFIG.branch,
): Promise<RepoContentItem[]> {
  const res = await request(`${API_BASE}/contents/${encodePath(dir)}?ref=${ref}`);
  if (!res.ok) {
    const msg = await parseError(res);
    throw new GitHubError(`列出目录失败（${dir}）：${msg}`, res.status);
  }
  return res.json();
}

/** 写入/更新单个文件（Contents API PUT，更新需带 sha） */
export async function putFile(
  path: string,
  content: string,
  opts: { sha?: string; message: string; branch?: string },
): Promise<{ commitSha: string }> {
  const body: Record<string, unknown> = {
    message: opts.message,
    content: b64encode(content),
    branch: opts.branch || REPO_CONFIG.branch,
  };
  if (opts.sha) body.sha = opts.sha;

  const res = await request(`${API_BASE}/contents/${encodePath(path)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await parseError(res);
    if (res.status === 409) throw new GitHubError('文件已被修改（409 冲突），请重新拉取后再保存', 409);
    throw new GitHubError(`写入文件失败（${path}）：${msg}`, res.status);
  }
  const data = await res.json();
  return { commitSha: data.commit?.sha };
}

// ──────────────────────────────────────────────
// Git Data API — 低层操作（多文件原子提交用）
// ──────────────────────────────────────────────

/** 获取 ref 指向的 commit sha */
export async function getRef(ref: string = `heads/${REPO_CONFIG.branch}`): Promise<string> {
  const res = await request(`${API_BASE}/git/refs/${ref}`);
  if (!res.ok) {
    const msg = await parseError(res);
    throw new GitHubError(`获取 ref 失败（${ref}）：${msg}`, res.status);
  }
  const data = await res.json();
  return data.object.sha;
}

/** 获取某 commit 的根 tree sha */
export async function getCommitTree(commitSha: string): Promise<string> {
  const res = await request(`${API_BASE}/git/commits/${commitSha}`);
  if (!res.ok) {
    const msg = await parseError(res);
    throw new GitHubError(`获取 commit tree 失败：${msg}`, res.status);
  }
  const data = await res.json();
  return data.tree.sha;
}

/** 创建 tree（基于 base_tree 增量更新） */
export async function createTree(baseTreeSha: string, items: TreeCreateItem[]): Promise<string> {
  const res = await request(`${API_BASE}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseTreeSha, tree: items }),
  });
  if (!res.ok) {
    const msg = await parseError(res);
    throw new GitHubError(`创建 tree 失败：${msg}`, res.status);
  }
  const data = await res.json();
  return data.sha;
}

/** 创建 commit */
export async function createCommit(
  message: string,
  treeSha: string,
  parentShas: string[],
): Promise<string> {
  const res = await request(`${API_BASE}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: treeSha, parents: parentShas }),
  });
  if (!res.ok) {
    const msg = await parseError(res);
    throw new GitHubError(`创建 commit 失败：${msg}`, res.status);
  }
  const data = await res.json();
  return data.sha;
}

/** 更新 ref（将分支指向新 commit） */
export async function updateRef(
  sha: string,
  ref: string = `heads/${REPO_CONFIG.branch}`,
): Promise<void> {
  const res = await request(`${API_BASE}/git/refs/${ref}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha, force: false }),
  });
  if (!res.ok) {
    const msg = await parseError(res);
    if (res.status === 422) throw new GitHubError('ref 更新失败（422 non-fast-forward），需重试', 422);
    throw new GitHubError(`更新 ref 失败：${msg}`, res.status);
  }
}

/** 获取全树（recursive=1），用于文件浏览器 */
export async function getTree(ref: string = REPO_CONFIG.branch): Promise<TreeItem[]> {
  const res = await request(`${API_BASE}/git/trees/${ref}?recursive=1`);
  if (!res.ok) {
    const msg = await parseError(res);
    throw new GitHubError(`获取全树失败：${msg}`, res.status);
  }
  const data = await res.json();
  return data.tree;
}
