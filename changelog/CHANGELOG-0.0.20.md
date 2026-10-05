# SlyWrite 更新日志

## 0.0.20（2026-10-05）

与 0.0.19 相比的净变更：新闻板块按发布时间排序，未设发布时间的新闻自动以创建时间为准；增强新闻卡片生成与同步机制。

### 优化与调整

- **新闻卡片生成与多时间字段支持**：
  - `news-card.ts` 中的 `TextCardData` 与 `PosterData` 支持 `publishDate` 与 `date`（创建时间）双时间字段；卡片生成时附加 `data-publish-date` 属性，展示文案优先显示发布时间。
  - `insertTextCard` 排序算法升级为精确时间戳数值比较，优先以 `publishDate` 降序排列；若无 `publishDate` 则平滑降级至以创建时间为准。
  - `news-list-item.ts` 生成 news.html 列表项时同步输出 `data-publish-date`，展示日期支持发布时间与分钟级格式。
- **发布与同步流程联动**：
  - `syncNewsSections` 与 `NewsSyncOptions` 贯通 `publishDate` 传递，发布新闻时自动以文章的真实发布时刻参与排序和插入。
  - `editor.tsx` 与 `compose/preview.tsx` 在触发新闻板块同步时，均正确传入 `publishDate` 与 `date`（创建时间），确保新发布的新闻和更新的文章均遵循最新排序规则。
  - `NewsPublishPanel.tsx` 增加 `publishDate` 参数接收与传递。

### 版本与构建

- 版本号 `0.0.19` → `0.0.20`（`package.json` / `app.json` / `CHANGELOG-0.0.20.md` 三处同步），执行 `node scripts/gen-changelog.js` 重新生成 App 内置更新日志数据。
- tag `v0.0.20`。
