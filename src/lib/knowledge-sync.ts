// 知识馆条目同步：上传词条页 + 更新对应分类页的条目列表
// 分类页结构：<section id="section-notice"><div class="function-box-blue">此分类下暂无条目</div></section>
// 首次有条目时：将"暂无条目"替换为条目列表；之后在列表 <ul> 中插入新条目
import { getFile, putFile } from './github-client';
import type { KnowledgeCategory } from '../types';
import { KNOWLEDGE_CATEGORIES } from '../templates/knowledge-entry';

export interface KnowledgeSyncOptions {
  title: string;
  titleEn: string;
  category: KnowledgeCategory;
  html: string;
}

/** 分类页的仓库路径 */
function categoryPagePath(category: KnowledgeCategory): string {
  return `knowledge-hall/categories/${KNOWLEDGE_CATEGORIES[category].page}`;
}

/** 词条页的仓库路径 */
function entryPath(category: KnowledgeCategory, titleEn: string): string {
  return `knowledge-hall/categories/${category}/${titleEn}.html`;
}

/** 分类页中的条目列表片段（与知识馆页面风格一致，扁平化无圆角） */
function entryListSnippet(category: KnowledgeCategory, entries: { title: string; href: string }[]): string {
  const items = entries
    .map((e) => `      <li><a href="${e.href}">${e.title}</a></li>`)
    .join('\n');
  return `<section id="section-entries">
    <h2>${KNOWLEDGE_CATEGORIES[category].label}词条</h2>
    <ul class="article-list">
${items}
    </ul>
  </section>`;
}

/**
 * 在分类页中插入/更新词条列表：
 * - 已存在 #section-entries 列表：在 <ul> 末尾插入新条目（防重复）
 * - 不存在（还是"暂无条目"）：把 #section-notice 的蓝色提示框替换为条目列表
 */
function insertIntoCategoryPage(
  pageHtml: string,
  category: KnowledgeCategory,
  title: string,
  titleEn: string,
): string {
  const href = `${category}/${titleEn}.html`;
  // 防重复：已存在该 href
  if (pageHtml.includes(`href="${href}"`)) return pageHtml;

  // 已有条目列表
  const listMatch = pageHtml.match(/<ul class="article-list">([\s\S]*?)<\/ul>/);
  if (listMatch) {
    const li = `      <li><a href="${href}">${title}</a></li>`;
    return pageHtml.replace(listMatch[0], `<ul class="article-list">${listMatch[1]}${li}\n    </ul>`);
  }

  // 还是"暂无条目"：替换提示区
  // 结构差异：phenomenon/traceable 用 <section id="section-notice"> 包裹；recallable 是裸 <div class="function-box-blue">
  const snippet = entryListSnippet(category, [{ title, href }]);
  const sectionNotice = pageHtml.match(/<section id="section-notice">[\s\S]*?<\/section>/);
  if (sectionNotice) {
    return pageHtml.replace(sectionNotice[0], snippet);
  }
  const bareNotice = pageHtml.match(/<div class="function-box-blue">[\s\S]*?此分类下暂无条目[\s\S]*?<\/div>/);
  if (bareNotice) {
    return pageHtml.replace(bareNotice[0], snippet);
  }

  // 无锚点可插入：在 </main> 前追加
  const idx = pageHtml.lastIndexOf('</main>');
  if (idx < 0) return pageHtml;
  return pageHtml.slice(0, idx) + snippet + '\n\n' + pageHtml.slice(idx);
}

/**
 * 发布知识条目：上传词条页 + 同步分类页列表
 * @returns 步骤说明（含失败信息，调用方展示给用户）
 */
export async function publishKnowledgeEntry(opts: KnowledgeSyncOptions): Promise<string[]> {
  const steps: string[] = [];
  const { title, titleEn, category, html } = opts;
  const pagePath = categoryPagePath(category);

  // 1. 上传词条页
  try {
    await putFile(entryPath(category, titleEn), html, {
      message: `新增知识词条：${title}（移动端 App）`,
    });
    steps.push(`词条已上传：knowledge-hall/categories/${category}/${titleEn}.html`);
  } catch (e) {
    steps.push(`词条上传失败：${(e as Error).message}`);
    return steps;
  }

  // 2. 更新分类页列表
  try {
    const { content, sha } = await getFile(pagePath);
    const updated = insertIntoCategoryPage(content, category, title, titleEn);
    if (updated !== content) {
      await putFile(pagePath, updated, {
        sha,
        message: `知识词条列表同步：${title}（移动端 App）`,
      });
      steps.push(`${pagePath} 已更新词条列表`);
    } else {
      steps.push(`${pagePath} 已存在该词条，跳过列表更新`);
    }
  } catch (e) {
    steps.push(`分类页列表更新失败：${(e as Error).message}（可稍后手动添加）`);
  }

  return steps;
}
