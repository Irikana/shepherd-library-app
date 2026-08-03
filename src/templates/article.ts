// 文章页 HTML 模板生成器
// 以 library/paper/ 下实际文章页结构为权威参考，产出完整可部署的 HTML
// 0.0.7：相对路径随分类目录深度自适应（修复 misc/experimental 等深层目录下 CSS/JS/图片失效）
import { marked } from 'marked';
import type { ArticleFormData } from '../types';

/** 将 YYYY-MM-DD 格式化为 YYYY年M月D日 */
export function formatDateCN(dateStr: string): string {
  const m = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return dateStr;
  return `${m[1]}年${parseInt(m[2], 10)}月${parseInt(m[3], 10)}日`;
}

/** HTML 转义（脚注内容） */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 渲染标签 spans（内置标签带专属类名，自定义标签用通用样式） */
function renderTags(tags: string[]): string {
  if (!tags.length) return '<span class="article-tag">无</span>';
  return tags
    .map((tag) => {
      if (tag === '包含AI') return '<span class="article-tag tag-ai">包含AI</span>';
      if (tag === '有删减') return '<span class="article-tag tag-edited">有删减</span>';
      if (tag === '小说') return '<span class="article-tag tag-novel">小说</span>';
      return `<span class="article-tag">${escapeHtml(tag)}</span>`;
    })
    .join('\n        ');
}

/** 渲染文章性质徽标（实验性文章带专属样式） */
function renderTypeBadge(articleType: string): string {
  if (articleType === '实验性文章') {
    return '<span class="article-type-badge type-experimental">实验性文章</span>';
  }
  return `<span class="article-type-badge">${escapeHtml(articleType)}</span>`;
}

/** 文章页内联脚本块（各页相同，仅 PAGE_DISPLAY_NAME 与根前缀不同） */
const ARTICLE_SCRIPT = (displayName: string, rootPrefix: string) => {
  // JS 字符串上下文转义：防 </script> 提前终止、防单引号破坏字符串
  const safeName = displayName.replace(/</g, '\\u003c').replace(/'/g, "\\'");
  return `<script>
const PAGE_DISPLAY_NAME = '${safeName}';

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openNavigator() {
  window.open('${rootPrefix}navigator.html', '_blank');
}

function getCurrentPath() {
  const path = window.location.pathname;
  let formattedPath = path.replace(/^\\//, '').replace(/\\.html$/, '').replace(/\\.htm$/, '');

  if (formattedPath === '' || formattedPath === 'index') {
    return '首页';
  }

  const segments = formattedPath.split('/');
  formattedPath = segments.map((segment, index) => {
    const fileNameIndex = segment.lastIndexOf('.');
    if (fileNameIndex > 0) {
      segment = segment.substring(0, fileNameIndex);
    }
    if (index === segments.length - 1 && PAGE_DISPLAY_NAME) {
      return PAGE_DISPLAY_NAME;
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
  }).join(' → ');

  return formattedPath;
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) { section.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}

window.addEventListener('DOMContentLoaded', function() {
  const quickNav = document.querySelector('.quick-nav');
  const isMobile = window.innerWidth <= 768;

  if (quickNav && isMobile) {
    quickNav.addEventListener('click', function(event) {
      if (quickNav.classList.contains('expanded')) {
        quickNav.classList.remove('expanded'); quickNav.style.width = '32px'; quickNav.style.padding = '8px 4px';
        const content = quickNav.querySelector('.quick-nav-content'); if (content) content.style.display = 'none';
        const title = quickNav.querySelector('.quick-nav-title'); if (title) { title.style.writingMode = 'vertical-rl'; title.style.marginBottom = '4px'; title.style.paddingBottom = '0'; title.style.borderBottom = 'none'; }
        const hint = quickNav.querySelector('.quick-nav-hint'); if (hint) hint.style.display = 'block';
      } else {
        quickNav.classList.add('expanded'); quickNav.style.width = '180px'; quickNav.style.padding = '16px';
        const content = quickNav.querySelector('.quick-nav-content'); if (content) content.style.display = 'block';
        const title = quickNav.querySelector('.quick-nav-title'); if (title) { title.style.writingMode = 'horizontal-tb'; title.style.marginBottom = '16px'; title.style.paddingBottom = '8px'; title.style.borderBottom = '1px solid #e0e0e0'; }
        const hint = quickNav.querySelector('.quick-nav-hint'); if (hint) hint.style.display = 'none';
      }
    });
  }

  if (quickNav && isMobile) {
    document.addEventListener('click', function(event) {
      if (quickNav.classList.contains('expanded') && !quickNav.contains(event.target)) {
        quickNav.classList.remove('expanded');
        quickNav.style.width = '32px';
        quickNav.style.padding = '8px 4px';
        const content = quickNav.querySelector('.quick-nav-content');
        if (content) content.style.display = 'none';
        const title = quickNav.querySelector('.quick-nav-title');
        if (title) {
          title.style.writingMode = 'vertical-rl';
          title.style.marginBottom = '4px';
          title.style.paddingBottom = '0';
          title.style.borderBottom = 'none';
        }
        const hint = quickNav.querySelector('.quick-nav-hint');
        if (hint) hint.style.display = 'block';
      }
    });
  }

  const currentPathElement = document.getElementById('current-path');
  if (currentPathElement) { currentPathElement.textContent = getCurrentPath(); }

  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) { backToTopBtn.addEventListener('click', scrollToTop); }
  const navHubBtn = document.querySelector('.nav-hub');
  if (navHubBtn) { navHubBtn.addEventListener('click', openNavigator); }
});
</script>`;
};

const MATHJAX_HEAD = `<script>
MathJax = {
  tex: { inlineMath: [['$', '$'], ['\\\\(', '\\\\)']], displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']] },
  svg: { fontCache: 'global' }
};
</script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>`;

/**
 * 生成完整的文章页 HTML
 * @param data 表单数据
 * @param categoryDir 目标分类目录（相对 library/，如 'paper'、'misc/experimental'）；
 *                    默认 'paper'。目录越深，相对路径的 ../ 前缀越多
 * @returns 完整 HTML 字符串（可直接 PUT 到 library/{categoryDir}/{标题}.html）
 */
export function generateArticleHtml(data: ArticleFormData, categoryDir = 'paper'): string {
  const dateCN = formatDateCN(data.createDate);
  const titleSafe = escapeHtml(data.title);

  // 相对路径前缀：
  // - 站点根级资源（css/logo/index/navigator/js）：'../' × (目录深度 + 1)
  // - 图书馆级页面（intro/rule/feature，位于 library/ 下）：'../' × 目录深度
  const depth = (categoryDir || 'paper').split('/').filter(Boolean).length;
  const rootPrefix = '../'.repeat(depth + 1); // paper → ../../，misc/experimental → ../../../
  const libPrefix = '../'.repeat(depth); // paper → ../，misc/experimental → ../../

  // 脚注引用：将正文中的 [^n] 替换为上标可点击引用（链接到页脚解释处）
  // 1) 先保护代码块/行内代码，避免其中的字面 [n] 被误替换
  // 2) 编号超出脚注列表范围的引用保留原文（避免悬空锚点）
  const codeSpans: string[] = [];
  const protectedMd = (data.bodyMarkdown || '').replace(
    /(```[\s\S]*?```|`[^`\n]*`)/g,
    (m) => {
      codeSpans.push(m);
      return `\u0000${codeSpans.length - 1}\u0000`;
    },
  );
  const footnoteCount = data.footnotes?.length ?? 0;
  const bodyWithFootnotes = protectedMd
    .replace(/\[\^(\d+)\]/g, (match, n: string) => {
      const idx = parseInt(n, 10);
      if (idx < 1 || idx > footnoteCount) return match;
      return `<sup class="article-footnote-ref" id="article-fnref-${n}"><a href="#article-fn-${n}">[${n}]</a></sup>`;
    })
    .replace(/\u0000(\d+)\u0000/g, (_, i) => codeSpans[parseInt(i, 10)]);
  const bodyHtml = marked.parse(bodyWithFootnotes, { async: false }) as string;

  // 元数据项
  const metaItems: string[] = [
    `      <div class="article-meta-item">
          <span class="article-meta-label">作者：</span>
          <span class="article-meta-value">${escapeHtml(data.author)}</span>
        </div>`,
    `      <div class="article-meta-item">
          <span class="article-meta-label">创建日期：</span>
          <span class="article-meta-value">${dateCN}</span>
        </div>`,
    `      <div class="article-meta-item">
          <span class="article-meta-label">文章性质：</span>
          <span class="article-meta-value">${renderTypeBadge(data.articleType)}</span>
        </div>`,
    `      <div class="article-meta-item">
          <span class="article-meta-label">标签：</span>
          <span class="article-meta-value">
        ${renderTags(data.tags)}
          </span>
        </div>`,
  ];

  // hidden 标记（供编辑时读取，不展示给用户）
  if (data.hidden) {
    metaItems.push(`      <div class="article-meta-item" style="display:none" data-article-hidden="true">
          <span class="article-meta-label">隐藏状态：</span>
          <span class="article-meta-value">是</span>
        </div>`);
  }

  // 录音文章追加录音时长
  if (data.articleType === '录音文章' && data.recordingDuration) {
    metaItems.push(`      <div class="article-meta-item">
          <span class="article-meta-label">录音时长：</span>
          <span class="article-meta-value">${escapeHtml(data.recordingDuration)}</span>
        </div>`);
  }

  // 脚注列表（与补充说明同级，渲染在页脚）
  const footnoteItems = (data.footnotes || [])
    .map((text, i) => {
      const n = i + 1;
      const content = text.trim();
      if (!content) return '';
      return `<span class="article-footnote-item" id="article-fn-${n}">[${n}] ${escapeHtml(content)} <a href="#article-fnref-${n}" class="article-footnote-back" title="返回正文">↩</a></span>`;
    })
    .filter(Boolean)
    .join('\n          ');

  // 可选 footer-meta（补充说明 + 脚注同级）
  const footerParts: string[] = [];
  if (data.footerNote) {
    footerParts.push(`        <div class="article-footer-meta-item">
          <span class="article-footer-label">补充说明：</span>
          <span class="article-footer-value">${escapeHtml(data.footerNote)}</span>
        </div>`);
  }
  if (footnoteItems) {
    footerParts.push(`        <div class="article-footer-meta-item">
          <span class="article-footer-label">脚注：</span>
          <span class="article-footer-value article-footnote-list">${footnoteItems}</span>
        </div>`);
  }
  const footerMeta = footerParts.length
    ? `\n\n      <div class="article-footer-meta">\n${footerParts.join('\n')}\n      </div>`
    : '';

  // 脚注相关样式（上标引用 + 页脚条目）：正文有 [n] 引用或页脚有脚注时注入
  const hasFootnoteRefs = /\[\^\d+\]/.test(data.bodyMarkdown || '');
  const footnoteStyle = footnoteItems || hasFootnoteRefs
    ? `\n<style>
.article-footnote-ref a { text-decoration: none; color: var(--color-accent); font-weight: 600; }
.article-footnote-list { font-style: normal; }
.article-footnote-item { display: block; margin: 3px 0; font-style: normal; line-height: 1.7; }
.article-footnote-back { text-decoration: none; color: var(--color-accent); margin-left: 4px; font-weight: 600; }
</style>`
    : '';

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>牧羊人图书馆 - ${titleSafe}</title>
<meta name="description" content="牧羊人图书馆 - 存放所有知识之地">
<meta name="keywords" content="图书馆,知识,学习,牧羊人">
<link rel="stylesheet" href="${rootPrefix}css/style.css">
${footnoteStyle}
${data.includeMathJax ? MATHJAX_HEAD : ''}
</head>
<body>
<header>
<div class="gjs-row main-container">
  <div class="gjs-cell logo-align"><div class="logo-header-row"><img src="${rootPrefix}image/logo.png" class="logo-border logo-container logo-img-custom"><img src="${rootPrefix}image/logo_text.png" class="logo-size logo-size-custom"></div>
    <div class="slogan-container">
      <hr class="slogan-line slogan-line-left">
      <span class="slogan-text">存放所有知识之地</span>
      <hr class="slogan-line slogan-line-right">
    </div>
    <div class="section-padding page-title-main">${titleSafe}</div>
  </div>
</div>
</header>

<main>
<div class="gjs-row content-row content-bg-white">
  <div class="content-width-limiter">
    <div class="gjs-cell content-main">
      <div class="article-meta">
${metaItems.join('\n')}
      </div>

      <div class="left-align">
        ${bodyHtml}
      </div>${footerMeta}

    </div>
  </div>
</div>
</main>

<footer>
<div class="gjs-row footer-row footer-row-alt footer-gradient">
  <div class="gjs-cell nav-center">
    <div class="padding-10 copyright-color copyright-text">&copy; 2026 薛柯道 KeDao Xue 牧羊人图书馆 Shepherd's Library<br>保留所有权利 未经许可，不得擅自转载、修改或用于商业用途<br></div>
  </div>
</footer>

<div class="mobile-nav">
  <div class="mobile-nav-title">便携式导航仪</div>
  <div class="mobile-nav-links">
    <a href="${rootPrefix}index.html" class="mobile-nav-link">图书馆主页</a>
    <a href="${libPrefix}intro.html" class="mobile-nav-link">图书馆入门</a>
    <a href="${libPrefix}rule.html" class="mobile-nav-link">图书馆规则</a>
    <a href="${libPrefix}feature.html" class="mobile-nav-link">图书馆功能</a>
    <a href="${rootPrefix}navigator.html" target="_blank" class="mobile-nav-link">导航枢纽</a>
  </div>
</div>

<div class="quick-nav">
  <div class="quick-nav-title">便携式导航仪</div>
  <div class="quick-nav-hint">光标移到此处展开</div>
  <div class="quick-nav-content">
    <a href="${rootPrefix}index.html" class="quick-nav-item">图书馆主页</a>
    <a href="${libPrefix}intro.html" class="quick-nav-item">图书馆入门</a>
    <a href="${libPrefix}rule.html" class="quick-nav-item">图书馆规则</a>
    <a href="${libPrefix}feature.html" class="quick-nav-item">图书馆功能</a>
  </div>
</div>

<button title="回到顶部" class="float-button back-to-top" onclick="scrollToTop()">
  回到<br>顶部
</button>

<button title="导航枢纽" class="float-button nav-hub" onclick="openNavigator()">
  导航<br>枢纽
</button>

${ARTICLE_SCRIPT(data.title, rootPrefix)}
<script src="${rootPrefix}js/library-dynamic.js"></script>
</body>
</html>
`;
}
