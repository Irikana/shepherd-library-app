// 文章 HTML 元数据解析与更新（编辑已有文章时使用）
// 解析 generateArticleHtml 产出的 HTML 结构，提取元数据；更新时仅替换元数据区段，保留正文 HTML
import { marked } from 'marked';
import type { ArticleFormData, ArticleType } from '../types';
import { ARTICLE_CATEGORIES } from './article-sync';
import { formatDateCN } from '../templates/article';

/** 判断 HTML 是否为 App 生成的文章页 */
export function isArticleHtml(html: string): boolean {
  return html.includes('class="article-meta"') && html.includes('class="page-title-main"');
}

/** 提取标签内纯文本（去嵌套标签 + trim） */
function extractText(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

/** 将 "YYYY年M月D日" 转为 "YYYY-MM-DD" */
function parseDateCN(dateCN: string): string {
  const m = dateCN.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (!m) return dateCN;
  return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
}

/** HTML 转义（用于更新时写回元数据值） */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 从文章 HTML 解析元数据
 * @param html 文章页 HTML
 * @param filePath 文件在仓库中的路径（用于推断分类）
 * @returns ArticleFormData 或 null（非文章页时）
 */
export function parseArticleMetadata(html: string, filePath: string): ArticleFormData | null {
  if (!isArticleHtml(html)) return null;

  // 标题：从 page-title-main 提取
  const titleMatch = html.match(/<div class="section-padding page-title-main">([\s\S]*?)<\/div>/);
  const title = titleMatch ? extractText(titleMatch[1]) : '';

  // 作者
  const authorMatch = html.match(/作者：<\/span>\s*<span class="article-meta-value">([\s\S]*?)<\/span>/);
  const author = authorMatch ? extractText(authorMatch[1]) : '';

  // 创建日期
  const dateMatch = html.match(/创建日期：<\/span>\s*<span class="article-meta-value">([\s\S]*?)<\/span>/);
  const createDate = dateMatch ? parseDateCN(extractText(dateMatch[1])) : '';

  // 文章性质
  const typeMatch = html.match(/<span class="article-type-badge[^"]*">([\s\S]*?)<\/span>/);
  const articleType = (typeMatch ? extractText(typeMatch[1]) : '信息文章') as ArticleType;

  // 标签
  const tagsSectionMatch = html.match(/标签：<\/span>\s*<span class="article-meta-value">\s*([\s\S]*?)<\/span>/);
  const tags: string[] = [];
  if (tagsSectionMatch) {
    const tagRegex = /<span class="article-tag[^"]*">([\s\S]*?)<\/span>/g;
    let m: RegExpExecArray | null;
    while ((m = tagRegex.exec(tagsSectionMatch[1])) !== null) {
      const tagText = extractText(m[1]);
      if (tagText && tagText !== '无') tags.push(tagText);
    }
  }

  // 录音时长
  const recMatch = html.match(/录音时长：<\/span>\s*<span class="article-meta-value">([\s\S]*?)<\/span>/);
  const recordingDuration = recMatch ? extractText(recMatch[1]) : '';

  // 补充说明
  const footerMatch = html.match(/补充说明：<\/span>\s*<span class="article-footer-value">([\s\S]*?)<\/span>/);
  const footerNote = footerMatch ? extractText(footerMatch[1]) : '';

  // 脚注
  const footnotes: string[] = [];
  const fnRegex = /<span class="article-footnote-item"[^>]*>\[(\d+)\]\s*([\s\S]*?)\s*<a[^>]*>↩<\/a><\/span>/g;
  let fnm: RegExpExecArray | null;
  while ((fnm = fnRegex.exec(html)) !== null) {
    footnotes.push(extractText(fnm[2]));
  }

  // MathJax
  const includeMathJax = html.includes('MathJax-script');

  // 分类：从文件路径推断
  let category = 'normal';
  if (filePath.startsWith('library/')) {
    const subPath = filePath.slice('library/'.length);
    for (const c of ARTICLE_CATEGORIES) {
      if (subPath.startsWith(c.dir + '/')) {
        category = c.key;
        break;
      }
    }
  }

  // 是否新闻：检查标签中是否有「新闻」
  const isNews = tags.includes('新闻');

  // 英文标题：从文件名提取
  const fileName = filePath.split('/').pop() || '';
  const titleEn = fileName.replace(/\.html?$/, '');

  return {
    title,
    titleEn,
    author,
    createDate,
    articleType,
    tags,
    recordingDuration,
    bodyMarkdown: '', // 编辑已有文章时不使用 Markdown，保留原始 HTML body
    footerNote,
    footnotes,
    includeMathJax,
    category,
    isNews,
    hidden: false,
  };
}

/** 渲染标签 spans（与 article.ts 模板一致） */
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

/** 渲染文章性质徽标 */
function renderTypeBadge(articleType: string): string {
  if (articleType === '实验性文章') {
    return '<span class="article-type-badge type-experimental">实验性文章</span>';
  }
  return `<span class="article-type-badge">${escapeHtml(articleType)}</span>`;
}

/** 构建元数据区段 HTML（与 article.ts generateArticleHtml 一致） */
function buildMetaSection(form: ArticleFormData): string {
  const dateCN = formatDateCN(form.createDate);
  const metaItems: string[] = [
    `      <div class="article-meta-item">
          <span class="article-meta-label">作者：</span>
          <span class="article-meta-value">${escapeHtml(form.author)}</span>
        </div>`,
    `      <div class="article-meta-item">
          <span class="article-meta-label">创建日期：</span>
          <span class="article-meta-value">${dateCN}</span>
        </div>`,
    `      <div class="article-meta-item">
          <span class="article-meta-label">文章性质：</span>
          <span class="article-meta-value">${renderTypeBadge(form.articleType)}</span>
        </div>`,
    `      <div class="article-meta-item">
          <span class="article-meta-label">标签：</span>
          <span class="article-meta-value">
        ${renderTags(form.tags)}
          </span>
        </div>`,
  ];

  if (form.articleType === '录音文章' && form.recordingDuration) {
    metaItems.push(`      <div class="article-meta-item">
          <span class="article-meta-label">录音时长：</span>
          <span class="article-meta-value">${escapeHtml(form.recordingDuration)}</span>
        </div>`);
  }

  return `      <div class="article-meta">
${metaItems.join('\n')}
      </div>`;
}

/** 构建页脚元数据区段（补充说明 + 脚注） */
function buildFooterMeta(form: ArticleFormData): string {
  const parts: string[] = [];

  if (form.footerNote) {
    parts.push(`        <div class="article-footer-meta-item">
          <span class="article-footer-label">补充说明：</span>
          <span class="article-footer-value">${escapeHtml(form.footerNote)}</span>
        </div>`);
  }

  if (form.footnotes.length) {
    const footnoteItems = form.footnotes
      .map((text, i) => {
        const n = i + 1;
        const content = text.trim();
        if (!content) return '';
        return `<span class="article-footnote-item" id="article-fn-${n}">[${n}] ${escapeHtml(content)} <a href="#article-fnref-${n}" class="article-footnote-back" title="返回正文">↩</a></span>`;
      })
      .filter(Boolean)
      .join('\n          ');

    if (footnoteItems) {
      parts.push(`        <div class="article-footer-meta-item">
          <span class="article-footer-label">脚注：</span>
          <span class="article-footer-value article-footnote-list">${footnoteItems}</span>
        </div>`);
    }
  }

  return parts.length
    ? `\n\n      <div class="article-footer-meta">\n${parts.join('\n')}\n      </div>`
    : '';
}

/** MathJax 脚本块 */
const MATHJAX_HEAD = `<script>
MathJax = {
  tex: { inlineMath: [['$', '$'], ['\\\\(', '\\\\)']], displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']] },
  svg: { fontCache: 'global' }
};
</script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>`;

/** 脚注样式块 */
const FOOTNOTE_STYLE = `\n<style>
.article-footnote-ref a { text-decoration: none; color: var(--color-accent); font-weight: 600; }
.article-footnote-list { font-style: normal; }
.article-footnote-item { display: block; margin: 3px 0; font-style: normal; line-height: 1.7; }
.article-footnote-back { text-decoration: none; color: var(--color-accent); margin-left: 4px; font-weight: 600; }
</style>`;

/**
 * 将更新后的元数据写回文章 HTML（保留正文 HTML 不变）
 * @param html 原始文章 HTML（或源码编辑器中修改后的 HTML）
 * @param form 更新后的元数据
 * @returns 合并后的完整 HTML
 */
export function updateArticleHtml(html: string, form: ArticleFormData): string {
  let result = html;

  // 1. 更新 <title> 标签
  result = result.replace(
    /<title>牧羊人图书馆 - [\s\S]*?<\/title>/,
    `<title>牧羊人图书馆 - ${escapeHtml(form.title)}</title>`,
  );

  // 2. 更新 page-title-main 标题
  result = result.replace(
    /<div class="section-padding page-title-main">[\s\S]*?<\/div>/,
    `<div class="section-padding page-title-main">${escapeHtml(form.title)}</div>`,
  );

  // 3. 替换元数据区段（从 <div class="article-meta"> 到 <div class="left-align"> 之前）
  const newMetaSection = buildMetaSection(form);
  result = result.replace(
    /<div class="article-meta">[\s\S]*?(?=<div class="left-align">)/,
    newMetaSection + '\n\n      ',
  );

  // 4. 替换页脚元数据区段（补充说明 + 脚注）
  const newFooterMeta = buildFooterMeta(form);
  // 移除已有的 article-footer-meta 区段
  result = result.replace(/\n\n      <div class="article-footer-meta">[\s\S]*?<\/div>\n      <\/div>/, '');
  result = result.replace(/\n\n      <div class="article-footer-meta">[\s\S]*?<\/div>/, '');
  // 在 left-align 的 </div> 后插入新的页脚元数据
  // left-align 区段结构：<div class="left-align"> ... </div>${footerMeta}
  // 需要找到 left-align 的闭合 </div>，在其后插入
  const leftAlignEnd = result.indexOf('<div class="left-align">');
  if (leftAlignEnd >= 0) {
    // 从 left-align 开始，找到对应的闭合 </div>（考虑嵌套）
    let pos = leftAlignEnd;
    let depth = 0;
    while (pos < result.length) {
      const openIdx = result.indexOf('<div', pos);
      const closeIdx = result.indexOf('</div>', pos);
      if (closeIdx < 0) break;
      if (openIdx >= 0 && openIdx < closeIdx) {
        depth++;
        pos = openIdx + 4;
      } else {
        depth--;
        pos = closeIdx + 6;
        if (depth === 0) break;
      }
    }
    // pos 现在指向 left-align 闭合 </div> 之后
    result = result.slice(0, pos) + newFooterMeta + result.slice(pos);
  }

  // 5. 切换 MathJax 脚本
  const hasMathJax = result.includes('MathJax-script');
  if (form.includeMathJax && !hasMathJax) {
    // 添加 MathJax（在 </head> 前）
    result = result.replace('</head>', `${MATHJAX_HEAD}\n</head>`);
  } else if (!form.includeMathJax && hasMathJax) {
    // 移除 MathJax 脚本块
    result = result.replace(/<script>\s*MathJax\s*=\s*\{[\s\S]*?\};\s*<\/script>\s*<script id="MathJax-script"[\s\S]*?<\/script>\n?/, '');
  }

  // 6. 切换脚注样式（有脚注时添加，无脚注时移除）
  const hasFootnoteStyle = result.includes('.article-footnote-ref a');
  const needsFootnoteStyle = form.footnotes.some((f) => f.trim()) || /\[\^\d+\]/.test(form.bodyMarkdown || '');
  if (needsFootnoteStyle && !hasFootnoteStyle) {
    result = result.replace('</head>', `${FOOTNOTE_STYLE}\n</head>`);
  } else if (!needsFootnoteStyle && hasFootnoteStyle) {
    result = result.replace(/\n?<style>\s*\.article-footnote-ref[\s\S]*?<\/style>/, '');
  }

  return result;
}

/**
 * 定位正文区段 <div class="left-align">…</div> 的范围（深度匹配嵌套 div，支持正文中的视觉组件）
 * @returns { start, end }：start 为开标签结束（内容起点），end 为闭合 </div> 的起点（内容终点）
 */
function findLeftAlignRange(html: string): { start: number; end: number } | null {
  const openTag = '<div class="left-align">';
  const openIdx = html.indexOf(openTag);
  if (openIdx < 0) return null;
  const start = openIdx + openTag.length;
  let pos = start;
  // left-align 开标签自身占一层，所以从 1 开始；内容里每遇到一个 <div> 加一层
  let depth = 1;
  while (pos < html.length) {
    const openDiv = html.indexOf('<div', pos);
    const closeDiv = html.indexOf('</div>', pos);
    if (closeDiv < 0) break; // 结构不完整，视为无正文区段
    if (openDiv >= 0 && openDiv < closeDiv) {
      depth++;
      pos = openDiv + 4;
    } else {
      depth--;
      pos = closeDiv + 6;
      if (depth === 0) {
        return { start, end: closeDiv };
      }
    }
  }
  return null;
}

/** 提取正文区段内部 HTML（不含 left-align 开闭标签），非文章结构或未找到时返回 null */
export function extractBodyHtml(html: string): string | null {
  const range = findLeftAlignRange(html);
  if (!range) return null;
  return html.slice(range.start, range.end).trim();
}

/** 用新正文 HTML 替换 left-align 区段内部内容；未找到正文区段时原样返回 */
export function replaceBodyHtml(html: string, bodyHtml: string): string {
  const range = findLeftAlignRange(html);
  if (!range) return html;
  const inner = bodyHtml.trim();
  return html.slice(0, range.start) + '\n        ' + inner + '\n      ' + html.slice(range.end);
}

/**
 * 将正文 Markdown 渲染为正文区段 HTML（含脚注上标引用）。
 * 与 article.ts 模板的脚注逻辑一致：[^n] 转 <sup class="article-footnote-ref">…</sup>，
 * 代码块/行内代码中的字面 [^n] 保护不替换，编号超出脚注列表范围的引用保留原文。
 */
export function markdownToBodyHtml(markdown: string, footnotes: string[]): string {
  const codeSpans: string[] = [];
  const protectedMd = (markdown ?? '').replace(
    /(```[\s\S]*?```|`[^`\n]*`)/g,
    (m) => {
      codeSpans.push(m);
      return `\u0000${codeSpans.length - 1}\u0000`;
    },
  );
  const footnoteCount = footnotes?.length ?? 0;
  const bodyWithFootnotes = protectedMd
    .replace(/\[\^(\d+)\]/g, (match, n: string) => {
      const idx = parseInt(n, 10);
      if (idx < 1 || idx > footnoteCount) return match;
      return `<sup class="article-footnote-ref" id="article-fnref-${n}"><a href="#article-fn-${n}">[${n}]</a></sup>`;
    })
    .replace(/\u0000(\d+)\u0000/g, (_, i) => codeSpans[parseInt(i, 10)]);
  return marked.parse(bodyWithFootnotes, { async: false }) as string;
}
