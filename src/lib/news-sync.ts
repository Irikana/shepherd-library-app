// 新闻板块同步：文章在新闻板块展示时，同步 index.html 新闻区 / news.html / en/index.html
// 0.0.7：合并文章与新闻撰写后，由统一的文章上传流程在 form.isNews 时调用
// 0.0.14：新增 removeNewsItem —— 隐藏新闻时从各新闻区移除卡片/列表项
import { getFile, putFile } from './github-client';
import { insertTextCard, replacePosterAndDemote } from '../templates/news-card';
import { insertNewsListItem } from '../templates/news-list-item';
import type { NewsKind } from '../types';

export interface NewsSyncOptions {
  title: string;
  titleEn: string;
  date: string; // YYYY-MM-DD
  kind: NewsKind;
  posterPath?: string; // image/poster/xxx.png（海报新闻时）
  /** 文章分类目录（相对 library/ 如 paper、works），用于生成正确链接 */
  categoryDir?: string;
}

/**
 * 同步新闻板块（主页新闻区 / news.html / 英文主页）
 * 各步骤独立 try/catch，单步失败不阻塞其余步骤；返回步骤说明
 */
export async function syncNewsSections(opts: NewsSyncOptions): Promise<string[]> {
  const steps: string[] = [];
  const { title, titleEn, date, kind, posterPath, categoryDir = 'paper' } = opts;
  const href = `./library/${categoryDir}/${titleEn}.html`;
  const enHref = `../library/${categoryDir}/${titleEn}.html`;

  // 1. 主页新闻区（中文）
  try {
    const { content, sha } = await getFile('index.html');
    const card = { title, date, href };
    const updated =
      kind === 'poster' && posterPath
        ? replacePosterAndDemote(content, {
            ...card,
            posterSrc: `./${posterPath}`,
            alt: title,
          })
        : insertTextCard(content, card);
    if (updated !== content) {
      await putFile('index.html', updated, { sha, message: `新闻同步：${title}（移动端 App）` });
      steps.push('index.html 新闻区已更新');
    }
  } catch {
    steps.push('index.html 更新失败（可手动添加）');
  }

  // 2. news.html 列表
  try {
    const { content, sha } = await getFile('news.html');
    const updated = insertNewsListItem(content, { title, date, href });
    if (updated !== content) {
      await putFile('news.html', updated, { sha, message: `新闻同步：${title}（移动端 App）` });
      steps.push('news.html 已更新');
    }
  } catch {
    steps.push('news.html 更新失败（可手动添加）');
  }

  // 3. 英文主页（卡片标题用英文标题）
  try {
    const { content, sha } = await getFile('en/index.html');
    const enCard = { title: titleEn, date, href: enHref };
    const updated =
      kind === 'poster' && posterPath
        ? replacePosterAndDemote(content, {
            ...enCard,
            posterSrc: `../${posterPath}`,
            alt: titleEn,
          })
        : insertTextCard(content, enCard);
    if (updated !== content) {
      await putFile('en/index.html', updated, { sha, message: `News sync: ${titleEn} (mobile app)` });
      steps.push('en/index.html 已更新');
    }
  } catch {
    steps.push('en/index.html 更新失败（可手动添加）');
  }

  return steps;
}

/**
 * 从新闻板块移除指定文章的卡片/列表项（隐藏新闻时调用）
 * 覆盖：index.html 新闻区（文字卡/海报）、news.html 列表、en/index.html
 * @param opts 与 syncNewsSections 相同（titleEn 用于定位 href）
 * @returns 步骤说明
 */
export async function removeNewsItem(opts: NewsSyncOptions): Promise<string[]> {
  const steps: string[] = [];
  const { titleEn, categoryDir = 'paper' } = opts;
  const href = `./library/${categoryDir}/${titleEn}.html`;
  const enHref = `../library/${categoryDir}/${titleEn}.html`;

  // 通用：移除包含指定 href 的 <a ...>...</a> 卡片（文字卡 / 列表项）
  const removeAnchor = (html: string, targetHref: string): string => {
    // 文字卡：<a ... class="news-featured-text-card" ...>...</a>
    const cardPattern = new RegExp(
      `\\n?\\s*<a\\b[^>]*href="${escapeRegex(targetHref)}"[^>]*class="news-featured-text-card"[^>]*>[\\s\\S]*?<\\/a>`,
      'g',
    );
    let next = html.replace(cardPattern, '');
    // news.html 列表项：<a ... class="news-list-item-text-only">...</a>
    const itemPattern = new RegExp(
      `\\n?\\s*<a\\b[^>]*href="${escapeRegex(targetHref)}"[^>]*class="news-list-item-text-only"[^>]*>[\\s\\S]*?<\\/a>`,
      'g',
    );
    next = next.replace(itemPattern, '');
    return next;
  };

  // 1. index.html（中文）
  try {
    const { content, sha } = await getFile('index.html');
    // 海报块整体移除（包含该 href 的 .news-featured-poster）
    let updated = content.replace(
      new RegExp(`<div class="news-featured-poster">[\\s\\S]*?href="${escapeRegex(href)}"[\\s\\S]*?<\\/div>\\s*<\\/div>`),
      '',
    );
    updated = removeAnchor(updated, href);
    if (updated !== content) {
      await putFile('index.html', updated, { sha, message: `新闻隐藏：${titleEn}（移动端 App）` });
      steps.push('index.html 新闻区已移除');
    }
  } catch {
    steps.push('index.html 移除失败（可手动添加）');
  }

  // 2. news.html
  try {
    const { content, sha } = await getFile('news.html');
    const updated = removeAnchor(content, href);
    if (updated !== content) {
      await putFile('news.html', updated, { sha, message: `新闻隐藏：${titleEn}（移动端 App）` });
      steps.push('news.html 已移除');
    }
  } catch {
    steps.push('news.html 移除失败（可手动添加）');
  }

  // 3. en/index.html
  try {
    const { content, sha } = await getFile('en/index.html');
    let updated = content.replace(
      new RegExp(`<div class="news-featured-poster">[\\s\\S]*?href="${escapeRegex(enHref)}"[\\s\\S]*?<\\/div>\\s*<\\/div>`),
      '',
    );
    updated = removeAnchor(updated, enHref);
    if (updated !== content) {
      await putFile('en/index.html', updated, { sha, message: `News hide: ${titleEn} (mobile app)` });
      steps.push('en/index.html 已移除');
    }
  } catch {
    steps.push('en/index.html 移除失败（可手动添加）');
  }

  return steps;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
