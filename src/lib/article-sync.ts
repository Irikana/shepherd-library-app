// 文章分类与 library.html 文章列表同步
// 规则：library/ 下每个子目录 = 一个文章分类；文章性质（录音/手写/信息/实验性）与分类不同

export interface ArticleCategory {
  key: string;
  label: string;
  /** 仓库内相对 library/ 的目录 */
  dir: string;
  /** library.html 中的分类锚点文本（h4 标题） */
  anchor: string;
}

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  { key: 'normal', label: '普通文章', dir: 'paper', anchor: '普通文章' },
  { key: 'works', label: '作品文章', dir: 'works', anchor: '作品文章' },
  { key: 'misc', label: '杂物文章', dir: 'misc', anchor: '杂物文章' },
  { key: 'experimental', label: '测试文章', dir: 'misc/experimental', anchor: '测试文章' },
];

/** 根据文章性质推荐默认分类 */
export function defaultCategoryForType(articleType: string): ArticleCategory {
  if (articleType === '实验性文章') {
    return ARTICLE_CATEGORIES.find((c) => c.key === 'experimental')!;
  }
  return ARTICLE_CATEGORIES.find((c) => c.key === 'normal')!;
}

/**
 * 在 library.html 的对应分类列表中插入文章链接；已存在或找不到锚点时返回原样
 * @param html library.html 内容
 * @param category 目标分类
 * @param fileName 文件名（如 a-new-article.html）
 * @param displayTitle 显示标题（中文）
 */
export function insertIntoLibraryHtml(
  html: string,
  category: ArticleCategory,
  fileName: string,
  displayTitle: string,
): string {
  const anchorIdx = html.indexOf(`>${category.anchor}</h4>`);
  if (anchorIdx < 0) return html;
  const ulStart = html.indexOf('<ul class="article-list">', anchorIdx);
  if (ulStart < 0) return html;
  const ulEnd = html.indexOf('</ul>', ulStart);
  if (ulEnd < 0) return html;
  const href = `${category.dir}/${fileName}`;
  if (html.slice(ulStart, ulEnd).includes(`href="${href}"`)) return html;
  const li = `\n              <li><a href="${href}">${displayTitle}</a></li>`;
  return html.slice(0, ulEnd) + li + html.slice(ulEnd);
}
