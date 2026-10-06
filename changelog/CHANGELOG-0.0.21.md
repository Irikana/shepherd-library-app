# SlyWrite 更新日志

## 0.0.21（2026-10-06）

与 0.0.20 相比的净变更：增强 Markdown 渲染保护，支持数字乘法算式自动防斜体、LaTeX 公式符号保护，提示框容器内表格智能识别，编辑器片段留空行。

### 缺陷修复与优化

- **算式与 Markdown 斜体符号冲突修复**：
  - `article-parser.ts` 与 `article.ts` 的 Markdown 解析前处理逻辑中，增加数字间乘号自动转义保护（如 `30*4` 自动保护转义为 `30\*4`），防止 Markdown 引擎误将其识别为成对斜体 `<em>`。
- **LaTeX 公式符号保护**：
  - 在正文解析预处理中对 `$$...$$` 独立公式与 `$...$` 行内公式进行占位保护，避免公式内部的下标 `_`、星号 `*` 等被 Markdown 引擎破坏。
- **提示框容器内 Markdown 表格与格式解析增强**：
  - 规范化自定义提示框（`function-box-blue`、`quote-box-grey`、`notice-box-red`、`callout`）前后的换行排版，确保 `<div>` 标签与内部 Markdown 内容之间自动补齐空行，使内部的 Markdown 表格（`| 表头 |`）与列表能够被 `marked` 正常解析为 HTML 标签。
- **编辑器片段模版优化**：
  - `MarkdownEditor.tsx` 中的蓝框、灰引、红警插入片段默认在容器标签与内容占位符之间补充空行，避免用户在提示框内输入表格时出现解析失效。

### 版本与构建

- 版本号 `0.0.20` → `0.0.21`（`package.json` / `app.json` / `CHANGELOG-0.0.21.md` 三处同步），执行 `node scripts/gen-changelog.js` 重新生成 App 内置更新日志数据。
- tag `v0.0.21`。
