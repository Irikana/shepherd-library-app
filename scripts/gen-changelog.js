// 生成静态更新日志数据：读取 changelog/CHANGELOG-*.md，解析为结构化块，
// 输出 src/lib/changelog-data.ts（App 内「全部更新日志」页内置展示，不联网）。
// 每次发布新版本后运行：node scripts/gen-changelog.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHANGELOG_DIR = path.join(ROOT, 'changelog');
const OUT_FILE = path.join(ROOT, 'src', 'lib', 'changelog-data.ts');

/** 从文件名提取版本号：CHANGELOG-0.0.15.3.md → 0.0.15.3 */
const verOf = (name) => name.replace(/^CHANGELOG-/, '').replace(/\.md$/, '');

/** 四段版本号比较，升序（0.0.15 < 0.0.15.1） */
const compareVersions = (a, b) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
};

/** 解析单个 changelog 文件为结构化块（跳过文件头标题与「与上一版本相比」说明行） */
function parseChangelog(md, key) {
  const blocks = [];
  let title = key;
  for (const raw of md.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('# SlyWrite 更新日志')) continue;
    if (line.startsWith('## ')) {
      title = line.slice(3).trim();
      blocks.push({ kind: 'version', text: title });
    } else if (line.startsWith('### ')) {
      blocks.push({ kind: 'section', text: line.slice(4).trim() });
    } else if (line.startsWith('- ')) {
      blocks.push({ kind: 'bullet', text: line.slice(2).trim() });
    }
  }
  return { key, title, blocks };
}

const files = fs
  .readdirSync(CHANGELOG_DIR)
  .filter((f) => f.startsWith('CHANGELOG-') && f.endsWith('.md'))
  .sort((a, b) => compareVersions(verOf(a), verOf(b)));

const entries = files.map((f) =>
  parseChangelog(fs.readFileSync(path.join(CHANGELOG_DIR, f), 'utf8'), verOf(f)),
);

const data = `// 自动生成：node scripts/gen-changelog.js —— 请勿手改
// 静态内置的全部更新日志（与 changelog/CHANGELOG-*.md 同步），App 内离线展示。
export type ChangelogBlockKind = 'version' | 'section' | 'bullet';

export interface ChangelogBlock {
  kind: ChangelogBlockKind;
  text: string;
}

export interface ChangelogEntry {
  key: string;
  title: string;
  blocks: ChangelogBlock[];
}

export const CHANGELOG_DATA: ChangelogEntry[] = ${JSON.stringify(entries, null, 2)};
`;

fs.writeFileSync(OUT_FILE, data, 'utf8');
console.log(`生成 ${OUT_FILE}（共 ${entries.length} 个版本）`);
