# SlyWrite 更新日志

## 0.0.15.3（2026-08-31）

与 0.0.15.2 相比的净变更：

### 新增

- **毛玻璃主题**：设置页主题选项新增「毛玻璃」（`app/settings.tsx`），主题模式扩展为 浅色 / 深色 / 跟随系统 / 毛玻璃。`src/theme.ts` 新增 `glass` 模式与 `GLASS_PALETTE` 半透明磨砂色板（表面为半透明白色 + 白色描边，文字保持深色保证可读性），`src/store/settings-store.ts` 支持持久化该模式。毛玻璃模式下根布局在 Stack 之下渲染渐变背景层（新组件 `src/components/GlassBackdrop.tsx`，渐变背景图 `src/assets/glass-backdrop.png`，1080×1920 对角三色渐变），所有界面表面呈现磨砂玻璃质感

### 其他

- 版本号提升至 0.0.15.3（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 4
