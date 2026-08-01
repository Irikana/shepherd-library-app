// 中文路径编码工具
// GitHub Contents API：URL 路径段需 encodeURIComponent，JSON body 的 path 字段用原始 UTF-8

/** 将仓库内路径编码为 URL 安全的路径段（保留 / 分隔符） */
export function encodePath(path: string): string {
  return path
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
}
