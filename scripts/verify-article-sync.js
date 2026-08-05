// 验证 article-sync 的 insertIntoLibraryHtml / removeFromLibraryHtml 对英文版结构的行为
const fs = require('fs');
const enLib = fs.readFileSync('../Irikana.github.io/en/library/library.html', 'utf8');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function insertIntoLibraryHtml(html, category, fileName, displayTitle, english = false) {
  const anchor = english ? category.enAnchor : category.anchor;
  const anchorIdx = html.indexOf(`>${anchor}</h4>`);
  if (anchorIdx < 0) return html;
  const ulStart = html.indexOf('<ul class="article-list">', anchorIdx);
  if (ulStart < 0) return html;
  const ulEnd = html.indexOf('</ul>', ulStart);
  if (ulEnd < 0) return html;
  const href = `${category.dir}/${fileName}`;
  if (html.slice(ulStart, ulEnd).includes(`href="${href}"`)) return html;
  const li = english
    ? `\n                <li><a href="../../library/${href}">${displayTitle}</a></li>`
    : `\n              <li><a href="${href}">${displayTitle}</a></li>`;
  return html.slice(0, ulEnd) + li + html.slice(ulEnd);
}

function removeFromLibraryHtml(html, category, fileName) {
  const baseName = fileName.split('/').pop() || fileName;
  const pattern = new RegExp(
    `\\n\\s*<li(?=[\\s>])[^>]*>\\s*<a\\b[^>]*href="[^"]*${escapeRegex(category.dir)}/${escapeRegex(baseName)}"[\\s\\S]*?<\\/li>`,
    'g',
  );
  return html.replace(pattern, '');
}

const category = { key: 'normal', label: '普通文章', dir: 'paper', anchor: '普通文章', enAnchor: 'Normal Articles' };

// 测试 A：英文版插入一篇新文章
const inserted = insertIntoLibraryHtml(enLib, category, 'brand-new-article.html', 'Brand New Article', true);
console.log('测试A 英文版插入:');
console.log('  插入成功:', inserted.includes('../../library/paper/brand-new-article.html'), '(期望 true)');
console.log('  href 正确(无多余 library/):', inserted.includes('../../library/library/paper/') === false, '(期望 true)');

// 测试 B：英文版移除已存在的条目（Test News on 20260802 N1）
const removed = removeFromLibraryHtml(enLib, category, 'Test News on 20260802 N1.html');
console.log('');
console.log('测试B 英文版移除:');
console.log('  移除成功:', !removed.includes('Test News on 20260802 N1'), '(期望 true)');
console.log('  其他条目保留:', removed.includes('INSTLAB CLOUD'), '(期望 true)');
