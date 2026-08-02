// 预览样式：从仓库读取网站 css/style.css，内联到预览 HTML，让预览真正渲染出网站视觉
import { getFile } from './github-client';
import { SITE_BASE_URL } from './config';

let cachedCss: string | null = null;
let cssPromise: Promise<string | null> | null = null;

/** 获取网站主样式表内容（带内存缓存，失败不缓存以便下次重试） */
export function getSiteCss(): Promise<string | null> {
  if (cachedCss) return Promise.resolve(cachedCss);
  if (!cssPromise) {
    cssPromise = getFile('css/style.css')
      .then(({ content }) => {
        cachedCss = content;
        return content;
      })
      .catch(() => {
        cssPromise = null; // 失败不缓存，下次预览重试
        return null;
      });
  }
  return cssPromise;
}

/**
 * 构建带网站样式的预览 HTML：
 * - 将 <link rel="stylesheet" href="../../css/style.css"> 替换为内联 <style>
 * - 相对路径资源（图片等）由 WebView 的 baseUrl 解析（见 HtmlPreview）
 */
export function buildPreviewHtml(html: string, css: string | null): string {
  if (!css) return html;
  return html.replace(
    '<link rel="stylesheet" href="../../css/style.css">',
    `<style>\n${css}\n</style>`,
  );
}

/** 预览 HTML 中相对资源解析的基地址（站点根） */
export const PREVIEW_BASE_URL = `${SITE_BASE_URL}/`;
