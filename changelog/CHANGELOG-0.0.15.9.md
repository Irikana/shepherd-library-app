# SlyWrite 更新日志

## 0.0.15.9（2026-09-10）

与 0.0.15.8 相比的净变更：

### 修复

- **搜索条目注入可打瘫网站全部动态功能（关键修复）**：`insertSearchEntry` 向网站 `js/library-dynamic.js` 的 `Search.data` 插入条目时，只对标题与关键词做了 JS 字符串转义，`urlPath`（文章文件名）原样拼进单引号字符串。英文文件名含撇号（如 `A Test of Opus 5 Long Shot With No One's Watch.html`）时产生的语法错误会使整个 library-dynamic.js 无法执行，网站所有页面的站内搜索、阅读工具、目录、进度条等动态功能全部失效（已于 2026-09-10 由站点侧手工转义修复该条数据）。现对 `urlPath` 同样执行 `escapeJsString`，防重复检查同时匹配转义前后的路径形态，兼容历史条目

### 其他

- 版本号提升至 0.0.15.9（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 10
