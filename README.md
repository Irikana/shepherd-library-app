# 牧羊人图书馆 · 移动端内容管理 App

在 Android 手机上完成「撰写文章 → 自动生成合规 HTML → 一键提交到 GitHub → 触发 Jekyll 部署」的全链路，无需开电脑。

## 架构

App 直连 GitHub REST API（无服务器），commit 落到 `main` 分支后，现有 Jekyll GitHub Actions 自动构建部署到 Pages。

- **技术栈**：React Native + Expo（TypeScript）+ Expo Router
- **认证**：fine-grained PAT，`expo-secure-store` 加密存储
- **仓库**：操作 `Irikana/Irikana.github.io`，App 源码独立于此仓库

## 前置依赖

App 的模板生成器以网站规范为权威源。开发 App 前须先确保 `.trae/rules/project_rules.md` 与 `visual-components.md` 的新闻卡片章节已对齐 `index.html` 实际结构（`#news-text-list`），已在本仓库 2026-08-01 规范更新中完成。

## 功能模块

| 模块 | 状态 | 说明 |
|------|------|------|
| 认证 | ✅ MVP | Token 输入 + 验证 + Keystore + Auth Gate |
| GitHub API 客户端 | ✅ MVP | Contents API 读写 + Git Data API 原子提交 + 速率限制 + 中文路径编码 |
| 撰写文章 | ✅ MVP | 表单 + Markdown 编辑器 + 实时预览 + HTML 模板生成 + 上传前校验 |
| 版本号只读 | ✅ MVP | 从 `library-dynamic.js` 提取 alpha 版本 |
| 新闻发布 | 🔜 Phase 2 | 5 文件原子提交 + 6 条上限 + 海报替换 |
| 内容编辑 | 🔜 Phase 2 | 文件树 + 单文件读写 + 冲突处理 |
| 图片上传 | 🔜 Phase 2 | 选图压缩 + 上传到 image/poster/ |
| 知识馆撰写 | 🔜 Phase 3 | 独立内联 CSS 模板 |

## 目录结构

```
shepherd-library-app/
├── app/                       # Expo Router 路由
│   ├── _layout.tsx            # 根布局 + Auth Gate
│   ├── index.tsx              # 首页（功能入口 + 版本号）
│   ├── login.tsx              # Token 登录页
│   ├── compose/
│   │   ├── article.tsx        # 撰写文章
│   │   └── preview.tsx        # 预览与上传
│   └── +not-found.tsx
├── src/
│   ├── lib/                   # GitHub API 封装
│   │   ├── github-client.ts   # Contents + Git Data API
│   │   ├── git-data.ts        # 原子多文件提交
│   │   ├── auth.ts            # Token 存取（Keystore）
│   │   ├── version.ts         # 版本号提取
│   │   ├── path-codec.ts      # 中文路径编码
│   │   ├── base64.ts          # UTF-8 安全 Base64
│   │   └── rate-limit.ts      # 速率限制追踪
│   ├── templates/             # HTML 模板生成器
│   │   ├── article.ts         # 文章页模板（对照实际文章页结构）
│   │   ├── news-card.ts       # 新闻卡片 + 插入逻辑
│   │   ├── news-list-item.ts  # news.html 列表项
│   │   └── validators.ts      # HTML 合规性校验
│   ├── components/            # UI 组件
│   │   ├── MetaForm.tsx       # 元数据表单
│   │   ├── MarkdownEditor.tsx # Markdown 编辑器
│   │   └── HtmlPreview.tsx    # WebView 预览
│   ├── store/                 # Zustand 状态
│   │   ├── auth-store.ts
│   │   └── compose-store.ts
│   ├── theme.ts               # 主题色（对齐网站扁平化设计）
│   └── types.ts               # 共享类型
├── app.json                   # Expo 配置
├── eas.json                   # EAS Build 配置（出 APK）
└── package.json
```

## 开发

```bash
npm install
npx expo start           # 开发服务器
```

## 构建 APK

```bash
# 需先登录 Expo 账号
eas login
eas build -p android --profile preview
```

## 安全

- Token 仅存于设备 Keystore（`expo-secure-store`），加密 at-rest
- 最小权限：仅目标仓库 Contents 读写，不授予 admin/workflow/keys
- 建议设 1 年过期，到期前在 App 内重新输入

## 参考

- 实施方案：`Irikana.github.io/.trae/documents/mobile-content-app.md`
- 网站规范：`Irikana.github.io/.trae/rules/project_rules.md`
- 视觉组件标准：`Irikana.github.io/.trae/rules/visual-components.md`
