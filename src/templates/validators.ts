// HTML 合规性校验器
// 上传前正则检查生成 HTML 含必需类名/令牌，缺项阻断上传
import type { ValidationResult } from '../types';

/** 文章页必需的类名/令牌 */
const REQUIRED_ARTICLE_TOKENS: { token: string; label: string }[] = [
  { token: 'article-meta', label: '文章元数据区 .article-meta' },
  { token: 'article-type-badge', label: '文章类型标签 .article-type-badge' },
  { token: 'left-align', label: '正文容器 .left-align' },
  { token: 'copyright-color', label: '页脚版权 .copyright-color' },
  { token: 'mobile-nav', label: '移动端导航 .mobile-nav' },
  { token: 'quick-nav', label: '便携式导航仪 .quick-nav' },
  { token: 'float-button', label: '浮动按钮 .float-button' },
  { token: 'PAGE_DISPLAY_NAME', label: '页面显示名 PAGE_DISPLAY_NAME' },
  { token: 'library-dynamic.js', label: '动态脚本 library-dynamic.js' },
  { token: 'page-title-main', label: '页面标题 .page-title-main' },
];

/** 知识词条页必需的类名/令牌（骨架由站点 css/library-refit.css 承担，模板只写结构，
 *  所以这里检查的是结构完整而不是内联样式；分节 id 与 Irikana.github.io/template/knowledge-entry.html 一致） */
const REQUIRED_KNOWLEDGE_TOKENS: { token: string; label: string }[] = [
  { token: 'kh-sidebar', label: '知识馆侧边栏 .kh-sidebar' },
  { token: 'kh-nav-item', label: '侧栏导航项 .kh-nav-item' },
  { token: 'kh-main', label: '正文容器 .kh-main' },
  { token: 'id="section-summary"', label: '概述分节 #section-summary' },
  { token: 'id="section-detail"', label: '详细说明分节 #section-detail' },
  { token: 'id="section-history"', label: '历史分节 #section-history' },
  { token: 'id="section-related"', label: '相关词条分节 #section-related' },
  { token: 'kh-footer', label: '页脚 .kh-footer' },
  { token: 'library-refit.css', label: '精修样式表 library-refit.css' },
  { token: 'library-dynamic.js', label: '动态脚本 library-dynamic.js' },
];

/** 校验知识词条页 HTML 是否符合规范 */
export function validateKnowledgeHtml(html: string): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const { token, label } of REQUIRED_KNOWLEDGE_TOKENS) {
    if (!html.includes(token)) {
      missing.push(label);
    }
  }

  // 软警告：建议项
  if (!html.includes('<meta name="description"')) {
    warnings.push('缺少 meta description');
  }
  if (!html.includes('<meta name="viewport"')) {
    warnings.push('缺少 meta viewport');
  }
  // 骨架样式必须由站点承担：内联一整套 .kh-sidebar 会让六套配色失效（站点 alpha-023 已废除该写法）
  if (/\.kh-sidebar\s*\{/.test(html)) {
    warnings.push('页面内联了 .kh-sidebar 骨架样式，会盖掉站点配色，应交给 css/library-refit.css');
  }

  return { valid: missing.length === 0, missing, warnings };
}

/** 校验文章页 HTML 是否符合规范 */
export function validateArticleHtml(html: string): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const { token, label } of REQUIRED_ARTICLE_TOKENS) {
    if (!html.includes(token)) {
      missing.push(label);
    }
  }

  // 软警告：建议项
  if (!html.includes('<meta name="description"')) {
    warnings.push('缺少 meta description');
  }
  if (!html.includes('<meta name="viewport"')) {
    warnings.push('缺少 meta viewport');
  }

  return { valid: missing.length === 0, missing, warnings };
}
