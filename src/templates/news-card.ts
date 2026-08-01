// 新闻卡片片段生成器 + index.html 插入逻辑
// 规矩：左侧 1 海报 + 右侧 6 文字，按 data-date 降序；新增海报替换左侧并降级旧海报
import { formatDateCN } from './article';

export interface TextCardData {
  title: string;
  date: string; // YYYY-MM-DD
  href: string;
}

export interface PosterData {
  title: string;
  date: string; // YYYY-MM-DD
  dateDisplay?: string; // 可选自定义显示（默认用 formatDateCN）
  href: string;
  posterSrc: string; // ./image/poster/...
  alt: string;
}

/** 生成右侧文字新闻卡片片段 */
export function generateTextCard(c: TextCardData): string {
  return `<a href="${c.href}" target="_blank" rel="noopener noreferrer" class="news-featured-text-card" data-date="${c.date}">
                <span class="card-title">${c.title}</span>
                <span class="card-date">${formatDateCN(c.date)}</span>
              </a>`;
}

/** 生成左侧海报新闻块 */
export function generatePosterBlock(p: PosterData): string {
  const dateDisplay = p.dateDisplay ?? formatDateCN(p.date);
  return `<div class="news-featured-poster">
              <a href="${p.href}" target="_blank" rel="noopener noreferrer" class="news-featured-image">
                <img src="${p.posterSrc}" alt="${p.alt}" loading="lazy" width="400" height="300">
              </a>
              <div class="news-featured-info">
                <h3 class="news-featured-title">${p.title}</h3>
                <p class="news-featured-date">${dateDisplay}</p>
              </div>
            </div>`;
}

// ── 解析 ──────────────────────────────────────

const CARD_REGEX = /<a\b[^>]*class="news-featured-text-card"[^>]*>[\s\S]*?<\/a>/g;
const LIST_REGION = /(<div class="news-featured-text-list" id="news-text-list">)([\s\S]*?)(<\/div>)/;
const POSTER_BLOCK = /<div class="news-featured-poster">[\s\S]*?<\/div>\s*<\/div>/;

/** 从 HTML 中解析所有文字新闻卡片 */
export function parseTextCards(html: string): TextCardData[] {
  const cards: TextCardData[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(CARD_REGEX.source, 'g');
  while ((m = re.exec(html)) !== null) {
    const cardHtml = m[0];
    const href = cardHtml.match(/href="([^"]+)"/)?.[1] ?? '';
    const date = cardHtml.match(/data-date="([^"]+)"/)?.[1] ?? '';
    const title = cardHtml.match(/<span class="card-title">([\s\S]*?)<\/span>/)?.[1]?.trim() ?? '';
    cards.push({ href, date, title });
  }
  return cards;
}

/** 解析左侧海报新闻块 */
export function parsePoster(html: string): PosterData | null {
  const m = html.match(POSTER_BLOCK);
  if (!m) return null;
  const block = m[0];
  const href = block.match(/href="([^"]+)"/)?.[1] ?? '';
  const posterSrc = block.match(/<img[^>]*src="([^"]+)"/)?.[1] ?? '';
  const alt = block.match(/<img[^>]*alt="([^"]*)"/)?.[1] ?? '';
  const title = block.match(/<h3 class="news-featured-title">([\s\S]*?)<\/h3>/)?.[1]?.trim() ?? '';
  const dateDisplay = block.match(/<p class="news-featured-date">([\s\S]*?)<\/p>/)?.[1]?.trim() ?? '';
  return { title, date: '', dateDisplay, href, posterSrc, alt };
}

// ── 插入逻辑 ──────────────────────────────────

/**
 * 向 index.html 的 #news-text-list 插入一条文字新闻
 * 维持最多 6 条，按 data-date 降序重排
 */
export function insertTextCard(indexHtml: string, newCard: TextCardData): string {
  const match = indexHtml.match(LIST_REGION);
  if (!match) throw new Error('未找到 #news-text-list 区域，无法插入新闻卡片');
  const existing = parseTextCards(match[2]);
  const all = [...existing, newCard];
  const sorted = all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const newInner = '\n              ' + sorted.map(generateTextCard).join('\n              ') + '\n            ';
  return indexHtml.replace(match[0], `${match[1]}${newInner}${match[3]}`);
}

/**
 * 替换左侧海报新闻，并将旧海报降级为文字新闻插入右侧列表
 * （旧海报的 ISO 日期需通过 dateDisplay 反推，无法反推时跳过降级）
 */
export function replacePosterAndDemote(indexHtml: string, newPoster: PosterData): string {
  const oldPoster = parsePoster(indexHtml);
  let html = indexHtml.replace(POSTER_BLOCK, generatePosterBlock(newPoster));

  // 旧海报降级为文字卡片
  if (oldPoster && oldPoster.title) {
    const oldIso = parseCNDateToISO(oldPoster.dateDisplay ?? '');
    if (oldIso) {
      html = insertTextCard(html, {
        title: oldPoster.title,
        date: oldIso,
        href: oldPoster.href,
      });
    }
  }
  return html;
}

/** 将 "YYYY年M月D日" 反转为 "YYYY-MM-DD" */
function parseCNDateToISO(cn: string): string | null {
  const m = cn.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (!m) return null;
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}
