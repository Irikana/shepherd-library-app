// HTML → Markdown 正文转换（编辑已有文章时，把正文区段 HTML 还原为 Markdown 供撰写式编辑）
// 使用 turndown 转换标准标签；视觉组件（div[class]/details/table 等）保留原 HTML 透传
// （这些组件在撰写页 MarkdownEditor 中本来就是以 HTML 片段插入的，保留原样往返无损）
// 注意：RN 里 turndown 必须走 Node 版构建（domino 解析器），Metro 的 browser 字段重映射会导致
// 还原必败——已在 metro.config.js 固定，见该文件注释。
import TurndownService from 'turndown';

/** 正文区段 HTML → Markdown；空正文返回空串；异常时返回 null（调用方提示改用源码编辑） */
export function htmlToMarkdown(bodyHtml: string): string | null {
  if (!bodyHtml || !bodyHtml.trim()) return '';
  try {
    const td = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**',
    });

    // 脚注上标引用：<sup class="article-footnote-ref"><a href="#article-fn-n">[n]</a></sup> → [^n]
    td.addRule('footnoteRef', {
      filter: (node) => {
        if (node.nodeName !== 'SUP') return false;
        return /article-footnote-ref/.test(node.getAttribute?.('class') ?? '');
      },
      replacement: (_content, node) => {
        const anchor = (node as HTMLElement).querySelector?.('a');
        const href = anchor?.getAttribute('href') ?? '';
        const m = href.match(/article-fn-(\d+)/);
        return m ? `[^${m[1]}]` : _content;
      },
    });

    // 视觉组件 / 复杂结构：原样保留 HTML（往返无损）
    const KEEP_HTML_NODES = new Set([
      'DIV', 'DETAILS', 'SUMMARY', 'TABLE', 'THEAD', 'TBODY', 'TFOOT',
      'TR', 'TH', 'TD', 'SECTION', 'FIGURE', 'FIGCAPTION',
    ]);
    // 内容页面（非文章页）里的结构化块：带站点类名时同样原样保留，
    // 否则 turndown 会剥掉标签与 class，保存回写后页面样式（章节标题、文章列表等）会丢失
    const KEEP_CLASS_NODES = new Set([
      'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'SPAN', 'FIGURE',
    ]);
    const STRUCTURED_CLASS =
      /\b(section-title-text[\w-]*|subsection-header|sub-subsection-header|section-content|article-list|article-meta[\w-]*|article-footer-meta|article-tag|page-title-main|notice-header|kh-[\w-]+|content-[\w-]+|news-[\w-]+|callout[\w-]*|function-box[\w-]*|notice-box[\w-]*|quote-box[\w-]*|left-align|story-work)\b/;
    td.addRule('keepHtml', {
      filter: (node) => {
        const n = node.nodeName;
        const cls = node.getAttribute?.('class') ?? '';
        if (KEEP_HTML_NODES.has(n)) {
          if (n === 'DIV') {
            // 仅保留带 class 的 div（视觉组件）；无 class 的普通 div 按默认 block 处理
            return cls.length > 0;
          }
          return true;
        }
        return KEEP_CLASS_NODES.has(n) && STRUCTURED_CLASS.test(cls);
      },
      replacement: (_content, node) => {
        const html = (node as HTMLElement).outerHTML ?? '';
        return `\n\n${html}\n\n`;
      },
    });

    return td.turndown(bodyHtml).replace(/\n{3,}/g, '\n\n').trim();
  } catch {
    return null;
  }
}
