# SlyWrite 更新日志

## 0.0.15.5（2026-09-01）

与 0.0.15.4 相比的净变更：

### 移除

- **毛玻璃主题**：删除「毛玻璃」主题模式（`src/theme.ts` 的 `GLASS_PALETTE`、`src/components/GlassBackdrop.tsx` 渐变图 + 全屏 `BlurView` 模糊层、`src/assets/glass-backdrop.png`），并移除 `expo-blur` 依赖；主题模式恢复为纯色扁平化风格（对齐网站扁平化设计）

### 新增

- **三个温和主题**：新增「暖米」（柔和纸感米白 + 暖棕）、「雾蓝」（静谧灰蓝）、「森绿」（淡雅护眼绿）三种低饱和柔和主题（`WARM_PALETTE` / `MIST_PALETTE` / `SAGE_PALETTE`），在设置页主题列表中选择，温和不刺眼，浅色调兼容 logo 黑白切换与状态栏样式

### 修复

- **全部更新日志页乱码**：原页面从 GitHub Contents API 拉取 changelog 文件并 `atob` 解码，中文 UTF-8 字节被错误解码为乱码。现已改为静态内置：新增生成脚本 `scripts/gen-changelog.js`，把仓库 `changelog/` 目录全部日志解析为 `src/lib/changelog-data.ts`（App 打包内置，离线展示，不再联网拉取），页面渲染逻辑保留（行内代码 / 加粗 / 版本升序）

### 其他

- 版本号提升至 0.0.15.5（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 6
- 首页「设置」入口文案同步为主题列表（浅色 / 深色 / 跟随系统 / 暖米 / 雾蓝 / 森绿）
