# SlyWrite 更新日志

## 0.0.18（2026-09-19）

与 0.0.17 相比的净变更：App 内置的「全部更新日志」补齐到最新版本，并把这个补齐动作固化进发版流程。

### 修复

- **「全部更新日志」页看不到 0.0.17 的内容**：该页读的是内置数据 `src/lib/changelog-data.ts`，由 `scripts/gen-changelog.js` 从 `changelog/` 目录生成；0.0.17 发版时漏跑了这一步，页面停在 0.0.16，时间条上也缺最新那一格。现已重新生成（收录 27 → 28 个版本），并在发版流程里把「重跑生成脚本」写成必须的一步，避免再次漏掉

### 版本与构建

- 版本号 `0.0.17` → `0.0.18`（`package.json` / `app.json` 两处同步），tag `v0.0.18` 触发构建并创建 Release
- 发版链新增检查项：写完 `changelog/CHANGELOG-{A.B.C}.md` 后必须 `node scripts/gen-changelog.js`，再提交、打 tag、推送 tag

### 验证

- `npx tsc --noEmit` 通过；生成脚本输出 28 个版本，App 内时间条最左端为 v0.0.18
