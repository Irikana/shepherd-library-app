// 文章 HTML 元数据解析与更新（编辑已有文章时使用）
// 解析 generateArticleHtml 产出的 HTML 结构，提取元数据；更新时仅替换元数据区段，保留正文 HTML
import { marked } from 'marked';
import type { ArticleFormData, ArticleType } from '../types';
import { ARTICLE_CATEGORIES } from './article-sync';
import { formatDateCN, renderTags } from '../templates/article';
import type { TagColorMap } from './tag-colors';

/** 判断 HTML 是否为 App 生成的文章页（class token 匹配，兼容 class="section-padding page-title-main" 多类名） */
function hasClassToken(html: string, token: string): boolean {
  return new RegExp(`class="[^"]*\\b${token}\\b`).test(html);
}

export function isArticleHtml(html: string): boolean {
  return hasClassToken(html, 'article-meta') && hasClassToken(html, 'page-title-main');
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
  // 注意：捕获区段必须到 article-meta-value 的闭合 </span> 及其所属 </div>，
  // 否则非贪婪的 [\s\S]*? 会在第一个标签的 </span> 处截断，导致标签解析为空
  const tagsSectionMatch = html.match(/标签：<\/span>\s*<span class="article-meta-value">\s*([\s\S]*?)<\/span>\s*<\/div>/);
  const tags: string[] = [];
  if (tagsSectionMatch) {
    // 兼容带内联颜色样式的标签：<span class="article-tag tag-ai" style="...">
    const tagRegex = /<span class="article-tag[^"]*"[^>]*>([\s\S]*?)<\/span>/g;
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

  // 隐藏状态：从 data-article-hidden 属性读取（编辑已有文章时使用）
  const hidden = html.includes('data-article-hidden="true"');

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
    hidden,
  };
}

/** 渲染文章性质徽标 */
function renderTypeBadge(articleType: string): string {
  if (articleType === '实验性文章') {
    return '<span class="article-type-badge type-experimental">实验性文章</span>';
  }
  return `<span class="article-type-badge">${escapeHtml(articleType)}</span>`;
}

/** 构建元数据区段 HTML（与 article.ts generateArticleHtml 一致） */
function buildMetaSection(form: ArticleFormData, tagColors: TagColorMap = {}): string {
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
        ${renderTags(form.tags, tagColors)}
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
 * @param tagColors 标签颜色表（站点配置 tagColors）；设置过颜色的标签会带内联样式
 * @returns 合并后的完整 HTML
 */
export function updateArticleHtml(html: string, form: ArticleFormData, tagColors: TagColorMap = {}): string {
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

  // 3. 替换元数据区段（深度匹配 article-meta 自身闭合，兼容其后为任意正文结构的页面）
  const newMetaSection = buildMetaSection(form, tagColors);
  const metaOpen = findDivByClassToken(result, 'article-meta');
  if (metaOpen >= 0) {
    const metaClose = matchDivEnd(result, metaOpen);
    if (metaClose >= 0) {
      // 保留 meta 开标签前的原有缩进（newMetaSection 首行缩进去掉，避免双重缩进）
      result = result.slice(0, metaOpen) + newMetaSection.trimStart() + result.slice(metaClose + '</div>'.length);
    }
  }

  // 4. 替换页脚元数据区段（补充说明 + 脚注）
  // 移除已有的 article-footer-meta 区段（深度匹配，倒序逐个移除）
  for (;;) {
    const footerOpen = findFooterMetaOpen(result);
    if (footerOpen < 0) break;
    const footerClose = matchDivEnd(result, footerOpen);
    if (footerClose < 0) break;
    // 连同区段前的空白一起移除，保持缩进整洁
    let cutStart = footerOpen;
    while (cutStart > 0 && (result[cutStart - 1] === ' ' || result[cutStart - 1] === '\t')) cutStart--;
    if (result[cutStart - 1] === '\n') cutStart--;
    result = result.slice(0, cutStart) + result.slice(footerClose + '</div>'.length);
  }
  // 插入到正文区段末尾（left-align / story-work / 多段正文等任意结构的容器闭合之前）
  const newFooterMeta = buildFooterMeta(form);
  const bodyRange = findMetaBodyRange(result);
  if (bodyRange) {
    result = result.slice(0, bodyRange.end) + newFooterMeta + result.slice(bodyRange.end);
  } else {
    const leftAlignEnd = result.indexOf('<div class="left-align">');
    if (leftAlignEnd >= 0) {
      const laClose = matchDivEnd(result, leftAlignEnd);
      if (laClose >= 0) {
        const pos = laClose + '</div>'.length;
        result = result.slice(0, pos) + newFooterMeta + result.slice(pos);
      }
    }
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

  // 7. 同步 hidden 标记（编辑已有文章时：添加或移除 data-article-hidden 标记）
  const hasHidden = result.includes('data-article-hidden="true"');
  if (form.hidden && !hasHidden) {
    // 添加 hidden 标记到 article-meta 区段内
    result = result.replace(
      '<div class="article-meta">',
      `<div class="article-meta">\n      <div class="article-meta-item" style="display:none" data-article-hidden="true">
          <span class="article-meta-label">隐藏状态：</span>
          <span class="article-meta-value">是</span>
        </div>`,
    );
  } else if (!form.hidden && hasHidden) {
    // 移除 hidden 标记行
    result = result.replace(
      /\n\s*<div class="article-meta-item" style="display:none" data-article-hidden="true">[\s\S]*?<\/div>/,
      '',
    );
  }

  return result;
}

/**
 * 从 openIdx（'<tag' 起点）找到该标签的匹配闭合 '</tag>' 的起点；结构不完整返回 -1
 * 朴素深度匹配（网站页面均为结构规整的 HTML，无同名嵌套歧义）
 */
function matchTagEnd(html: string, openIdx: number, tag: string): number {
  const openRe = new RegExp(`<${tag}\\b`, 'gi');
  const closeRe = new RegExp(`</${tag}>`, 'gi');
  let pos = openIdx;
  let depth = 0;
  while (pos < html.length) {
    openRe.lastIndex = pos;
    closeRe.lastIndex = pos;
    const om = openRe.exec(html);
    const cm = closeRe.exec(html);
    if (!cm) return -1;
    if (om && om.index < cm.index) {
      depth++;
      pos = om.index + tag.length + 1;
    } else {
      depth--;
      pos = cm.index + tag.length + 3;
      if (depth === 0) return cm.index;
    }
  }
  return -1;
}

/** div 版匹配（meta/容器深度定位用） */
function matchDivEnd(html: string, openIdx: number): number {
  return matchTagEnd(html, openIdx, 'div');
}

/** 在 html 中查找 class token 精确匹配 token 的 <div 起点（class="article-meta-item" 不算 "article-meta"） */
function findDivByClassToken(html: string, token: string, from = 0): number {
  const re = /<div\b[^>]*\bclass="([^"]*)"[^>]*>/g;
  re.lastIndex = from;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m[1].split(/\s+/).includes(token)) return m.index;
  }
  return -1;
}

/** 页脚元数据区段起点（补充说明/脚注所在 div，不属于正文）；未找到返回 -1 */
function findFooterMetaOpen(html: string, from = 0): number {
  return findDivByClassToken(html, 'article-footer-meta', from);
}

/**
 * 找 childOpen（'<div' 起点）所在 div 的直接父 div 开标签起点：
 * 从文档头开始用栈配对 <div>/</div>，childOpen 之前栈顶即父容器；找不到返回 -1
 */
function findParentDivOpen(html: string, childOpen: number): number {
  const re = /<div\b|<\/div>/gi;
  const stack: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m.index >= childOpen) break;
    if (m[0][1] === '/') stack.pop();
    else stack.push(m.index);
  }
  return stack.length > 0 ? stack[stack.length - 1] : -1;
}

/**
 * 定位正文区段范围：article-meta 之后、所属容器闭合之前（多段 left-align、story-work、
 * 练习分区等任意正文结构都能覆盖），有 article-footer-meta 时截止到它之前。
 * @returns { start, end }：start 为 meta 闭合之后（正文起点），end 为正文终点（容器/页脚 meta 的闭合标签起点）
 */
function findMetaBodyRange(html: string): { start: number; end: number } | null {
  const metaOpen = findDivByClassToken(html, 'article-meta');
  if (metaOpen < 0) return null;
  const metaClose = matchDivEnd(html, metaOpen);
  if (metaClose < 0) return null;
  const parentStart = findParentDivOpen(html, metaOpen);
  if (parentStart < 0) return null;
  const parentClose = matchDivEnd(html, parentStart);
  if (parentClose < 0 || parentClose <= metaClose) return null;
  const start = metaClose + '</div>'.length;
  let end = parentClose;
  const footerOpen = findFooterMetaOpen(html, start);
  if (footerOpen >= 0 && footerOpen < end) end = footerOpen;
  if (html.slice(start, end).trim().length === 0 && html.slice(start, end).indexOf('<') < 0) {
    // meta 与容器闭合之间只有空白：视为无正文区段
    return null;
  }
  return { start, end };
}

/**
 * 定位正文区段 <div class="left-align">…</div> 的范围（深度匹配嵌套 div，支持正文中的视觉组件）
 * 兼容没有 article-meta 的旧页面；多段 left-align 时取第一段（整体还原由 findMetaBodyRange 负责）
 * @returns { start, end }：start 为开标签结束（内容起点），end 为闭合 </div> 的起点（内容终点）
 */
function findLeftAlignRange(html: string): { start: number; end: number } | null {
  const openTag = '<div class="left-align">';
  const openIdx = html.indexOf(openTag);
  if (openIdx < 0) return null;
  const start = openIdx + openTag.length;
  const closeIdx = matchDivEnd(html, openIdx);
  if (closeIdx < 0) return null; // 结构不完整，视为无正文区段
  return { start, end: closeIdx };
}

/** 解析区段内的顶层块（div 元素 + 非 div 内容），忽略纯空白；无法安全解析时返回 null */
function topLevelBlocks(region: string): Array<{ kind: 'div'; openTag: string; inner: string; outer: string } | { kind: 'other'; outer: string }> | null {
  const blocks: Array<{ kind: 'div'; openTag: string; inner: string; outer: string } | { kind: 'other'; outer: string }> = [];
  let pos = 0;
  while (pos < region.length) {
    const lt = region.indexOf('<', pos);
    if (lt < 0) {
      const rest = region.slice(pos);
      if (rest.trim()) blocks.push({ kind: 'other', outer: rest });
      break;
    }
    if (lt > pos && region.slice(pos, lt).trim()) {
      blocks.push({ kind: 'other', outer: region.slice(pos, lt) });
    }
    const tagEnd = region.indexOf('>', lt);
    if (tagEnd < 0) return null;
    if (region.startsWith('<!--', lt)) {
      // HTML 注释视为 other 块
      const end = region.indexOf('-->', lt);
      if (end < 0) return null;
      blocks.push({ kind: 'other', outer: region.slice(lt, end + 3) });
      pos = end + 3;
      continue;
    }
    if (/^<div\b/i.test(region.slice(lt))) {
      const close = matchDivEnd(region, lt);
      if (close < 0) return null;
      const openTag = region.slice(lt, tagEnd + 1);
      blocks.push({
        kind: 'div',
        openTag,
        inner: region.slice(tagEnd + 1, close).trim(),
        outer: region.slice(lt, close + '</div>'.length),
      });
      pos = close + '</div>'.length;
    } else {
      // 非 div 顶层元素：整块按 other 收集（段落/标题等），位置在下次循环按行推进
      // 简单处理：找到该标签闭合（同名匹配）或直接到下一个 '<' 之间——用宽松策略：
      // 对 p/h2/h3/ul/ol 等常见块级元素做同名匹配
      const nameMatch = /^<\/?(\w+)/.exec(region.slice(lt));
      const name = nameMatch ? nameMatch[1] : null;
      if (!name) return null;
      const closeIdx = matchTagEnd(region, lt, name);
      if (closeIdx < 0) {
        // 自闭合/void（br/hr/img）或结构异常：推进到该标签结束
        const selfClosing = /\/>$/.test(region.slice(lt, tagEnd + 1));
        if (selfClosing || /^(br|hr|img|input)$/i.test(name)) {
          blocks.push({ kind: 'other', outer: region.slice(lt, tagEnd + 1) });
          pos = tagEnd + 1;
        } else {
          return null;
        }
      } else {
        blocks.push({ kind: 'other', outer: region.slice(lt, closeIdx + name.length + 3) });
        pos = closeIdx + name.length + 3;
      }
    }
  }
  return blocks;
}

/**
 * 正文区段拆包：若区段顶层全是结构容器 div（left-align / story-work，可多段），
 * 或恰好只有一个 div 容器，则拆出容器内部内容（撰写式编辑看不到外层 div），
 * 并记下用于写回重包裹的开标签。其余情况（视觉组件混排等）不拆，整段透传。
 */
function unwrapBodyRegion(region: string): { openTag: string; inner: string } | null {
  const blocks = topLevelBlocks(region);
  if (!blocks || blocks.length === 0) return null;
  const divBlocks = blocks.filter((b) => b.kind === 'div') as Extract<(typeof blocks)[number], { kind: 'div' }>[];
  const otherBlocks = blocks.filter((b) => b.kind === 'other');
  const isStructural = (openTag: string) => /\bclass="[^"]*\b(left-align|story-work)\b/.test(openTag);
  if (divBlocks.length > 0 && otherBlocks.length === 0) {
    const allStructural = divBlocks.every((b) => isStructural(b.openTag));
    if (allStructural || divBlocks.length === 1) {
      // 多个 left-align 段合并为一段展示；写回时统一用第一个容器的开标签重包裹
      const inner = divBlocks.map((b) => b.inner).filter(Boolean).join('\n\n');
      return { openTag: divBlocks[0].openTag, inner };
    }
  }
  return null;
}

/** 内容页面（非文章页）的正文容器候选，按优先级排列 */
const PAGE_BODY_CONTAINERS = ['content-main', 'kh-main', 'kh-content', 'left-align'];

/**
 * 定位内容页面的正文容器范围：library 之外的页面（入口页、说明页、知识馆页、主页板块等）
 * 依次尝试 .content-main / .kh-main / .kh-content / .left-align 容器，再兜底 <main> 元素。
 */
function findPageBodyRange(html: string): { start: number; end: number } | null {
  for (const token of PAGE_BODY_CONTAINERS) {
    const open = findDivByClassToken(html, token);
    if (open < 0) continue;
    const tagEnd = html.indexOf('>', open);
    const close = matchDivEnd(html, open);
    if (tagEnd < 0 || close < 0 || close <= tagEnd) continue;
    if (!html.slice(tagEnd + 1, close).trim()) continue; // 空容器不可编辑
    return { start: tagEnd + 1, end: close };
  }
  const mainOpen = /<main\b[^>]*>/i.exec(html);
  if (mainOpen) {
    const start = mainOpen.index + mainOpen[0].length;
    const close = matchTagEnd(html, mainOpen.index, 'main');
    if (close > start && html.slice(start, close).trim()) return { start, end: close };
  }
  return null;
}

/**
 * 判断 HTML 是否为「可正文编辑的内容页面」（不含 article-meta 的站点页面）。
 * 文章页由 isArticleHtml 负责，两者互斥。
 */
export function isPageHtml(html: string): boolean {
  if (!html || isArticleHtml(html)) return false;
  return findPageBodyRange(html) !== null;
}

/** 定位正文区段范围：文章页优先，其次内容页面容器 */
function locateBodyRange(html: string, isArticle: boolean): { start: number; end: number } | null {
  if (isArticle) return findMetaBodyRange(html) ?? findLeftAlignRange(html) ?? findPageBodyRange(html);
  return findPageBodyRange(html) ?? findLeftAlignRange(html);
}

/** 提取正文区段内部 HTML（不含结构容器标签）；文章页与内容页面均支持，找不到时返回 null */
export function extractBodyHtml(html: string, isArticle = true): string | null {
  const range = locateBodyRange(html, isArticle);
  if (!range) return null;
  const region = html.slice(range.start, range.end);
  // 内容页面：容器本身就是编辑边界，不再拆包（避免误把整页结构吸进正文）
  const unw = isArticle ? unwrapBodyRegion(region) : null;
  return unw ? unw.inner : region.trim();
}

/** 用新正文 HTML 替换正文区段内容；未找到正文区段时原样返回 */
export function replaceBodyHtml(html: string, bodyHtml: string, isArticle = true): string {
  const range = locateBodyRange(html, isArticle);
  if (!range) return html;
  const inner = bodyHtml.trim();
  const region = html.slice(range.start, range.end);
  const unw = isArticle ? unwrapBodyRegion(region) : null;
  if (unw) {
    // 结构容器正文：只替换容器内部，开闭标签与区段首尾空白原样保留
    const leadWs = /^\s*/.exec(region)![0];
    const tailWs = /\s*$/.exec(region)![0];
    return (
      html.slice(0, range.start) +
      leadWs + unw.openTag + '\n        ' + inner + '\n      </div>' + tailWs +
      html.slice(range.end)
    );
  }
  const indent = isArticle ? '\n        ' : '\n      ';
  return html.slice(0, range.start) + indent + inner + '\n      ' + html.slice(range.end);
}

/** 读取页面主标题（page-title-main 容器内容，文章页与内容页面通用）；不存在返回 null */
export function getPageTitle(html: string): string | null {
  const open = findDivByClassToken(html, 'page-title-main');
  if (open < 0) return null;
  const tagEnd = html.indexOf('>', open);
  const close = matchDivEnd(html, open);
  if (tagEnd < 0 || close < 0 || close <= tagEnd) return null;
  return extractText(html.slice(tagEnd + 1, close));
}

/** 写回页面主标题（只替换该容器内部，保留 class 与缩进） */
export function updatePageTitle(html: string, title: string): string {
  const open = findDivByClassToken(html, 'page-title-main');
  if (open < 0) return html;
  const tagEnd = html.indexOf('>', open);
  const close = matchDivEnd(html, open);
  if (tagEnd < 0 || close < 0 || close <= tagEnd) return html;
  return html.slice(0, tagEnd + 1) + escapeHtml(title) + html.slice(close);
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
