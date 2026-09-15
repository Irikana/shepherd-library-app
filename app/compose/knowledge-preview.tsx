// 兼容入口：知识词条的预览与发布已并入统一预览页（app/compose/preview.tsx 按 entryType 分支）
// 本路由只保留可达性（直接渲染统一预览组件），统一流程下词条的预览按钮走的是 /compose/preview
import React from 'react';
import { PreviewScreen } from './preview';

export default function ComposeKnowledgePreviewRoute() {
  return <PreviewScreen />;
}
