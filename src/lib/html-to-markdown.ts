// HTML → Markdown 正文转换（编辑已有文章时，把正文区段 HTML 还原为 Markdown 供撰写式编辑）
// 使用 turndown 转换标准标签；视觉组件（div[class]/details/table 等）保留原 HTML 透传
// （这些组件在撰写页 MarkdownEditor 中本来就是以 HTML 片段插入的，保留原样往返无损）
import TurndownService from 'turndown';

/** 正文区段 HTML → Markdown；异常时返回 null（调用方提示改用源码编辑） */
export function htmlToMarkdown(bodyHtml: string): string | null {
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
    td.addRule('keepHtml', {
      filter: (node) => {
        const n = node.nodeName;
        if (!KEEP_HTML_NODES.has(n)) return false;
        if (n === 'DIV') {
          // 仅保留带 class 的 div（视觉组件）；无 class 的普通 div 按默认 block 处理
          return (node.getAttribute?.('class') ?? '').length > 0;
        }
        return true;
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
