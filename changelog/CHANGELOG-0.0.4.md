# SlyWrite 更新日志

## 0.0.4（2026-08）

与 0.0.3 相比的净变更：

### 上传与网站同步

- **英文版 library 同步**：文章上传与新闻发布现在同时同步 `en/library/library.html`（英文标题、英文分类锚点），此前仅同步中文版 library.html 与英文 news
- **措辞同步**：文章页元数据 label 统一为「文章性质」

### 新闻发布

- **完整元数据表单**：新闻发布页改为「元数据 / 正文」分段编辑，元数据复用完整表单——中文标题、英文标题、作者、创建日期、文章性质（录音/手写/信息/实验性）、标签、补充说明、脚注、MathJax 开关，另含新闻专属的「新闻形态」（文字/海报）与海报选择
- **海报选图修复与不压缩**：
  - 修复选图失败：app.json 配置 expo-image-picker 插件（相册权限），改用系统图片选择器直接读取 base64
  - 取消图片压缩：海报原图上传（此前经 expo-image-manipulator 压缩至 800px），移除该依赖
  - 选图失败时提示具体错误信息

### 界面修复

- **设置齿轮图标**：改用自绘齿轮 PNG 资源（accent 色、无依赖），修复字体图标不显示的问题
- **输入法插入交互改进**：工具栏恢复 onPress（不再用 onPressIn），配合 `keyboardShouldPersistTaps="handled"`——键盘打开时点击一次即响应，且滑动工具栏不再误插入手指触碰到的组件

### 软件图标

- **黑底 logo 作为软件图标**：`app.json` 的 `icon` / `android.icon` / `adaptiveIcon` 均使用黑底 logo（shephrdsLibraryWriteWithBackround.png），adaptiveIcon 背景黑色

### 更新检查与发布

- **软件内获取更新**：新增「更新与版本」页（首页「日志/版本」入口）：显示当前版本与网站版本，检查 GitHub 最新 Release（版本号、发布时间、更新说明），有新版本时一键下载最新 APK（自动跳转到 `releases/latest/download/app-release.apk`）；可访问 SlyWrite 网站
- **自动发布 Release**：GitHub Actions 构建完成后自动创建 Release（tag 取 package.json 版本号，如 v0.0.4）并上传 APK，App 内与网站均通过 Release 下载
- **SlyWrite 网站**：图书馆网站新增 `slywrite/` 页面（介绍、功能、版本、APK 下载与相关链接），地址 https://irikana.github.io/slywrite/

### 其他

- 版本号提升至 0.0.4（app.json / package.json）
- APK 构建产物命名同步为 `shepherd-library-app-v0.0.4-release`
- 移除依赖：`expo-image-manipulator`（海报不再压缩）
