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
