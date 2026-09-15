// 兼容入口：知识词条撰写已并入统一撰写页（app/compose/article.tsx 的 ComposeScreen）
// 保留本路由是为了让旧链接 / 旧习惯仍能进入：直接渲染统一撰写组件并固定 entryType='knowledge'，
// 不做二次跳转，因此不会在导航栈里留下多余的中间页。
// 新的推荐入口是 /compose/article（首页两个按钮分别以不同 entryType 起会话）。
import React from 'react';
import { ComposeScreen } from './article';

export default function ComposeKnowledgeRoute() {
  return <ComposeScreen entryType="knowledge" />;
}
