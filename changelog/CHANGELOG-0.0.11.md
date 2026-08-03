# SlyWrite 更新日志

## 0.0.11（2026-08）

与 0.0.10 相比的净变更：

### 新增

- **编辑已有文章时支持隐藏**：EditMetaForm 添加「隐藏文章」开关，保存后文章不在 library.html 公开列表与新闻板块展示，仅可通过站内搜索找到。隐藏状态存储在 HTML 中（`data-article-hidden`），下次编辑时自动读取
- **恢复「网站版本」显示**：更新与版本页重新显示牧羊人图书馆网站（Irikana.github.io）的版本号（alpha-xxx），并附说明"与 App 更新无关"
- **App 内直接下载并安装 APK**：更新页「下载 APK」按钮现在使用 expo-file-system 在 App 后台下载，完成后通过系统 Intent 自动弹出安装界面，不再跳转浏览器；若自动安装失败则兜底浏览器下载

### 修复

- **更新页版本检查混淆**：此前 `fetchLatestRelease` 误用了 `Irikana.github.io`（网站仓库）的 Release tag（alpha-0.0.1），导致更新页始终显示旧版 alpha 信息，无法检测 App 仓库的正确版本；现已拆分为 `fetchAppRelease()`（App 仓库 shepherd-library-app）和 `fetchSiteRelease()`（网站仓库 Irikana.github.io），各自独立

### 其他

- 版本号提升至 0.0.11（package.json / app.json / CI artifact name）