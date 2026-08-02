# SlyWrite 更新日志

## 0.0.5（2026-08）

与 0.0.4 相比的净变更：

### 修复

- **海报选图修复**：修复「ExponentImagePicker.launchImageLibraryAsync has been rejected / AppDirectories not found」——expo-image-picker 需要 `AppDirectoriesModuleInterface`，由 `expo-file-system` 提供，现安装 `expo-file-system@~18.0.12`；海报仍为原图上传（不压缩）
- **文章分类移入元数据表单**：分类选择（普通/作品/杂物/测试文章）从预览页移入元数据表单（性质之后），预览页仅显示所选分类提示，不再出现选择器
- **草稿数量即时显示**：应用启动时即加载草稿列表，首页「草稿箱」卡片无需进入页面即可看到篇数提醒

### 新闻发布

- **新增正文预览**：新闻发布页底部新增「生成预览」按钮，与文章一致地以网站样式（内联 css/style.css）渲染正文预览，确认后再发布

### 网站

- **站内搜索动态收录**：网站 `js/library-dynamic.js` 新增动态补充逻辑——自动列出仓库文章目录（library/paper、library/misc/experimental、en/library/paper），对静态搜索数据缺失的文章抓取 `<title>` 生成搜索条目；App 上传的新文章无需手动维护即可被站内搜索（查找按钮）找到

### 其他

- 版本号提升至 0.0.5（app.json / package.json）
- APK 构建产物命名同步为 `shepherd-library-app-v0.0.5-release`
- 新增依赖：`expo-file-system`（提供 AppDirectories 接口，修复选图）
