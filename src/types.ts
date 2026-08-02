// 牧羊人图书馆 App - 共享类型定义

export type ArticleType = '录音文章' | '手写文章' | '信息文章';

export type ArticleTagName = '新闻' | '包含AI' | '有删减' | '无';

export interface ArticleFormData {
  title: string;
  author: string;
  createDate: string; // YYYY-MM-DD
  articleType: ArticleType;
  tags: ArticleTagName[];
  recordingDuration?: string; // 仅录音文章
  bodyMarkdown: string;
  footerNote?: string;
  /** 脚注列表，正文中 [n] 上标引用对应第 n 条 */
  footnotes: string[];
  includeMathJax: boolean;
}

export interface RepoContentItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  download_url?: string | null;
}

export interface TreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree' | 'commit';
  sha: string | null;
  size?: number;
}

export interface TreeCreateItem {
  path: string;
  mode: '100644' | '100755' | '040000' | '160000' | '120000';
  type: 'blob' | 'tree' | 'commit';
  content?: string; // 原始 UTF-8 文本（GitHub 会自动处理）
  sha?: string | null;
}

export interface UploadResult {
  success: boolean;
  path?: string;
  commitSha?: string;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}
