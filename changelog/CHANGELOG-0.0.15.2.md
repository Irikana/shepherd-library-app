# SlyWrite 更新日志

## 0.0.15.2（2026-08-10）

与 0.0.15.1 相比的净变更：

### 修复

- **手机端便携式导航仪无法展开（关键修复，App 模板源头）**：文章页模板（`src/templates/article.ts`）的内联脚本与网站 `library-dynamic.js` 的 `MobileNavToggle` 模块同时对便携式导航仪（`.quick-nav`）绑定点击展开/收起事件，两套处理器互相抵消，导致手机端点击导航仪无法展开。现已移除模板内联的 quick-nav 点击绑定，统一交由 `library-dynamic.js` 处理（网站侧 57 个既有页面已同步清理，含标准变量名 46 页与压缩变量名 11 页）
- **脚注链接双重箭头（App 模板源头）**：正文脚注引用 `[n]` 与脚注返回链接（↩ 文本箭头）位于内容区，被通用链接箭头规则自动追加 SVG 箭头，出现双重箭头。已在网站 CSS 添加 `.article-footnote-ref a::after`、`.article-footnote-back::after { content: none }` 排除规则（App 生成的文章由 `library-dynamic.js` 加载网站 CSS，随网站生效）

### 其他

- 版本号提升至 0.0.15.2（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 3
