// 牧羊人图书馆 App - 共享类型定义

/** 文章性质（录音/手写/信息/实验性），区别于文章分类（library/ 下目录） */
export type ArticleType = '录音文章' | '手写文章' | '信息文章' | '实验性文章';

/** 文章属性标签 */
export type ArticleTagName = '新闻' | '小说' | '包含AI' | '有删减' | '无';

export interface ArticleFormData {
  title: string;
  /** 英文标题：作为文件名使用（兼容性更好） */
  titleEn: string;
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
  /** 文章分类（library/ 下目录的 key，见 src/lib/article-sync.ts 的 ARTICLE_CATEGORIES） */
  category: string;
  /** 隐藏文章：不同步 library.html 与新闻等公开列表，仅加入站内搜索数据（只能通过查找按钮找到） */
  hidden: boolean;
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
