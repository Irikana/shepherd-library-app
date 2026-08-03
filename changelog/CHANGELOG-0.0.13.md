# SlyWrite 更新日志

## 0.0.13（2026-08）

与 0.0.12 相比的净变更：

### 修复

- **上传路径缺少 library/ 前缀（关键修复）**：`compose/preview.tsx` 中文件路径拼接为 `category.dir/titleEn.html`（如 `paper/xxx.html`），实际写到了仓库根目录而非 `library/paper/`。现已添加 `library/` 前缀，同步修正站内搜索 urlPath、library.html 索引链接（现在用 `paper/xxx.html` 相对格式）、新闻板块链接（按分类动态拼接避免硬编码 `paper/`）
- **编辑页修改 hidden 状态不生效（关键修复）**：之前在 editor.tsx 中修改 hidden 开关仅影响 HTML 文件内的 `data-article-hidden` 标记，不会同步更新 `library.html` 公开列表，导致"想隐藏已发布文章但网站不变"。现已实现在保存时自动检测 hidden 状态变化，若从 OFF→ON 则从 library.html 和 en/library.html 中移除文章条目，ON→OFF 则插入条目
- **APK 自动安装不弹出**：改用 `expo-intent-launcher` 的 `startActivityAsync` 发送 `ACTION_VIEW` Intent（带 `application/vnd.android.package-archive` MIME 和 `FLAG_GRANT_READ_URI_PERMISSION`），正确唤起 Android 安装界面
- **源码编辑器滚动与误触输入法**：移除 CodeEditor 的 `nestedScrollEnabled` 和 `scrollEnabled={false}` 解决滚动冲突；改用 `keyboardShouldPersistTaps="always"` 避免误触弹出键盘

### 新增

- **APK 下载进度条**：下载按钮下方显示彩色进度条和百分比，下载中实时更新

### 其他

- 版本号提升至 0.0.13（package.json / app.json / CI artifact name）