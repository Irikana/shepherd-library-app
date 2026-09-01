# SlyWrite 更新日志

## 0.0.15.4（2026-09-01）

与 0.0.15.3 相比的净变更：

### 新增

- **毛玻璃主题液态化**：新增 `expo-blur` 全屏 BlurView 真实模糊层（`src/components/GlassBackdrop.tsx`，渐变图 + 模糊双层，memo 化），`GLASS_PALETTE` 全面降低透明度（bg 0.14 / bgSubtle 0.26 / bgMuted 0.44，边框为半透明白 0.55~0.75），界面更通透、更有磨砂玻璃质感
- **App 内直接安装新版 APK**：Android manifest 声明 `REQUEST_INSTALL_PACKAGES` 权限（`app.json`），下载完成后唤起系统安装界面；若系统未授予「安装未知应用」权限，弹窗引导一键跳转系统权限设置页（`MANAGE_UNKNOWN_APP_SOURCES`），或回退浏览器下载（`app/updates.tsx`）
- **全部更新日志页**：主页新增「全部更新日志」入口（`app/changelog.tsx`），从 App 仓库 `changelog/` 目录拉取所有版本日志，按版本升序展示（最初 → 最新，历史迭代感），支持行内代码/加粗渲染与失败重试
- **设置独立入口**：主页功能列表新增「设置」卡片（主题 / 站点配置），与品牌栏齿轮图标并存

### 修复

- 毛玻璃模式下切换页面的短暂卡顿：渐变背景图由 1080×1920 降为 720×1280（约 98KB），背景层 memo 化，降低解码与合成开销

### 其他

- 版本号提升至 0.0.15.4（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 5
