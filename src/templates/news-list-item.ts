// news.html 列表项生成器 + 插入逻辑
import { formatDateCN } from './article';

export interface NewsListItemData {
  title: string;
  date: string; // YYYY-MM-DD
  href: string;
}

/** 生成 news.html 列表项片段 */
export function generateNewsListItem(d: NewsListItemData): string {
  return `<a href="${d.href}" target="_blank" class="news-list-item-text-only">
                <h3 class="news-list-item-title">${d.title}</h3>
                <p class="news-list-item-date">${formatDateCN(d.date)}</p>
                <p class="news-list-item-hint">点击此处了解更多</p>
              </a>`;
}

/**
 * 向 news.html 插入一条列表项（插入到列表区域最前，按日期降序）
 * news.html 的列表项容器为包含 .news-list-item-text-only 的区域
 */
export function insertNewsListItem(newsHtml: string, item: NewsListItemData): string {
  // 定位第一个现有列表项，在其前插入；若无则报错
  const anchor = /(\s*)(<a href="[^"]*" target="_blank" class="news-list-item-text-only">)/;
  const match = newsHtml.match(anchor);
  const fragment = generateNewsListItem(item);
  if (match) {
    const indent = match[1];
    return newsHtml.replace(match[0], `${indent}${fragment}\n${indent}${match[2]}`);
  }
  throw new Error('未找到 news.html 列表项锚点，无法插入');
}
