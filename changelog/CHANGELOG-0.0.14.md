# SlyWrite 更新日志

## 0.0.14（2026-08）

与 0.0.13 相比的净变更：

### 修复

- **隐藏文章仍然不生效（关键修复）**：此前编辑页/发布页勾选隐藏后只改 HTML 文件内的 `data-article-hidden` 标记，不会从公开列表移除已存在的条目（发布流程的 hidden 分支甚至只跳过插入、从不删除）。现已修复：
  - **发布流程（preview.tsx）**：hidden 文章不再只跳过同步，而是主动从 `library.html` / `en/library/library.html` / 新闻板块（index.html 新闻区、news.html、en/index.html）移除已有条目
  - **编辑页（editor.tsx）**：保存时若 hidden 状态变化，同步从 library.html 移除（中英文）或插入；新闻文章额外同步/移除新闻板块
  - **removeFromLibraryHtml 修复英文版匹配**：英文版链接形如 `href="../../library/paper/xxx.html"`，旧正则只匹配 `href="paper/xxx.html"` 导致英文版移除失败；已改为通用匹配
  - **新增 removeNewsItem**：从 index.html / news.html / en/index.html 移除指定新闻的卡片/列表项/海报块

### 新增

- **文件打开加载反馈**：内容编辑（文件浏览）点击文件后立即显示加载指示器，读取完成后跳转编辑器，不再"卡一下没反应"
- **APK 下载残留优化**：安装包按版本号命名（`app-release-vX.Y.Z.apk`）；检测到已下载的同版本安装包时直接唤起安装界面，不重复下载；清理不同版本的历史残留
- **国内镜像下载加速**：下载 APK 优先走 `ghproxy.com` 公共代理（零部署），失败自动回退 GitHub 官方直连

### 其他

- 版本号提升至 0.0.14（package.json / app.json / CI artifact name）
- 发布约定变更：不再在本地归档 APK（`apk/` 目录已删除），Release 即最终产物