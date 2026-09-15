// CI 版本号注入：把 package.json 的三位正式版本（A.B.C）扩成 A.B.C-<构建号>，
// 写入 package.json / app.json（仅工作区，不提交），供构建产物与「关于」页读取。
// 规则出处见工作区根 AGENTS.md「版本号规则（全软件统一）」：第四位是测试构建号，
// 每次 CI 构建自动 +1（以 GitHub run_number 为源），正式发布只递增第三位且由 tag 决定。
// 用法：node scripts/ci-version.js <build-number> [--official]
//   --official（tag 构建）：不改写版本字符串（保持 A.B.C），但同样用构建号填 versionCode，
//   使 versionCode 在「测试构建 / 正式构建」两条通道上严格单调递增，避免出现装不上的降级包。
// 输出：GITHUB_OUTPUT 中 base=A.B.C、full=<写入产物的版本>（若在该环境）。
'use strict';
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const official = args.includes('--official');
const buildNo = args.find((a) => /^\d+$/.test(a));
if (!buildNo) {
  console.error('[ci-version] 用法：node scripts/ci-version.js <构建号（纯数字）> [--official]');
  process.exit(1);
}

const root = path.join(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const appPath = path.join(root, 'app.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
// 兼容四段存量（如 0.0.15.11）：取前三段作为正式版本
const base = pkg.version.split('.').slice(0, 3).join('.');
// 测试构建号写成 semver 前发布标识（A.B.C-N）而不是四段点分（A.B.C.N）：
// electron-builder 对四段点分号直接判 Invalid version（2026-09-14 Lite CI 实证），
// 全软件统一按此格式产出，展示层按 '-' 拆分理解「正式版本 + 构建号」。
const full = official ? base : `${base}-${buildNo}`;

pkg.version = full;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

const app = JSON.parse(fs.readFileSync(appPath, 'utf8'));
app.expo.version = full;
if (app.expo.android) {
  // versionCode 必须严格递增且为正整数：run_number 天然满足（两条通道共用一个计数）；上限防护 Android 整型
  const code = Number(buildNo);
  if (code > 0 && code < 2100000000) app.expo.android.versionCode = code;
}
fs.writeFileSync(appPath, JSON.stringify(app, null, 2) + '\n');

console.log(
  `[ci-version] 正式版本 ${base} -> 产物版本 ${full}（versionCode=${buildNo}，${official ? '正式发布' : '测试构建'}，仅工作区改动，不提交）`
);

const out = process.env.GITHUB_OUTPUT;
if (out) {
  fs.appendFileSync(out, `base=${base}\nfull=${full}\n`);
}

