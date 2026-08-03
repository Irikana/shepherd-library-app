# SlyWrite 更新日志

## 0.0.10（2026-08）

与 0.0.9 相比的净变更：

### 修复

- **内容编辑始终只有源码（关键修复）**：文章识别条件 `html.includes('class="page-title-main"')` 无法匹配实际的多 class 写法 `class="section-padding page-title-main"`，导致所有文章（含新闻）都未被识别为文章，编辑器从不显示元数据表单。现改为 class token 匹配，仓库 51 个文章页均可识别；打开中文文章即可看到「元数据 / 正文 / 源码」三标签页，表单（标题/作者/日期/性质/标签增删等）与 Markdown 正文编辑正常工作。英文版（en/）文章由网站同步生成、结构为英文标签，自动排除不做表单编辑
- **移除无意义的「网站版本（alpha）」**：更新与版本页、首页此前显示图书馆网站的 alpha 版本号（alpha-xxx，久未更新、含义不明、与 App 更新无关）；现已从界面彻底移除，更新页只显示 App 自身版本与 App 仓库 Release，并移除首页「刷新版本号」按钮及登录时的网站版本号拉取请求

### 其他

- 版本号提升至 0.0.10（app.json / package.json）
- APK 构建产物命名同步为 `shepherd-library-app-v0.0.10-release`
