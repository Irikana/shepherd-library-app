// 知识馆条目 HTML 模板生成器
// 权威参考：Irikana.github.io/template/knowledge-entry.html 与 knowledge-hall/ 下现行页面
// 上传路径：knowledge-hall/categories/{分类}/{titleEn}.html
//
// 站点侧 alpha-023 起，知识馆骨架（.kh-body / .kh-sidebar / .kh-main / .kh-nav-item / .kh-site-title /
// .kh-equality / .kh-nav-divider / .kh-nav-section / .kh-card / .kh-footer / .link-to-page 及其明暗响应式）
// 已收归 css/library-refit.css 的「3.1 知识馆骨架与侧边栏」，颜色全部走主题令牌。
// 本模板因此不再内联任何骨架布局与配色（内联硬编码会让站点六套配色失效），
// 只保留词条页独有的类（.kh-entry-* / .kh-graph-* / .kh-related-* / .kh-footer-mobile），
// 且这些独有规则一律使用 var(--color-*) 主题令牌。head 顺序保持 style.css → library-refit.css → 主题预应用脚本。
import { marked } from 'marked';
import type { ArticleFormData, KnowledgeCategory } from '../types';
import { siteHeadExtras } from './site-assets';
import { MATHJAX_HEAD } from './article';

/** 将 YYYY-MM-DD 格式化为 YYYY年M月D日 */
export function formatDateCN(dateStr: string): string {
  const m = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return dateStr;
  return `${m[1]}年${parseInt(m[2], 10)}月${parseInt(m[3], 10)}日`;
}

/** HTML 转义 */
function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 知识馆分类元数据（文件名与仓库路径一致） */
export const KNOWLEDGE_CATEGORIES: Record<KnowledgeCategory, { label: string; page: string; desc: string }> = {
  phenomenon: {
    label: '现象',
    page: 'phenomenon.html',
    desc: '现象是最原始、最纯粹的知识。它们存在于世界之中，等待被发现或观察。一旦被发现或被观察，现象即可转化为可回忆知识或可追溯知识的其中一种。',
  },
  recallable: {
    label: '可回忆知识',
    page: 'recallable.html',
    desc: '可回忆知识是建筑最稳定的知识。它们能随时随地被提出或用于想象和创造。这类知识已经被内化，无需借助外部工具即可调用。',
  },
  traceable: {
    label: '可追溯知识',
    page: 'traceable.html',
    desc: '可追溯知识是所有知识当中，不能随时被回忆和用于想象和创造的。然而，唯一能够使它们出现的办法是通过考察将它们转为可回忆知识。一般通过记录来保存它们。',
  },
};

/* ------------------------------------------------------------------ *
 * 分节：正文 Markdown 的 H2 分组 → 网站权威结构 #section-*
 * ------------------------------------------------------------------ */

/** 词条必填分节的键 */
export type KnowledgeSectionKey = 'summary' | 'detail' | 'history';

export interface KnowledgeSectionDef {
  key: KnowledgeSectionKey;
  /** 网站权威结构里的节 id */
  domId: string;
  /** 规范节名（脚手架写入的 H2 标题，也是校验与提示用的名字） */
  title: string;
  /** 识别时接受的标题别名（中英与常见变体，忽略大小写/空格/强调符） */
  aliases: string[];
  /** 这一节该写什么（分节状态条与校验文案共用） */
  hint: string;
}

/** 词条三节（与 template/knowledge-entry.html 的 #section-summary / #section-detail / #section-history 一一对应） */
export const KNOWLEDGE_SECTIONS: KnowledgeSectionDef[] = [
  {
    key: 'summary',
    domId: 'section-summary',
    title: '概述',
    aliases: ['summary', 'abstract', '简介', '概要'],
    hint: '用一两句话说明这个词条是什么',
  },
  {
    key: 'detail',
    domId: 'section-detail',
    title: '详细说明',
    aliases: ['detail', 'details', '详情', '内容', '说明'],
    hint: '展开定义、原理、用法与例子',
  },
  {
    key: 'history',
    domId: 'section-history',
    title: '历史',
    aliases: ['history', '来源', '沿革', '演变'],
    hint: '这条知识从何而来、如何被确认或记载',
  },
];

/** #section-related 的节名与别名（相关词条：允许留空，也可由正文内部链接自动汇总） */
const RELATED_SECTION = { domId: 'section-related', title: '相关词条', aliases: ['related', '相关', '关联词条'] };

/** 标题归一化：去强调符/反引号/空白，转小写，便于「概 述」「**历史**」之类写法也能识别 */
function normalizeHeading(text: string): string {
  return (text || '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, '')
    .trim()
    .toLowerCase();
}

/** 把一个 H2 标题归类到某个分节；返回节键、'related' 或 null（未匹配） */
function classifyHeading(rawTitle: string): KnowledgeSectionKey | 'related' | null {
  const t = normalizeHeading(rawTitle);
  if (!t) return null;
  const defs: { key: KnowledgeSectionKey | 'related'; names: string[] }[] = [
    ...KNOWLEDGE_SECTIONS.map((s) => ({ key: s.key, names: [s.title, ...s.aliases] })),
    { key: 'related', names: [RELATED_SECTION.title, ...RELATED_SECTION.aliases] },
  ];
  // 先精确匹配，再前缀/包含匹配（「概述与定义」→ 概述）
  for (const d of defs) {
    if (d.names.some((n) => normalizeHeading(n) === t)) return d.key;
  }
  for (const d of defs) {
    if (d.names.some((n) => t.includes(normalizeHeading(n)))) return d.key;
  }
  return null;
}

interface H2Group {
  title: string;
  /** 去掉 H2 标题行后的该节 Markdown */
  markdown: string;
}

/** 按 H2 切分正文（跳过代码围栏内的 ## 行）；第一个 H2 之前的内容作为 preamble */
function splitByH2(md: string): { preamble: string; groups: H2Group[] } {
  const lines = (md || '').replace(/\r\n/g, '\n').split('\n');
  const groups: H2Group[] = [];
  const pre: string[] = [];
  let current: H2Group | null = null;
  let inFence = false;
  for (const line of lines) {
    if (/^\s{0,3}(```|~~~)/.test(line)) inFence = !inFence;
    const m = !inFence ? line.match(/^\s{0,3}##(?!#)\s*(.*?)\s*#*\s*$/) : null;
    if (m) {
      if (current) groups.push(current);
      current = { title: m[1], markdown: '' };
      continue;
    }
    if (current) current.markdown += line + '\n';
    else pre.push(line);
  }
  if (current) groups.push(current);
  return { preamble: pre.join('\n').trim(), groups };
}

/** 取正文里第一段非空文本（Markdown 段落，忽略标题行），用于概述缺失时的降级填充 */
function firstParagraph(md: string): string {
  const blocks = (md || '')
    .replace(/^\s{0,3}#{1,6}\s.*$/gm, '')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);
  return blocks[0] ?? '';
}

/** 分节状态（编辑器状态条与发布校验共用） */
export interface KnowledgeSectionState {
  def: KnowledgeSectionDef;
  /** 正文里是否出现了归到该节的 H2 标题 */
  present: boolean;
  /** 该节是否有实际内容（去空白后非空） */
  filled: boolean;
}

/** 分析正文的分节情况：哪些节已识别、哪些节为空、哪些节缺失 */
export function analyzeKnowledgeSections(bodyMarkdown: string): KnowledgeSectionState[] {
  const { groups } = splitByH2(bodyMarkdown);
  const bucket: Record<KnowledgeSectionKey, string> = { summary: '', detail: '', history: '' };
  for (const g of groups) {
    const key = classifyHeading(g.title);
    if (key && key !== 'related') bucket[key] += g.markdown;
  }
  return KNOWLEDGE_SECTIONS.map((def) => ({
    def,
    present: groups.some((g) => classifyHeading(g.title) === def.key),
    filled: bucket[def.key].trim().length > 0,
  }));
}

/** 「插入分节」脚手架：只补当前正文里缺失（含存在但为空）的分节标题 */
export function buildSectionScaffold(bodyMarkdown: string): string {
  const missing = analyzeKnowledgeSections(bodyMarkdown).filter((s) => !s.filled);
  if (!missing.length) return '';
  let out = `## ${missing[0].def.title}\n\n§\n`;
  for (let i = 1; i < missing.length; i++) out += `\n## ${missing[i].def.title}\n`;
  return out;
}

/** 已归类的节（渲染顺序：概述 → 详细说明 → 历史 → 未归类补充节） */
interface BuiltSection {
  domId: string;
  /** 节标题（未归类节沿用用户写的标题） */
  title: string;
  markdown: string;
}

/** 从正文里提取站内词条链接（相对 .html 链接），用于 #section-related 与图谱节点 */
function extractInternalLinks(bodyMarkdown: string, selfTitleEn: string): { text: string; href: string }[] {
  const found: { text: string; href: string }[] = [];
  const seen = new Set<string>();
  const categoryPages = new Set(Object.values(KNOWLEDGE_CATEGORIES).map((c) => c.page));
  const push = (text: string, rawHref: string) => {
    const href = (rawHref || '').trim().replace(/^<|>$/g, '');
    const text2 = (text || '').replace(/[*_`]/g, '').trim();
    if (!href || !text2) return;
    if (/^(https?:|mailto:|javascript:|#)/i.test(href)) return;
    if (!/\.html?$/i.test(href)) return;
    if (categoryPages.has(href.split('/').pop()!.toLowerCase())) return;
    if (href.split('/').pop()!.toLowerCase() === `${(selfTitleEn || '').toLowerCase()}.html`) return;
    const id = href.toLowerCase();
    if (seen.has(id)) return;
    seen.add(id);
    found.push({ text: text2, href });
  };
  // Markdown 链接 [text](href)
  const stripped = (bodyMarkdown || '').replace(/(```[\s\S]*?```|`[^`\n]*`)/g, '');
  let m: RegExpExecArray | null;
  const reMd = /\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  while ((m = reMd.exec(stripped)) !== null) push(m[1], m[2]);
  // 内联 HTML 锚
  const reA = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  while ((m = reA.exec(stripped)) !== null) push(m[2], m[1]);
  return found;
}

/**
 * 把正文 Markdown 归组成网站权威分节结构。
 * 映射规则：
 *  - 「概述」→ #section-summary，「详细说明」→ #section-detail，「历史」→ #section-history（别名见 KNOWLEDGE_SECTIONS）
 *  - 第一个 H2 之前的引言段：概述为空时用作概述，否则并入详细说明开头（内容不丢）
 *  - 未匹配到任何规范节的 H2：作为补充节排在 #section-history 之后（id 为 section-extra-N），内容不丢
 *  - 全文没有任何 H2：降级为 #section-detail 放全文、#section-summary 放首段，保证生成页不空白
 *  - #section-related：优先用用户写的「相关词条」节；否则从正文内部链接自动汇总；再否则输出空节
 */
export function buildKnowledgeSections(bodyMarkdown: string, selfTitleEn = ''): {
  sections: BuiltSection[];
  relatedHtml: string;
  relatedEntries: { text: string; href: string }[];
} {
  const { preamble, groups } = splitByH2(bodyMarkdown);
  const bucket: Record<KnowledgeSectionKey, string> = { summary: '', detail: '', history: '' };
  const extras: { title: string; markdown: string }[] = [];
  let relatedMarkdown = '';

  for (const g of groups) {
    const key = classifyHeading(g.title);
    if (key === 'related') relatedMarkdown += g.markdown;
    else if (key) bucket[key] += (bucket[key] ? '\n' : '') + g.markdown.trim();
    else extras.push({ title: g.title, markdown: g.markdown.trim() });
  }

  if (!groups.length) {
    // 降级（按任务规定的兜底）：#section-detail 放全文，#section-summary 放首段，保证生成页不空白
    const whole = (bodyMarkdown || '').trim();
    bucket.detail = whole;
    const lead = firstParagraph(whole);
    if (lead) bucket.summary = lead;
  } else if (preamble.trim()) {
    // 引言段：概述为空时归入概述，否则并入详细说明开头（内容不丢）
    if (!bucket.summary.trim()) bucket.summary = preamble.trim();
    else bucket.detail = [preamble.trim(), bucket.detail].filter(Boolean).join('\n\n');
  }

  const sections: BuiltSection[] = [];
  for (const def of KNOWLEDGE_SECTIONS) {
    const md = bucket[def.key].trim();
    if (md) sections.push({ domId: def.domId, title: def.title, markdown: md });
  }
  extras.forEach((e, i) => {
    if (e.markdown.trim()) {
      sections.push({ domId: `section-extra-${i + 1}`, title: e.title || `补充 ${i + 1}`, markdown: e.markdown.trim() });
    }
  });

  const relatedEntries = extractInternalLinks(bodyMarkdown, selfTitleEn);
  let relatedHtml = marked.parse(relatedMarkdown, { async: false }) as string;
  if (!relatedHtml.trim() && relatedEntries.length) {
    relatedHtml = `<ul class="kh-related-list">\n${relatedEntries
      .map((e) => `        <li><a href="${escapeHtml(e.href)}">${escapeHtml(e.text)}</a></li>`)
      .join('\n')}\n      </ul>`;
  } else {
    relatedHtml = relatedHtml.trim();
  }
  sections.push({ domId: RELATED_SECTION.domId, title: RELATED_SECTION.title, markdown: '' });
  return { sections, relatedHtml, relatedEntries };
}

/* ------------------------------------------------------------------ *
 * 页面生成
 * ------------------------------------------------------------------ */

/** 图谱节点坐标（最多 4 个关联节点，与 template/knowledge-entry.html 一致） */
const GRAPH_SPOTS = ['left:10%;top:20%', 'left:75%;top:15%', 'left:5%;top:65%', 'left:72%;top:68%'];

/** 词条页独有样式：一律走主题令牌，不重复定义知识馆骨架（骨架见 css/library-refit.css） */
const ENTRY_PAGE_CSS = `    .kh-entry-title { font-size: 26px; font-weight: 700; line-height: 1.3; margin: 0 0 8px 0; color: var(--color-text); }
    .kh-entry-aliases { font-size: 15px; line-height: 1.5; margin-bottom: 4px; color: var(--color-text-light); }
    .kh-entry-meta { display: flex; flex-wrap: wrap; align-items: baseline; gap: 16px; padding: 8px 0; margin-bottom: 20px; border-bottom: 1px solid var(--color-border); font-size: 13px; color: var(--color-text-light); }
    .kh-entry-meta-item { display: inline-flex; align-items: center; gap: 4px; }
    .kh-entry-meta-label { font-weight: 600; color: var(--color-text-secondary); }
    .kh-entry-meta-value { color: var(--color-text-light); }
    .kh-entry-category-badge { display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; padding: 2px 8px; background-color: var(--color-bg-muted); color: var(--color-accent); border: 1px solid var(--color-border); }
    .kh-entry-back { display: inline-flex; align-items: center; gap: 4px; font-size: 14px; text-decoration: none; margin-bottom: 20px; color: var(--color-text-secondary); }
    .kh-entry-back:hover { color: var(--color-accent); }
    .kh-entry-back::before { content: '\\2190'; margin-right: 4px; }
    .kh-related-list { list-style: none; padding: 0; margin: 0; }
    .kh-related-list li { padding: 8px 0; border-bottom: 1px dashed var(--color-border); }
    .kh-related-list li:last-child { border-bottom: none; }
    .kh-related-list a { font-size: 15px; font-weight: 500; text-decoration: none; color: var(--color-accent); }
    .kh-related-list a:hover { color: var(--color-accent-hover); }
    .kh-related-relation { display: block; font-size: 13px; margin-top: 2px; color: var(--color-text-light); }
    .kh-graph-panel { width: 260px; flex-shrink: 0; align-self: flex-start; border: 1px solid var(--color-border); padding: 20px; }
    .kh-graph-title { font-size: 14px; font-weight: 700; letter-spacing: 0.5px; margin: 0 0 16px 0; color: var(--color-accent); }
    .kh-graph-canvas { position: relative; width: 100%; min-height: 300px; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--color-border-dark); background-color: var(--color-bg-subtle); }
    .kh-graph-node { position: absolute; z-index: 2; padding: 6px 12px; font-size: 12px; font-weight: 600; white-space: nowrap; background-color: var(--color-bg); border: 1px solid var(--color-accent); color: var(--color-accent); text-decoration: none; }
    .kh-graph-node:hover { background-color: var(--color-accent); color: var(--color-bg); }
    .kh-graph-node.center { z-index: 3; font-size: 13px; background-color: var(--color-accent); border-color: var(--color-accent); color: var(--color-bg); }
    .kh-graph-hint { font-size: 12px; line-height: 1.5; text-align: center; margin-top: 12px; color: var(--color-text-light); }
    .kh-footer-mobile { display: none; margin-top: 64px; padding-top: 24px; border-top: 1px solid var(--color-border); text-align: center; font-size: 12px; line-height: 1.9; color: var(--color-text-light); }
    .kh-footer-mobile p { margin: 4px 0; }
    @media (max-width: 1024px) {
      .kh-graph-panel { display: none; }
      .kh-footer-mobile { display: block; }
    }
    @media (max-width: 768px) {
      .kh-entry-title { font-size: 22px; }
    }`;

/**
 * 生成知识馆条目页 HTML
 * @param data 统一撰写表单（entryType 应为 'knowledge'；字段缺失时按知识馆默认值处理）
 * @returns 完整 HTML 字符串（PUT 到 knowledge-hall/categories/{knowledgeCategory}/{titleEn}.html）
 */
export function generateKnowledgeEntryHtml(data: ArticleFormData): string {
  const categoryKey: KnowledgeCategory = data.knowledgeCategory || 'phenomenon';
  const cat = KNOWLEDGE_CATEGORIES[categoryKey] ?? KNOWLEDGE_CATEGORIES.phenomenon;
  const titleSafe = escapeHtml(data.title);
  const aliasesSafe = escapeHtml(data.aliases || '');
  const dateCN = formatDateCN(data.createDate);
  // 词条页与分类页同层（knowledge-hall/categories/x.html），站点根前缀固定为 ../../
  const rootPrefix = '../../';

  const { sections, relatedHtml, relatedEntries } = buildKnowledgeSections(data.bodyMarkdown, data.titleEn);

  const sectionHtml = sections
    .map((sec) => {
      if (sec.domId === RELATED_SECTION.domId) {
        return `  <section id="${sec.domId}">\n    <h2>${sec.title}</h2>\n    ${relatedHtml || '<ul class="kh-related-list"></ul>'}\n  </section>`;
      }
      const inner = (marked.parse(sec.markdown, { async: false }) as string).trim();
      return `  <section id="${sec.domId}">\n    <h2>${escapeHtml(sec.title)}</h2>\n    ${inner}\n  </section>`;
    })
    .join('\n\n');

  // 图谱节点：优先用提取到的相关词条，不足四个时补分类与知识馆
  const nodeEntries = relatedEntries.slice(0, GRAPH_SPOTS.length);
  const fillers = [cat.label, '知识馆'];
  const nodes: { text: string; href: string | null }[] = nodeEntries.map((e) => ({ text: e.text, href: e.href }));
  for (const f of fillers) {
    if (nodes.length >= GRAPH_SPOTS.length) break;
    nodes.push({ text: f, href: null });
  }
  const graphNodes = nodes
    .map((n, i) => {
      const inner = escapeHtml(n.text);
      const tag = n.href ? `a href="${escapeHtml(n.href)}"` : 'div';
      const closing = n.href ? 'a' : 'div';
      return `    <${tag} class="kh-graph-node" style="${GRAPH_SPOTS[i]}">${inner}</${closing}>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>知识馆 - ${titleSafe} - ${cat.label}</title>
  <meta name="description" content="牧羊人图书馆知识馆 - ${titleSafe}">
  <meta name="keywords" content="图书馆,知识,学习,牧羊人,${titleSafe}">
  <meta name="theme-color" content="#2c3e50">
  <meta name="referrer" content="origin-when-cross-origin">
  <meta property="og:title" content="知识馆 - ${titleSafe}">
  <meta property="og:description" content="${cat.label}词条：${titleSafe}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="zh_CN">
  <link rel="preload" href="${rootPrefix}css/style.css" as="style">
  <link rel="stylesheet" href="${rootPrefix}css/style.css">
  ${siteHeadExtras(rootPrefix)}
  <style>
${ENTRY_PAGE_CSS}
  </style>
  ${data.includeMathJax ? MATHJAX_HEAD : ''}
</head>
<body class="kh-body">

<a href="#main-content" class="skip-navigation">跳转到主要内容</a>

<aside class="kh-sidebar">
  <div class="kh-logo-area">
    <img src="${rootPrefix}image/logo.png" alt="牧羊人图书馆 Logo" width="80" height="80">
    <div class="kh-site-title">知识馆</div>
    <div class="kh-equality">所有知识都是平等的</div>
  </div>

  <div class="kh-nav-divider"></div>

  <a href="../index.html" class="kh-nav-item">知识馆主页 </a>
  <a href="${KNOWLEDGE_CATEGORIES.phenomenon.page}" class="kh-nav-item${categoryKey === 'phenomenon' ? ' active' : ''}">现象 </a>
  <a href="${KNOWLEDGE_CATEGORIES.recallable.page}" class="kh-nav-item${categoryKey === 'recallable' ? ' active' : ''}">可回忆知识 </a>
  <a href="${KNOWLEDGE_CATEGORIES.traceable.page}" class="kh-nav-item${categoryKey === 'traceable' ? ' active' : ''}">可追溯知识 </a>

  <div class="kh-nav-divider"></div>

  <a href="${rootPrefix}index.html" class="kh-nav-item">图书馆主页 </a>
  <a href="${rootPrefix}library/library.html" class="kh-nav-item">图书馆入口 </a>
</aside>

<main id="main-content" class="kh-main kh-content">

  <a href="${cat.page}" class="kh-entry-back">返回${cat.label}</a>

  <h1 class="kh-entry-title">${titleSafe}</h1>

  <div class="kh-entry-aliases">${aliasesSafe}</div>

  <div class="kh-entry-meta">
    <span class="kh-entry-meta-item">
      <span class="kh-entry-meta-label">分类：</span>
      <span class="kh-entry-meta-value"><span class="kh-entry-category-badge">${cat.label}</span></span>
    </span>
    <span class="kh-entry-meta-item">
      <span class="kh-entry-meta-label">创建日期：</span>
      <span class="kh-entry-meta-value">${dateCN}</span>
    </span>
    <span class="kh-entry-meta-item">
      <span class="kh-entry-meta-label">最后更新：</span>
      <span class="kh-entry-meta-value">${dateCN}</span>
    </span>
  </div>

${sectionHtml}

  <footer class="kh-footer-mobile">
    <p>&copy; 2026 薛柯道 KeDao Xue 牧羊人图书馆 Shepherd's Library &middot; 知识馆</p>
    <p>保留所有权利 &middot; 未经许可，不得擅自转载、修改或用于商业用途</p>
  </footer>

</main>

<aside class="kh-graph-panel">
  <h3 class="kh-graph-title">知识关系图谱</h3>
  <div class="kh-graph-canvas" id="kh-graph-canvas">
    <div class="kh-graph-node center" style="left:50%;top:50%;transform:translate(-50%,-50%)">${titleSafe}</div>
${graphNodes}
  </div>
  <p class="kh-graph-hint">点击节点跳转至对应词条<br>图谱展示本词条与其他知识的关联关系</p>

  <footer class="kh-footer">
    <p>&copy; 2026 薛柯道 KeDao Xue 牧羊人图书馆 Shepherd's Library &middot; 知识馆</p>
    <p>保留所有权利 &middot; 未经许可，不得擅自转载、修改或用于商业用途</p>
  </footer>
</aside>

<button title="回到顶部" class="float-button back-to-top" onclick="window.scrollTo({top:0,behavior:'smooth'})">
  回到<br>顶部
</button>

<script src="${rootPrefix}js/library-dynamic.js"></script>
</body>
</html>
`;
}
