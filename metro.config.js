// Metro 配置：强制 turndown 走 Node 版构建（内部使用 @mixmark-io/domino 纯 JS DOM 解析器）
// 背景：turndown 的 package.json browser 字段做两件事——
//   1) 把入口重映射到 browser 版构建（依赖 window.DOMParser / document.implementation / ActiveX，RN 全部没有）；
//   2) 把 '@mixmark-io/domino' 映射为 false（空模块）。
// 于是 RN 里正文还原（HTML → Markdown）必然抛错，被 htmlToMarkdown 捕获后返回 null，
// 内容编辑器里每篇文章都显示「未能自动还原正文」。
// 这里用自定义 resolveRequest 同时固定两个裸导入：turndown → cjs 构建、domino → 真实实现（纯 CommonJS，无 Node 内置依赖），
// 使 Metro 不再应用 browser 字段的重映射；正文还原在 APK 内即可正常工作。
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const FIXED_MODULES = {
  turndown: require.resolve('turndown/lib/turndown.cjs.js'),
  '@mixmark-io/domino': require.resolve('@mixmark-io/domino'),
};
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const fixed = FIXED_MODULES[moduleName];
  if (fixed) {
    return { type: 'sourceFile', filePath: fixed };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
