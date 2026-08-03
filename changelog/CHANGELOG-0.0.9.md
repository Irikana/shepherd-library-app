# SlyWrite 更新日志

## 0.0.9（2026-08）

与 0.0.8 相比的净变更：

### 新增

- **内容编辑正文撰写化**：编辑已有文章/新闻时，「正文」标签页由 HTML 源码改为撰写式体验——自动把正文区段 HTML 还原为 Markdown，复用撰写页的 Markdown 编辑器（H2/H3/加粗/链接/图片/蓝框/灰引/红警/Callout/折叠块/脚注/数学公式等完整工具栏），保存时渲染回 HTML 写回原文件；视觉组件原样保留，元数据表单（标题/作者/日期/性质/标签增删等）与正文、源码三标签互不覆盖。还原失败时可退回「源码」标签页编辑

### 修复

- **内容编辑始终只有源码（关键修复）**：文章识别条件 `html.includes('class="page-title-main"')` 无法匹配实际的多 class 写法 `class="section-padding page-title-main"`，导致所有文章（含新闻）都未被识别为文章，编辑器从不显示元数据表单。现改为 class token 匹配，仓库 51 个文章页均可识别；打开中文文章即可看到「元数据 / 正文 / 源码」三标签页，表单（标题/作者/日期/性质/标签增删等）与 Markdown 正文编辑正常工作
- **移除无意义的「网站版本（alpha）」**：更新与版本页、首页此前显示图书馆网站的 alpha 版本号（alpha-xxx，久未更新、含义不明、与 App 更新无关）；现已从界面彻底移除，更新页只显示 App 自身版本与 App 仓库 Release，并移除首页「刷新版本号」按钮及登录时的网站版本号拉取请求
- **更新页版本混淆**：更新与版本页「最新版本」明确标注为 App 自身版本（读取 App 仓库 GitHub Releases 按版本号取最大），下载按钮始终显示（不限于有新版本时），检查失败提供重试
- **登录页 SlyWrite 少一个 e**：登录页与首页品牌标题加 `numberOfLines` + `adjustsFontSizeToFit`，防止部分设备字体渲染时最后一个字符（e）被裁切，浅色/深色模式均完整显示

### 其他

- **SlyWrite 官网独立成站**：官网从图书馆项目 `Irikana.github.io/slywrite/` 迁移至 App 项目 `site/` 目录，由 GitHub Actions 发布到 gh-pages 分支，新地址 `https://irikana.github.io/shepherd-library-app/`；旧地址自动重定向。网站「当前版本」不再硬编码，改为读取 App 仓库 GitHub Releases 动态显示；网站样式/logo 已随站自包含（不再依赖图书馆站点资源）
- 版本号提升至 0.0.9（app.json / package.json）
- APK 构建产物命名同步为 `shepherd-library-app-v0.0.9-release`
