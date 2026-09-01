// 毛玻璃主题背景层：仅 glass 模式渲染，铺满根容器（_layout.tsx 中先于 Stack 渲染）
// 渐变图 + 全屏 BlurView 真实模糊（expo-blur），页面切换时无需逐屏处理（单一静态模糊层）
import React, { memo } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme';

const BACKDROP = require('../assets/glass-backdrop.png');

export const GlassBackdrop = memo(function GlassBackdrop() {
  const { isGlass } = useTheme();
  if (!isGlass) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <ImageBackground
        source={BACKDROP}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <BlurView
        intensity={64}
        tint="light"
        // Android 必须显式启用真实模糊（默认 'none' 只叠加半透明色层）；
        // iOS 原生自带模糊，忽略该属性
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
});
