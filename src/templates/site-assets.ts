// 站点全局资产引用片段（App 生成的每个页面都必须与仓库现有页面保持一致）
// alpha-021 起：所有页面在 css/style.css 之后追加「出版化精修样式表 library-refit.css」
// 与「主题预应用脚本」（在首屏绘制前把用户偏好写到 <html> 的 data-sl-* 属性上，避免主题闪烁）。
// 站点侧实现见 Irikana.github.io/css/library-refit.css 与 js/library-dynamic.js（SitePref / TopBar 模块）。

/** 精修样式表在仓库中的路径（相对站点根） */
export const SITE_REFIT_CSS = 'css/library-refit.css';

/** 主题预应用脚本（与页面内注入内容逐字一致，勿随意改动） */
export const SITE_THEME_BOOT =
  "(function(){var d={};try{d=JSON.parse(localStorage.getItem('sl_site-pref')||'{}')||{}}catch(e){}" +
  "var h=document.documentElement;function s(k,v){h.setAttribute('data-sl-'+k,d[k]||v)}" +
  "s('palette','classic');s('type','songti');s('size','normal');s('measure','normal');" +
  "h.setAttribute('data-sl-indent',d.indent===false?'off':'on');" +
  "var m='system';try{m=JSON.parse(localStorage.getItem('sl_theme')||'\"system\"')}catch(e){}" +
  "var k=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;" +
  "h.setAttribute('data-sl-variant',(m==='dark'||(m==='system'&&k))?'dark':'light')})();";

/**
 * 生成 head 中紧随 style.css 的两行附加标签
 * @param rootPrefix 站点根相对前缀（如 '../../'，与 style.css 使用同一前缀）
 */
export function siteHeadExtras(rootPrefix: string): string {
  return `<link rel="stylesheet" href="${rootPrefix}${SITE_REFIT_CSS}">\n  <script>${SITE_THEME_BOOT}</script>`;
}
