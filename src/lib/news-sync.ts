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
 * 新闻板块同步（主页新闻区 / news.html / 英文主页）
 * 各步骤独立 try/catch，单步失败不阻塞其余步骤；返回步骤说明
 * 失败说明一定带上具体原因（历史教训：静默「可手动添加」让 Opus 5 那条新闻悄悄丢了）
 */
export async function syncNewsSections(opts: NewsSyncOptions): Promise<string[]> {
  const steps: string[] = [];
  const { title, titleEn, date, kind, posterPath, categoryDir = 'paper' } = opts;
  const href = `./library/${categoryDir}/${titleEn}.html`;
  const enHref = `../library/${categoryDir}/${titleEn}.html`;
  const why = (e: unknown) => (e as Error).message || String(e);

  if (kind === 'poster' && !posterPath) {
    steps.push('注意：选择了海报新闻但没有海报图片，已按文字新闻处理');
  }

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
    } else {
      steps.push('index.html 新闻区无变化（可能已存在）');
    }
  } catch (e) {
    steps.push(`index.html 更新失败：${why(e)}`);
  }

  // 2. news.html 列表
  try {
    const { content, sha } = await getFile('news.html');
    const updated = insertNewsListItem(content, { title, date, href });
    if (updated !== content) {
      await putFile('news.html', updated, { sha, message: `新闻同步：${title}（移动端 App）` });
      steps.push('news.html 已更新');
    } else {
      steps.push('news.html 无变化');
    }
  } catch (e) {
    steps.push(`news.html 更新失败：${why(e)}`);
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
    } else {
      steps.push('en/index.html 无变化');
    }
  } catch (e) {
    steps.push(`en/index.html 更新失败：${why(e)}`);
  }

  return steps;
}

/** 新闻在板块中的实际存在状态（用于编辑页显示与「补发」判断） */
export interface NewsPresence {
  /** 主页中文新闻区内（文字卡或海报） */
  inIndex: boolean;
  /** 是否正占据主页左侧海报位 */
  isPoster: boolean;
  /** news.html 全量列表内 */
  inNewsList: boolean;
  /** 英文主页新闻区内 */
  inEnIndex: boolean;
}

/**
 * 查询某篇文章当前是否已在新闻板块（三处逐一核对）
 * 单处读取失败按「未知=false」处理并在 errors 中说明
 */
export async function checkNewsPresence(
  opts: { titleEn: string; categoryDir?: string },
): Promise<{ presence: NewsPresence; errors: string[] }> {
  const { titleEn, categoryDir = 'paper' } = opts;
  const href = `./library/${categoryDir}/${titleEn}.html`;
  const enHref = `../library/${categoryDir}/${titleEn}.html`;
  const errors: string[] = [];
  const presence: NewsPresence = { inIndex: false, isPoster: false, inNewsList: false, inEnIndex: false };

  const probe = async (file: string, needle: string): Promise<string | null> => {
    try {
      const { content } = await getFile(file);
      return content.includes(needle) ? content : null;
    } catch (e) {
      errors.push(`${file} 读取失败：${(e as Error).message}`);
      return null;
    }
  };

  const indexHtml = await probe('index.html', href);
  if (indexHtml) {
    presence.inIndex = true;
    const poster = indexHtml.match(POSTER_REGION);
    presence.isPoster = !!poster && poster[0].includes(href);
  }
  presence.inNewsList = (await probe('news.html', href)) !== null;
  presence.inEnIndex = (await probe('en/index.html', enHref)) !== null;

  return { presence, errors };
}

/** 主页左侧海报块（用于判断新闻当前是海报形态还是文字形态） */
const POSTER_REGION = /<div class="news-featured-poster">[\s\S]*?<\/div>\s*<\/div>/;

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
  const why = (e: unknown) => (e as Error).message || String(e);

  // 通用：移除包含指定 href 的 <a ...>...</a> 卡片（文字卡 / 列表项）
  // 用 lookahead 断言 href 与 class 同时存在，属性顺序无关（更健壮）
  const removeAnchor = (html: string, targetHref: string): string => {
    // 文字卡：<a ... class="news-featured-text-card" ...>...</a>
    const cardPattern = new RegExp(
      `\\n?\\s*<a\\b(?=[^>]*href="${escapeRegex(targetHref)}")(?=[^>]*class="news-featured-text-card")[^>]*>[\\s\\S]*?<\\/a>`,
      'g',
    );
    let next = html.replace(cardPattern, '');
    // news.html 列表项：<a ... class="news-list-item-text-only">...</a>
    const itemPattern = new RegExp(
      `\\n?\\s*<a\\b(?=[^>]*href="${escapeRegex(targetHref)}")(?=[^>]*class="news-list-item-text-only")[^>]*>[\\s\\S]*?<\\/a>`,
      'g',
    );
    next = next.replace(itemPattern, '');
    return next;
  };

  /**
   * 仅当目标 href 位于左侧海报块内时，才删除整个海报块；
   * 目标不在海报中时原样返回——绝不触碰海报块，避免清空整个新闻区
   */
  const removePosterIfMatches = (html: string, targetHref: string): string => {
    const posterBlock = /<div class="news-featured-poster">[\s\S]*?<\/div>\s*<\/div>/;
    const m = html.match(posterBlock);
    if (!m) return html;
    if (!m[0].includes(`href="${targetHref}"`)) return html;
    return html.replace(posterBlock, '');
  };

  // 1. index.html（中文）
  try {
    const { content, sha } = await getFile('index.html');
    let updated = removePosterIfMatches(content, href);
    updated = removeAnchor(updated, href);
    if (updated !== content) {
      await putFile('index.html', updated, { sha, message: `新闻隐藏：${titleEn}（移动端 App）` });
      steps.push('index.html 新闻区已移除');
    } else {
      steps.push('index.html 新闻区未找到该卡片');
    }
  } catch (e) {
    steps.push(`index.html 移除失败：${why(e)}`);
  }

  // 2. news.html
  try {
    const { content, sha } = await getFile('news.html');
    const updated = removeAnchor(content, href);
    if (updated !== content) {
      await putFile('news.html', updated, { sha, message: `新闻隐藏：${titleEn}（移动端 App）` });
      steps.push('news.html 已移除');
    } else {
      steps.push('news.html 未找到该条目');
    }
  } catch (e) {
    steps.push(`news.html 移除失败：${why(e)}`);
  }

  // 3. en/index.html
  try {
    const { content, sha } = await getFile('en/index.html');
    let updated = removePosterIfMatches(content, enHref);
    updated = removeAnchor(updated, enHref);
    if (updated !== content) {
      await putFile('en/index.html', updated, { sha, message: `News hide: ${titleEn} (mobile app)` });
      steps.push('en/index.html 已移除');
    } else {
      steps.push('en/index.html 未找到该卡片');
    }
  } catch (e) {
    steps.push(`en/index.html 移除失败：${why(e)}`);
  }

  return steps;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
