// 根布局 + Auth Gate
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/auth-store';
import { COLORS } from '../src/theme';

export default function RootLayout() {
  const { isAuthenticated, init } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    init();
  }, [init]);

  // Auth Gate: 在 useEffect 中导航，避免渲染期 Redirect 导致
  // "Attempted to navigate before mounting Root Layout" 错误
  useEffect(() => {
    if (isAuthenticated === null) return; // 初始化中，等待

    const onLoginRoute = segments[0] === 'login';

    if (!isAuthenticated && !onLoginRoute) {
      router.replace('/login');
    } else if (isAuthenticated && onLoginRoute) {
      router.replace('/');
    }
  }, [isAuthenticated, segments, router]);

  // 初始化中：渲染 Stack 但叠加 loading 遮罩（保证 Router 已挂载）
  const showSplash = isAuthenticated === null;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.bg },
          headerTintColor: COLORS.accent,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: COLORS.bgSubtle },
        }}
      >
        <Stack.Screen name="index" options={{ title: '牧羊人图书馆管理' }} />
        <Stack.Screen name="login" options={{ title: '登录', headerShown: false }} />
        <Stack.Screen
          name="compose/article"
          options={{ title: '撰写文章' }}
        />
        <Stack.Screen
          name="compose/preview"
          options={{ title: '预览与上传' }}
        />
      </Stack>
      {showSplash && (
        <View style={s.splashOverlay}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  splashOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
  },
});
