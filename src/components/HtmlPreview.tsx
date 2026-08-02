// HTML 预览（WebView 渲染生成 HTML，最保真）
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../theme';

interface HtmlPreviewProps {
  html: string;
  /** 可选：HTML 中相对路径资源（图片/CSS/JS）的解析基地址 */
  baseUrl?: string;
}

export function HtmlPreview({ html, baseUrl }: HtmlPreviewProps) {
  return (
    <View style={s.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html, ...(baseUrl ? { baseUrl } : {}) }}
        style={s.webview}
        renderLoading={() => (
          <View style={s.loading}>
            <ActivityIndicator color={COLORS.accent} />
          </View>
        )}
        startInLoadingState
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  webview: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
