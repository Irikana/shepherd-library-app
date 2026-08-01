// Git Data API 原子多文件提交
// 5 步流程：getRef → getCommitTree → createTree → createCommit → updateRef
// 第 5 步失败（422 non-fast-forward）则整体不落地，重试最多 3 次
import {
  createCommit,
  createTree,
  getCommitTree,
  getRef,
  updateRef,
} from './github-client';
import type { TreeCreateItem } from '../types';

export interface AtomicCommitFile {
  path: string;
  content: string; // 原始 UTF-8 文本
}

export interface AtomicCommitResult {
  commitSha: string;
  files: string[];
}

/**
 * 多文件原子提交（单次 commit 改多文件）
 * @param files 要新增/更新的文件列表（文本文件）
 * @param message commit message
 * @param retries 422 时重试次数
 */
export async function atomicCommit(
  files: AtomicCommitFile[],
  message: string,
  retries = 3,
): Promise<AtomicCommitResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // 1. 获取 main 分支最新 commit sha
      const latestCommitSha = await getRef();
      // 2. 获取其根 tree sha
      const rootTreeSha = await getCommitTree(latestCommitSha);
      // 3. 创建新 tree（基于 base_tree 增量）
      const treeItems: TreeCreateItem[] = files.map((f) => ({
        path: f.path,
        mode: '100644',
        type: 'blob',
        content: f.content,
      }));
      const newTreeSha = await createTree(rootTreeSha, treeItems);
      // 4. 创建 commit
      const newCommitSha = await createCommit(message, newTreeSha, [latestCommitSha]);
      // 5. 更新 ref（指向新 commit）
      await updateRef(newCommitSha);

      return { commitSha: newCommitSha, files: files.map((f) => f.path) };
    } catch (err) {
      lastError = err as Error;
      // 仅 422（non-fast-forward）才重试
      if ((err as { status?: number }).status !== 422) throw err;
      // 重试前短暂等待
      if (attempt < retries) await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }

  throw lastError ?? new Error('原子提交失败');
}
