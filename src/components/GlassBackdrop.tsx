// 毛玻璃主题背景层：仅 glass 模式渲染，铺满根容器（_layout.tsx 中先于 Stack 渲染）
import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

const BACKDROP = require('../assets/glass-backdrop.png');

export function GlassBackdrop() {
  const { isGlass } = useTheme();
  if (!isGlass) return null;
  return (
    <ImageBackground
      source={BACKDROP}
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
    />
  );
}
