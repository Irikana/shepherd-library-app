# SlyWrite 更新日志

## 0.0.15（2026-08）

与 0.0.14 相比的净变更：

### 修复

- **隐藏新闻会清空整个新闻区（关键修复）**：`removeNewsItem`（0.0.14 新增）隐藏新闻时，删除左侧海报块的正则使用 `[\s\S]*?` 跨块匹配——当目标新闻是右侧文字新闻（不在海报中）时，正则会从海报块一路吞到目标卡片所在的文字列表末尾，把整个新闻区（海报 + 全部文字卡）从 `index.html` 与 `en/index.html` 中删除，主页只剩「查阅所有新闻」按钮。现已修复：
  - **海报块只按需删除**：新增 `removePosterIfMatches`，仅当目标 href 确实位于海报块内部时才删除整个海报块；目标在文字列表时绝不触碰海报块
  - **卡片/列表项正则健壮化**：`removeAnchor` 改用 lookahead 同时断言 `href` 与 `class` 两个属性，属性顺序无关，避免类名位置变化导致匹配失败
  - 回归验证：新增 `scripts/verify-news-remove.js`、`scripts/verify-article-sync.js` 两个验证脚本，覆盖「隐藏文字新闻」「隐藏海报新闻」「en/index.html」「news.html」「英文版 library.html 插入/移除」场景

### 其他

- 版本号提升至 0.0.15（package.json / app.json / CI artifact name）
- 修复因本次事故被清空的网站新闻区：恢复 index.html / en/index.html / news.html 新闻区至隐藏前状态，取消 3 篇测试新闻的隐藏标记并补齐英文版 library.html 缺失条目（网站仓库 Irikana.github.io 同步处理）
