// 牧羊人图书馆 App - 共享类型定义

/** 撰写会话类型：普通文章 / 新闻（旧草稿兼容标记；0.0.7 起撰写统一入口，新闻为元数据选项） */
export type ComposeKind = 'article' | 'news';

/** 文章性质（录音/手写/信息/实验性），区别于文章分类（library/ 下目录） */
export type ArticleType = '录音文章' | '手写文章' | '信息文章' | '实验性文章';

/** 知识馆分类（现象 / 可回忆知识 / 可追溯知识） */
export type KnowledgeCategory = 'phenomenon' | 'recallable' | 'traceable';

/** 知识馆条目表单数据（与文章分开，结构为词条页而非文章页） */
export interface KnowledgeEntryFormData {
  /** 词条标题（中文，页面显示） */
  title: string;
  /** 英文标题：作为文件名使用 */
  titleEn: string;
  /** 知识馆分类 */
  category: KnowledgeCategory;
  /** 近义词 / 别称 */
  aliases: string;
  /** 创建日期 YYYY-MM-DD */
  createDate: string;
  /** 正文 Markdown（概述 / 详细说明 / 历史 分节） */
  bodyMarkdown: string;
}

/** 内置文章属性标签（此外支持用户自定义标签；无标签时页面显示"无"字，不占用标签） */
export type ArticleTagName = '新闻' | '小说' | '包含AI' | '有删减';

/** 新闻形态（文章在新闻板块展示时的形态） */
export type NewsKind = 'text' | 'poster';

export interface ArticleFormData {
  title: string;
  /** 英文标题：作为文件名使用（兼容性更好） */
  titleEn: string;
  author: string;
  createDate: string; // YYYY-MM-DD
  articleType: ArticleType;
  /** 标签（内置 + 自定义；「无」为特殊占位，选择后清空其他） */
  tags: string[];
  recordingDuration?: string; // 仅录音文章
  bodyMarkdown: string;
  footerNote?: string;
  /** 脚注列表，正文中 [n] 上标引用对应第 n 条 */
  footnotes: string[];
  includeMathJax: boolean;
  /** 文章分类（library/ 下目录的 key，见 src/lib/article-sync.ts 的 ARTICLE_CATEGORIES） */
  category: string;
  /** 是否在新闻板块展示（合并文章/新闻撰写：新闻仅是多一个展示选项 + 新闻标签） */
  isNews: boolean;
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
