# SlyWrite 更新日志

## 0.0.22（2026-10-06）

与 0.0.21 相比的净变更：表格生成自动包裹 `.sl-table-wrapper` 响应式容器，全面解决移动端表格溢出纸皮与页面缩放问题；算式乘法保护支持括号与复杂数学式。

### 缺陷修复与优化

- **移动端表格响应式包裹**：
  - `article-parser.ts`、`templates/article.ts` 以及 `templates/knowledge-entry.ts` 在 Markdown 渲染为 HTML 后，自动为 `<table>` 元素包裹 `<div class="sl-table-wrapper">` 响应式外层容器。
  - 配合主站 CSS，杜绝表格在手机等窄屏设备下撑破文章纸皮、触发浏览器整体缩放而破坏页面版心的问题，实现平滑横向滚动浏览。
- **数学算式乘法保护规则增强**：
  - 增强 Markdown 预处理中的乘号防斜体正则（`replace(/([\d\)])\s*\*+\s*([\d\(])/g, '$1\\*$2')`），全面覆盖带括号的乘算式（如 `5*(8`、`) * (` 等），彻底杜绝复杂长算式误触斜体。

### 版本与构建

- 版本号 `0.0.21` → `0.0.22`（`package.json` / `app.json` / `CHANGELOG-0.0.22.md` 三处同步），执行 `node scripts/gen-changelog.js` 重新生成 App 内置更新日志数据。
- tag `v0.0.22`。
