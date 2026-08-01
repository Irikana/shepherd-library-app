// 版本号提取：从 js/library-dynamic.js 正则提取当前 alpha 版本号
import { getFile } from './github-client';

const VERSION_REGEX = /var\s+Ver\s*=\s*\{\s*v:\s*'([^']+)'/;

/** 读取 library-dynamic.js 并提取版本号（如 alpha-017） */
export async function fetchVersion(): Promise<string> {
  const { content } = await getFile('js/library-dynamic.js');
  const match = content.match(VERSION_REGEX);
  if (!match) throw new Error('未能从 library-dynamic.js 提取版本号');
  return match[1];
}
