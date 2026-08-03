// 文章分类与 library.html 文章列表同步
// 规则：library/ 下每个子目录 = 一个文章分类；文章性质（录音/手写/信息/实验性）与分类不同

export interface ArticleCategory {
  key: string;
  label: string;
  /** 仓库内相对 library/ 的目录 */
  dir: string;
  /** library.html 中的分类锚点文本（h4 标题） */
  anchor: string;
  /** en/library/library.html 中的分类锚点文本 */
  enAnchor: string;
}

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  { key: 'normal', label: '普通文章', dir: 'paper', anchor: '普通文章', enAnchor: 'Normal Articles' },
  { key: 'works', label: '作品文章', dir: 'works', anchor: '作品文章', enAnchor: 'Creative Works' },
  { key: 'misc', label: '杂物文章', dir: 'misc', anchor: '杂物文章', enAnchor: 'Miscellaneous Articles' },
  { key: 'experimental', label: '测试文章', dir: 'misc/experimental', anchor: '测试文章', enAnchor: 'Test Articles' },
];

/** 根据文章性质推荐默认分类 */
export function defaultCategoryForType(articleType: string): ArticleCategory {
  if (articleType === '实验性文章') {
    return ARTICLE_CATEGORIES.find((c) => c.key === 'experimental')!;
  }
  return ARTICLE_CATEGORIES.find((c) => c.key === 'normal')!;
}

// ──────────────────────────────────────────────
// 自定义分类：library.html 章节插入 / 移除
// ──────────────────────────────────────────────

/** 中文版（library/library.html）与英文版（en/library/library.html）的章节尾标记 */
const ZH_TAIL = '\n        </div>\n      </div>\n    </div>\n  </main>';
const EN_TAIL = '\n      </div>\n    </div>\n  </div>\n</main>';

/**
 * 在 library.html 的文章分类列表末尾插入一个自定义分类章节
 * 中文版与英文版结构不同，分别匹配各自尾标记
 */
export function insertCategorySection(
  html: string,
  category: ArticleCategory,
  english = false,
): string {
  const anchor = english ? category.enAnchor : category.anchor;
  const sectionId = `section-3-c-${category.key}`;
  const section = english
    ? `
        <h4 id="${sectionId}" class="subsection-header">${anchor}</h4>
        <div class="gjs-row bg-transparent content-bg-white-sub">
          <div class="gjs-cell">
            <div class="center-align">
              <p>${anchor}</p>
              <ul class="article-list">
              </ul>
            </div>
          </div>
        </div>`
    : `
          <h4 id="${sectionId}" class="subsection-header">${anchor}</h4>
          <div class="section-content">
            <p>${anchor}</p>
            <ul class="article-list">
            </ul>
          </div>`;
  const tail = english ? EN_TAIL : ZH_TAIL;
  const idx = html.lastIndexOf(tail);
  if (idx < 0) return html;
  return html.slice(0, idx) + section + html.slice(idx);
}

/**
 * 从 library.html 移除一个自定义分类章节（找不到时返回原样）
 * 中文版章节在 10 空格缩进的 `</div>` 处闭合；英文版在 8 空格缩进的 `</div>` 处闭合
 */
export function removeCategorySection(
  html: string,
  category: ArticleCategory,
  english = false,
): string {
  const anchor = english ? category.enAnchor : category.anchor;
  const closeIndent = english ? '        ' : '          ';
  const re = new RegExp(
    `<h4[^>]*>${escapeRegExp(anchor)}</h4>[\\s\\S]*?\\n${closeIndent}</div>`,
  );
  return html.replace(re, '');
}

/** 正则转义（分类锚点含中文/括号等） */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** JS 字符串上下文转义（library-dynamic.js 的 Search.data 条目） */
function escapeJsString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ');
}

/**
 * 在 js/library-dynamic.js 的 Search.data 数组中插入搜索条目（站内搜索可找到）
 * 已存在相同 urlPath 的条目时返回原样；找不到 data: [ 时返回原样
 * @param js library-dynamic.js 内容
 * @param entry.title 显示标题（中文）
 * @param entry.keywords 搜索关键词（空格分隔）
 * @param entry.urlPath 相对站点根的路径，如 library/paper/xxx.html
 */
export function insertSearchEntry(
  js: string,
  entry: { title: string; keywords: string; urlPath: string },
): string {
  const marker = 'data: [';
  const idx = js.indexOf(marker);
  if (idx < 0) return js;
  // 防重复：urlPath 已存在于搜索数据中
  const urlPattern = `ROOT+'${entry.urlPath}'`;
  if (js.includes(urlPattern)) return js;
  const line = `      {t:'${escapeJsString(entry.title)}',u:toAbs(ROOT+'${entry.urlPath}'),k:'${escapeJsString(entry.keywords)}'},`;
  return js.slice(0, idx + marker.length) + '\n' + line + js.slice(idx + marker.length);
}

/**
 * 构建搜索关键词：中文标题 + 英文标题 + 文章性质 + 标签
 * 新闻文章自动加入「新闻」关键词
 */
export function buildSearchKeywords(form: {
  title: string;
  titleEn: string;
  articleType: string;
  tags: string[];
  isNews?: boolean;
}): string {
  const extras = form.isNews ? ['新闻'] : [];
  return [form.title, form.titleEn, form.articleType, ...(form.tags ?? []), ...extras]
    .filter((s) => !!s && s !== '无')
    .join(' ');
}

/**
 * 在 library.html 的对应分类列表中插入文章链接；已存在或找不到锚点时返回原样
 * @param html library.html 内容
 * @param category 目标分类
 * @param fileName 文件名（如 a-new-article.html）
 * @param displayTitle 显示标题（中文版用中文标题，英文版用英文标题）
 * @param english 是否为英文版（true 时用 enAnchor 匹配）
 */
export function insertIntoLibraryHtml(
  html: string,
  category: ArticleCategory,
  fileName: string,
  displayTitle: string,
  english = false,
): string {
  const anchor = english ? category.enAnchor : category.anchor;
  const anchorIdx = html.indexOf(`>${anchor}</h4>`);
  if (anchorIdx < 0) return html;
  const ulStart = html.indexOf('<ul class="article-list">', anchorIdx);
  if (ulStart < 0) return html;
  const ulEnd = html.indexOf('</ul>', ulStart);
  if (ulEnd < 0) return html;
  const href = `${category.dir}/${fileName}`;
  if (html.slice(ulStart, ulEnd).includes(`href="${href}"`)) return html;
  // 中文版（library/library.html）链接相对 library/ 目录；英文版（en/library/library.html）相对 en/library/ 目录
  const li = english
    ? `\n                <li><a href="../../library/${href}">${displayTitle}</a></li>`
    : `\n              <li><a href="${href}">${displayTitle}</a></li>`;
  return html.slice(0, ulEnd) + li + html.slice(ulEnd);
}

/**
 * 从 library.html 中移除指定文件名的文章链接（用于隐藏文章时同步取消公开列表）
 * @param html library.html 内容
 * @param category 文章所在分类
 * @param fileName 文件名（含路径前缀，如 paper/xxx.html）
 * @returns 更新后的 HTML
 */
export function removeFromLibraryHtml(
  html: string,
  category: ArticleCategory,
  fileName: string,
): string {
  const hrefPattern = `href="${category.dir}/${fileName.split('/').pop()}"`;
  // 匹配包含该 href 的 <li>…</li> 整行（含前后换行和缩进）
  return html.replace(
    new RegExp(`\\n\\s*<li[^>]*>[\\s\\S]*?${escapeRegex(hrefPattern)}[\\s\\S]*?<\\/li>`, 'g'),
    '',
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
