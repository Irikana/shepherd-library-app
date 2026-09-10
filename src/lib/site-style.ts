// 预览样式：从仓库读取网站 css/style.css 与出版化精修层 css/library-refit.css，
// 按加载顺序内联到预览 HTML，让预览真正渲染出网站视觉（含主题变量与卡片/标题层级）
import { getFile } from './github-client';
import { SITE_BASE_URL } from './config';

let cachedCss: string | null = null;
let cssPromise: Promise<string | null> | null = null;

/** 站点样式表的仓库路径，顺序即生效顺序（后者覆写前者变量） */
const SITE_STYLESHEETS = ['css/style.css', 'css/library-refit.css'];

/**
 * 获取网站样式表内容（style.css + 精修层拼接；带内存缓存，失败不缓存以便下次重试）
 * 精修层缺失（如尚未发布 alpha-021）时只用 style.css，不阻塞预览
 */
export function getSiteCss(): Promise<string | null> {
  if (cachedCss) return Promise.resolve(cachedCss);
  if (!cssPromise) {
    cssPromise = Promise.all(
      SITE_STYLESHEETS.map((p) =>
        getFile(p)
          .then(({ content }) => content)
          .catch(() => null),
      ),
    )
      .then((parts) => {
        const css = parts.filter(Boolean).join('\n');
        if (css) cachedCss = css;
        return css || null;
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
 * - 把 style.css 的 <link> 替换为内联 <style>（已含精修层），并移除精修层的 <link>
 * - 相对路径资源（图片等）由 WebView 的 baseUrl 解析（见 HtmlPreview）
 */
export function buildPreviewHtml(html: string, css: string | null): string {
  if (!css) return html;
  return html
    .replace(/<link rel="stylesheet" href="(?:\.\.\/)*css\/style\.css">/, `<style>\n${css}\n</style>`)
    .replace(/\s*<link rel="stylesheet" href="(?:\.\.\/)*css\/library-refit\.css">/, '');
}

/** 预览 HTML 中相对资源解析的基地址（站点根） */
export const PREVIEW_BASE_URL = `${SITE_BASE_URL}/`;
