// 文章页 HTML 模板生成器
// 以 library/paper/ 下实际文章页结构为权威参考，产出完整可部署的 HTML
import { marked } from 'marked';
import type { ArticleFormData, ArticleTagName } from '../types';

/** 将 YYYY-MM-DD 格式化为 YYYY年M月D日 */
export function formatDateCN(dateStr: string): string {
  const m = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return dateStr;
  return `${m[1]}年${parseInt(m[2], 10)}月${parseInt(m[3], 10)}日`;
}

/** 渲染标签 spans */
function renderTags(tags: ArticleTagName[]): string {
  if (!tags.length) return '<span class="article-tag">无</span>';
  return tags
    .map((tag) => {
      if (tag === '包含AI') return '<span class="article-tag tag-ai">包含AI</span>';
      if (tag === '有删减') return '<span class="article-tag tag-edited">有删减</span>';
      return `<span class="article-tag">${tag}</span>`;
    })
    .join('\n        ');
}

/** 文章页内联脚本块（各页相同，仅 PAGE_DISPLAY_NAME 不同） */
const ARTICLE_SCRIPT = (displayName: string) => `<script>
const PAGE_DISPLAY_NAME = '${displayName.replace(/'/g, "\\'")}';

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openNavigator() {
  window.open('../../navigator.html', '_blank');
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
 * @returns 完整 HTML 字符串（可直接 PUT 到 library/paper/{标题}.html）
 */
export function generateArticleHtml(data: ArticleFormData): string {
  const dateCN = formatDateCN(data.createDate);
  const bodyHtml = marked.parse(data.bodyMarkdown || '', { async: false }) as string;

  // 元数据项
  const metaItems: string[] = [
    `      <div class="article-meta-item">
          <span class="article-meta-label">作者：</span>
          <span class="article-meta-value">${data.author}</span>
        </div>`,
    `      <div class="article-meta-item">
          <span class="article-meta-label">创建日期：</span>
          <span class="article-meta-value">${dateCN}</span>
        </div>`,
    `      <div class="article-meta-item">
          <span class="article-meta-label">文章类型：</span>
          <span class="article-meta-value"><span class="article-type-badge">${data.articleType}</span></span>
        </div>`,
    `      <div class="article-meta-item">
          <span class="article-meta-label">标签：</span>
          <span class="article-meta-value">
        ${renderTags(data.tags)}
          </span>
        </div>`,
  ];

  // 录音文章追加录音时长
  if (data.articleType === '录音文章' && data.recordingDuration) {
    metaItems.push(`      <div class="article-meta-item">
          <span class="article-meta-label">录音时长：</span>
          <span class="article-meta-value">${data.recordingDuration}</span>
        </div>`);
  }

  // 可选 footer-meta
  const footerMeta = data.footerNote
    ? `\n\n      <div class="article-footer-meta">
        <div class="article-footer-meta-item">
          <span class="article-footer-label">补充说明：</span>
          <span class="article-footer-value">${data.footerNote}</span>
        </div>
      </div>`
    : '';

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>牧羊人图书馆 - ${data.title}</title>
<meta name="description" content="牧羊人图书馆 - 存放所有知识之地">
<meta name="keywords" content="图书馆,知识,学习,牧羊人">
<link rel="stylesheet" href="../../css/style.css">
${data.includeMathJax ? MATHJAX_HEAD : ''}
</head>
<body>
<header>
<div class="gjs-row main-container">
  <div class="gjs-cell logo-align"><div class="logo-header-row"><img src="../../image/logo.png" class="logo-border logo-container logo-img-custom"><img src="../../image/logo_text.png" class="logo-size logo-size-custom"></div>
    <div class="slogan-container">
      <hr class="slogan-line slogan-line-left">
      <span class="slogan-text">存放所有知识之地</span>
      <hr class="slogan-line slogan-line-right">
    </div>
    <div class="section-padding page-title-main">${data.title}</div>
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
    <a href="../../index.html" class="mobile-nav-link">图书馆主页</a>
    <a href="../intro.html" class="mobile-nav-link">图书馆入门</a>
    <a href="../rule.html" class="mobile-nav-link">图书馆规则</a>
    <a href="../feature.html" class="mobile-nav-link">图书馆功能</a>
    <a href="../../navigator.html" target="_blank" class="mobile-nav-link">导航枢纽</a>
  </div>
</div>

<div class="quick-nav">
  <div class="quick-nav-title">便携式导航仪</div>
  <div class="quick-nav-hint">光标移到此处展开</div>
  <div class="quick-nav-content">
    <a href="../../index.html" class="quick-nav-item">图书馆主页</a>
    <a href="../intro.html" class="quick-nav-item">图书馆入门</a>
    <a href="../rule.html" class="quick-nav-item">图书馆规则</a>
    <a href="../feature.html" class="quick-nav-item">图书馆功能</a>
  </div>
</div>

<button title="回到顶部" class="float-button back-to-top" onclick="scrollToTop()">
  回到<br>顶部
</button>

<button title="导航枢纽" class="float-button nav-hub" onclick="openNavigator()">
  导航<br>枢纽
</button>

${ARTICLE_SCRIPT(data.title)}
<script src="../../js/library-dynamic.js"></script>
</body>
</html>
`;
}
