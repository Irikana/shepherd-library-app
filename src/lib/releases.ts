// 更新检查：从 GitHub Releases 获取最新版本与 APK 下载链接
// 公开仓库无需 Token；无 release 时返回 null（404）
import { REPO_CONFIG } from './config';

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

export interface ReleaseInfo {
  tagName: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
  body: string;
  assets: ReleaseAsset[];
}

export const LATEST_RELEASE_URL = `https://api.github.com/repos/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/releases/latest`;

/** 直接下载最新 APK 的固定链接（GitHub 会自动跳转到最新 release 的该 asset） */
export const LATEST_APK_URL = `https://github.com/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/releases/latest/download/app-release.apk`;

/** SlyWrite 官网（牧羊人图书馆网站上的项目页） */
export const SLYWRITE_SITE_URL = 'https://irikana.github.io/slywrite/';

/** 获取最新 release；仓库无 release 时返回 null */
export async function fetchLatestRelease(): Promise<ReleaseInfo | null> {
  const res = await fetch(LATEST_RELEASE_URL, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`获取更新失败（HTTP ${res.status}）`);
  const data = await res.json();
  return {
    tagName: data.tag_name,
    name: data.name,
    publishedAt: data.published_at,
    htmlUrl: data.html_url,
    body: data.body ?? '',
    assets: (data.assets ?? []).map((a: { name: string; browser_download_url: string }) => ({
      name: a.name,
      browser_download_url: a.browser_download_url,
    })),
  };
}

/** 简单版本比较：v0.0.4 > v0.0.3 */
export function compareVersions(a: string, b: string): number {
  const parse = (v: string) =>
    (v.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0));
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  }
  return 0;
}
