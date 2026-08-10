// 知识馆条目 HTML 模板生成器
// 以 template/knowledge-entry.html 为权威参考，产出知识馆词条页（kh-body 布局 + 侧边栏 + 图谱面板）
// 上传路径：knowledge-hall/categories/{分类}/xxx.html
import { marked } from 'marked';
import type { KnowledgeEntryFormData, KnowledgeCategory } from '../types';

/** 将 YYYY-MM-DD 格式化为 YYYY年M月D日 */
export function formatDateCN(dateStr: string): string {
  const m = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return dateStr;
  return `${m[1]}年${parseInt(m[2], 10)}月${parseInt(m[3], 10)}日`;
}

/** HTML 转义 */
function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 知识馆分类元数据（文件名与仓库路径一致） */
export const KNOWLEDGE_CATEGORIES: Record<KnowledgeCategory, { label: string; page: string; desc: string }> = {
  phenomenon: {
    label: '现象',
    page: 'phenomenon.html',
    desc: '现象是最原始、最纯粹的知识。它们存在于世界之中，等待被发现或观察。一旦被发现或被观察，现象即可转化为可回忆知识或可追溯知识的其中一种。',
  },
  recallable: {
    label: '可回忆知识',
    page: 'recallable.html',
    desc: '可回忆知识是建筑最稳定的知识。它们能随时随地被提出或用于想象和创造。这类知识已经被内化，无需借助外部工具即可调用。',
  },
  traceable: {
    label: '可追溯知识',
    page: 'traceable.html',
    desc: '可追溯知识是所有知识当中，不能随时被回忆和用于想象和创造的。然而，唯一能够使它们出现的办法是通过考察将它们转为可回忆知识。一般通过记录来保存它们。',
  },
};

/**
 * 生成知识馆条目页 HTML
 * @param data 知识条目表单数据
 * @returns 完整 HTML 字符串（PUT 到 knowledge-hall/categories/{分类}/{titleEn}.html）
 */
export function generateKnowledgeEntryHtml(data: KnowledgeEntryFormData): string {
  const cat = KNOWLEDGE_CATEGORIES[data.category];
  const titleSafe = escapeHtml(data.title);
  const aliasesSafe = escapeHtml(data.aliases || '');
  const dateCN = formatDateCN(data.createDate);

  // 正文 Markdown → HTML（概述 / 详细说明 / 历史 / 相关词条 由用户在正文中分节，模板固定渲染四段结构）
  const bodyHtml = marked.parse(data.bodyMarkdown || '', { async: false }) as string;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>知识馆 - ${titleSafe} - ${cat.label}</title>
  <meta name="description" content="牧羊人图书馆知识馆 - ${titleSafe}">
  <meta name="keywords" content="图书馆,知识,学习,牧羊人,${titleSafe}">
  <meta name="theme-color" content="#2c3e50">
  <meta name="referrer" content="origin-when-cross-origin">
  <meta property="og:title" content="知识馆 - ${titleSafe}">
  <meta property="og:description" content="${cat.label}词条：${titleSafe}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="zh_CN">
  <link rel="preload" href="../../css/style.css" as="style">
  <link rel="stylesheet" href="../../css/style.css">
  <style>
    .kh-body { display: flex; min-height: 100vh; }
    .kh-sidebar {
      position: fixed; left: 0; top: 0; bottom: 0;
      width: 220px; background: #fafafa;
      border-right: 1px solid #e0e0e0;
      padding: 24px 16px;
      display: flex; flex-direction: column;
      z-index: 100;
    }
    .kh-main-wrapper { margin-left: 220px; flex: 1; display: flex; gap: 32px; padding: 40px 48px; max-width: 1200px; }
    .kh-main { flex: 1; min-width: 0; }
    .kh-graph-panel {
      width: 260px; flex-shrink: 0;
    }
    .kh-logo-area { text-align: center; margin-bottom: 32px; }
    .kh-logo-area img { max-width: 80px; display: block; margin: 0 auto; }
    .kh-site-title { font-size: 14px; font-weight: 700; color: #2c3e50; letter-spacing: 1px; text-align: center; margin-top: 8px; }
    .kh-equality { font-size: 10px; color: #999; text-align: center; margin-top: 6px; letter-spacing: 0.5px; }
    .kh-nav-item {
      display: block; padding: 10px 12px; color: #555;
      text-decoration: none; margin: 2px 0;
      font-size: 14px; transition: all 0.15s;
    }
    .kh-nav-item:hover { background: #f0f0f0; color: #2c3e50; }
    .kh-nav-item.active { background: #2c3e50; color: #fff; }
    .kh-nav-divider { height: 1px; background: #e0e0e0; margin: 12px 0; }
    .kh-content h2 { font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 40px 0 20px; padding-bottom: 10px; border-bottom: 2px solid #2c3e50; }
    .kh-content h2:first-child { margin-top: 0; }
    .kh-content h3 { font-size: 17px; font-weight: 600; color: #333; margin: 28px 0 14px; }
    .kh-content p { font-size: 16px; line-height: 1.9; color: #444; margin: 14px 0; }

    .kh-entry-title {
      font-size: 26px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 8px 0;
      line-height: 1.3;
    }

    .kh-entry-aliases {
      font-size: 15px;
      color: #888;
      margin-bottom: 4px;
      line-height: 1.5;
    }

    .kh-entry-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 16px;
      padding: 8px 0;
      margin-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 13px;
      color: #888;
    }

    .kh-entry-meta-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .kh-entry-meta-label {
      font-weight: 600;
      color: #555;
    }

    .kh-entry-meta-value {
      color: #888;
    }

    .kh-entry-category-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      letter-spacing: 0.5px;
      background-color: #e8f4fd;
      color: #2980b9;
      border: 1px solid #b3d9f2;
    }

    .kh-entry-back {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: #555;
      text-decoration: none;
      margin-bottom: 20px;
      transition: color 0.15s;
    }
    .kh-entry-back:hover { color: #2c3e50; }
    .kh-entry-back::before { content: '←'; margin-right: 4px; }

    .kh-related-list {
      list-style: none; padding: 0; margin: 0;
    }
    .kh-related-list li {
      padding: 8px 0;
      border-bottom: 1px dashed #e0e0e0;
    }
    .kh-related-list li:last-child { border-bottom: none; }
    .kh-related-list a {
      font-size: 15px; font-weight: 500; color: #2980b9;
      text-decoration: none;
      transition: color 0.15s;
    }
    .kh-related-list a:hover { color: #2c3e50; }
    .kh-related-relation {
      display: block;
      font-size: 13px;
      color: #999;
      margin-top: 2px;
    }

    .kh-graph-panel {
      background: transparent;
      border: 1px solid #e0e0e0;
      padding: 20px;
    }
    .kh-graph-title {
      font-size: 14px;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 16px 0;
      letter-spacing: 0.5px;
    }
    .kh-graph-canvas {
      position: relative;
      width: 100%;
      min-height: 300px;
      border: 1px dashed #d0d0d0;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .kh-graph-node {
      position: absolute;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      background: #fff;
      border: 1px solid #2980b9;
      color: #2980b9;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
      z-index: 2;
    }
    .kh-graph-node:hover {
      background: #2980b9;
      color: #fff;
      transform: scale(1.05);
    }
    .kh-graph-node.center {
      background: #2c3e50;
      border-color: #2c3e50;
      color: #fff;
      font-size: 13px;
      z-index: 3;
    }
    .kh-graph-hint {
      font-size: 12px;
      color: #aaa;
      text-align: center;
      margin-top: 12px;
      line-height: 1.5;
    }

    .kh-footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      font-size: 12px;
      color: #888;
      line-height: 1.9;
    }
    .kh-footer p { margin: 4px 0; }

    .kh-footer-mobile {
      display: none;
      margin-top: 64px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      font-size: 12px;
      color: #888;
      line-height: 1.9;
    }
    .kh-footer-mobile p { margin: 4px 0; }

    @media (max-width: 1024px) {
      .kh-graph-panel { display: none; }
      .kh-footer-mobile { display: block; }
      .kh-main-wrapper { max-width: 900px; gap: 0; }
    }

    @media (max-width: 768px) {
      .kh-sidebar { position: static; width: 100%; border-right: none; border-bottom: 1px solid #e0e0e0; padding: 16px; }
      .kh-body { flex-direction: column; }
      .kh-main-wrapper { margin-left: 0; padding: 24px 16px; flex-direction: column; }
      .kh-content h2 { font-size: 20px; margin-top: 32px; }
      .kh-content p { font-size: 15px; }
      .kh-entry-title { font-size: 22px; }
    }

    @media (prefers-color-scheme: dark) {
      body.kh-body { background: #1a1a1a; color: #e8e6e3; }
      .kh-sidebar { background: #222; border-right-color: #333; }
      .kh-site-title { color: #e8e6e3; }
      .kh-equality { color: #888; }
      .kh-nav-item { color: #e8e6e3; }
      .kh-nav-item:hover { background: #333; color: #fff; }
      .kh-nav-item.active { background: #3d526b; color: #fff; }
      .kh-nav-divider { background: #333; }
      .kh-content h2 { color: #e8e6e3; border-bottom-color: #444; }
      .kh-content h3 { color: #c0bdb8; }
      .kh-content p { color: #a0a0a0; }
      .kh-entry-title { color: #e8e6e3; }
      .kh-entry-aliases { color: #707070; }
      .kh-entry-meta { border-bottom-color: #333; }
      .kh-entry-meta-label { color: #a0a0a0; }
      .kh-entry-meta-value { color: #707070; }
      .kh-entry-category-badge { background-color: #1a2a3a; color: #7ab8e0; border-color: #2a3544; }
      .kh-entry-back { color: #a0a0a0; }
      .kh-entry-back:hover { color: #5d9ccc; }
      .kh-related-list li { border-bottom-color: #333; }
      .kh-related-list a { color: #5d9ccc; }
      .kh-related-list a:hover { color: #8ecfff; }
      .kh-related-relation { color: #666; }
      .kh-graph-panel { border-color: #333; }
      .kh-graph-title { color: #e8e6e3; }
      .kh-graph-canvas { border-color: #444; background: #222; }
      .kh-graph-node { background: #222; border-color: #5d9ccc; color: #7ab8e0; }
      .kh-graph-node:hover { background: #5d9ccc; color: #fff; }
      .kh-graph-node.center { background: #5d9ccc; border-color: #5d9ccc; color: #fff; }
      .kh-graph-hint { color: #555; }
      .kh-footer { border-top-color: #333; color: #666; }
      .kh-footer-mobile { border-top-color: #333; color: #666; }
    }
  </style>
</head>
<body class="kh-body">

<a href="#main-content" class="skip-navigation">跳转到主要内容</a>

<aside class="kh-sidebar">
  <div class="kh-logo-area">
    <img src="../../image/logo.png" alt="牧羊人图书馆 Logo">
    <div class="kh-site-title">知识馆</div>
    <div class="kh-equality">所有知识都是平等的</div>
  </div>

  <div class="kh-nav-divider"></div>

  <a href="../index.html" class="kh-nav-item">知识馆主页 </a>
  <a href="phenomenon.html" class="kh-nav-item${data.category === 'phenomenon' ? ' active' : ''}">现象 </a>
  <a href="recallable.html" class="kh-nav-item${data.category === 'recallable' ? ' active' : ''}">可回忆知识 </a>
  <a href="traceable.html" class="kh-nav-item${data.category === 'traceable' ? ' active' : ''}">可追溯知识 </a>

  <div class="kh-nav-divider"></div>

  <a href="../../index.html" class="kh-nav-item">图书馆主页 </a>
  <a href="../../library/library.html" class="kh-nav-item">图书馆入口 </a>
</aside>

<div class="kh-main-wrapper">

<main id="main-content" class="kh-main kh-content">

  <a href="${cat.page}" class="kh-entry-back">返回${cat.label}</a>

  <h1 class="kh-entry-title">${titleSafe}</h1>

  <div class="kh-entry-aliases">${aliasesSafe}</div>

  <div class="kh-entry-meta">
    <span class="kh-entry-meta-item">
      <span class="kh-entry-meta-label">分类：</span>
      <span class="kh-entry-meta-value"><span class="kh-entry-category-badge">${cat.label}</span></span>
    </span>
    <span class="kh-entry-meta-item">
      <span class="kh-entry-meta-label">创建日期：</span>
      <span class="kh-entry-meta-value">${dateCN}</span>
    </span>
    <span class="kh-entry-meta-item">
      <span class="kh-entry-meta-label">最后更新：</span>
      <span class="kh-entry-meta-value">${dateCN}</span>
    </span>
  </div>

  <div class="left-align">
    ${bodyHtml}
  </div>

  <footer class="kh-footer-mobile">
    <p>&copy; 2026 薛柯道 KeDao Xue 牧羊人图书馆 Shepherd's Library &middot; 知识馆</p>
    <p>保留所有权利 &middot; 未经许可，不得擅自转载、修改或用于商业用途</p>
  </footer>

</main>

<aside class="kh-graph-panel">
  <h3 class="kh-graph-title">知识关系图谱</h3>
  <div class="kh-graph-canvas" id="kh-graph-canvas">
    <div class="kh-graph-node center" style="left:50%;top:50%;transform:translate(-50%,-50%)">${titleSafe}</div>
    <div class="kh-graph-node" style="left:10%;top:20%">${cat.label}</div>
    <div class="kh-graph-node" style="left:75%;top:15%">知识馆</div>
    <div class="kh-graph-node" style="left:5%;top:65%">${cat.label === '现象' ? '可回忆知识' : '现象'}</div>
    <div class="kh-graph-node" style="left:72%;top:68%">${cat.label === '可追溯知识' ? '可回忆知识' : '可追溯知识'}</div>
  </div>
  <p class="kh-graph-hint">图谱展示本词条与知识馆分类的关联关系</p>

  <footer class="kh-footer">
    <p>&copy; 2026 薛柯道 KeDao Xue 牧羊人图书馆 Shepherd's Library &middot; 知识馆</p>
    <p>保留所有权利 &middot; 未经许可，不得擅自转载、修改或用于商业用途</p>
  </footer>
</aside>

</div>

<button title="回到顶部" class="float-button back-to-top" onclick="window.scrollTo({top:0,behavior:'smooth'})">
  回到<br>顶部
</button>

<script src="../../js/library-dynamic.js"></script>
</body>
</html>
`;
}
