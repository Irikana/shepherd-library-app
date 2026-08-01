// HTML 预览（WebView 渲染生成 HTML，最保真）
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../theme';

interface HtmlPreviewProps {
  html: string;
}

export function HtmlPreview({ html }: HtmlPreviewProps) {
  return (
    <View style={s.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
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
