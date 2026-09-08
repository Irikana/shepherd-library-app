# SlyWrite 更新日志

## 0.0.15.7（2026-09-09）

与 0.0.15.6 相比的净变更：

### 修复

- **更新日志补充（关键修复）**：0.0.15.5 版本引入的更新日志生成脚本（`scripts/gen-changelog.js`）将 changelog 目录内容同步到软件内置数据（`src/lib/changelog-data.ts`），但 0.0.15.6 版本发布时忘记运行该脚本，导致软件内「全部更新日志」页缺失 0.0.15.6 版本内容。现已补充运行脚本，0.0.15.6 与 0.0.15.7 两个版本的更新日志均已写入软件内

### 其他

- 版本号提升至 0.0.15.7（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 8
