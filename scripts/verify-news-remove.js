// 验证 removeNewsItem 修复逻辑（与 src/lib/news-sync.ts 中一致）
const fs = require('fs');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeAnchor(html, targetHref) {
  const cardPattern = new RegExp(
    `\\n?\\s*<a\\b(?=[^>]*href="${escapeRegex(targetHref)}")(?=[^>]*class="news-featured-text-card")[^>]*>[\\s\\S]*?<\\/a>`,
    'g',
  );
  let next = html.replace(cardPattern, '');
  const itemPattern = new RegExp(
    `\\n?\\s*<a\\b(?=[^>]*href="${escapeRegex(targetHref)}")(?=[^>]*class="news-list-item-text-only")[^>]*>[\\s\\S]*?<\\/a>`,
    'g',
  );
  next = next.replace(itemPattern, '');
  return next;
}

function removePosterIfMatches(html, targetHref) {
  const posterBlock = /<div class="news-featured-poster">[\s\S]*?<\/div>\s*<\/div>/;
  const m = html.match(posterBlock);
  if (!m) return html;
  if (!m[0].includes(`href="${targetHref}"`)) return html;
  return html.replace(posterBlock, '');
}

const html = fs.readFileSync('../Irikana.github.io/index.html', 'utf8');

// 测试1：隐藏一篇文字新闻（restless.html，不在海报中）——不应动海报和其他卡片
const href = './library/paper/restless.html';
let updated = removePosterIfMatches(html, href);
updated = removeAnchor(updated, href);
const cardCount = (updated.match(/news-featured-text-card/g) || []).length;
const posterCount = (updated.match(/news-featured-poster/g) || []).length;
console.log('测试1 隐藏文字新闻 restless:');
console.log('  剩余文字卡数量:', cardCount, '(期望 5)');
console.log('  海报块保留:', posterCount > 0, '(期望 true)');
console.log('  其他新闻保留:', updated.includes('semantic-visual-component-update.html') && updated.includes('INSTLAB CLOUD'), '(期望 true)');
console.log('  目标卡已移除:', !updated.includes('restless.html'), '(期望 true)');
console.log('');

// 测试2：隐藏海报新闻（The Birth of SlyWrite.html，在海报中）——应删海报，不动文字卡
const href2 = './library/paper/The Birth of SlyWrite.html';
let u2 = removePosterIfMatches(html, href2);
u2 = removeAnchor(u2, href2);
console.log('测试2 隐藏海报新闻 SlyWrite诞生:');
console.log('  海报块已删:', !u2.includes('news-featured-poster'), '(期望 true)');
console.log('  文字卡保留:', (u2.match(/news-featured-text-card/g) || []).length, '(期望 6)');

// 测试3：en/index.html 同样验证
const enHtml = fs.readFileSync('../Irikana.github.io/en/index.html', 'utf8');
const enHref = '../library/paper/restless.html';
let u3 = removePosterIfMatches(enHtml, enHref);
u3 = removeAnchor(u3, enHref);
console.log('');
console.log('测试3 en/index.html 隐藏文字新闻 restless:');
console.log('  海报块保留:', u3.includes('news-featured-poster'), '(期望 true)');
console.log('  目标卡已移除:', !u3.includes('restless.html'), '(期望 true)');

// 测试4：news.html 列表项移除
const newsHtml = fs.readFileSync('../Irikana.github.io/news.html', 'utf8');
const before = (newsHtml.match(/news-list-item-text-only/g) || []).length;
const u4 = removeAnchor(newsHtml, './library/paper/restless.html');
const after = (u4.match(/news-list-item-text-only/g) || []).length;
console.log('');
console.log('测试4 news.html 列表项:', before, '->', after, '(期望 -1)');
console.log('  其他条目保留:', u4.includes('INSTLAB CLOUD') && u4.includes('SlyWrite'), '(期望 true)');
