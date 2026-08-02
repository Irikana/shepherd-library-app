// 根布局 + Auth Gate
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/auth-store';
import { useSettingsStore } from '../src/store/settings-store';
import { useDraftsStore } from '../src/store/drafts-store';
import { useTheme, type Palette } from '../src/theme';

export default function RootLayout() {
  const { isAuthenticated, init } = useAuthStore();
  const settingsInit = useSettingsStore((s) => s.init);
  const draftsInit = useDraftsStore((s) => s.init);
  const segments = useSegments();
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const s = createStyles(colors);

  useEffect(() => {
    init();
    settingsInit();
    draftsInit();
  }, [init, settingsInit, draftsInit]);

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
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.accent,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: colors.bgSubtle },
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
        <Stack.Screen
          name="news/publish"
          options={{ title: '新闻发布' }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: '设置' }}
        />
        <Stack.Screen
          name="drafts"
          options={{ title: '草稿箱' }}
        />
        <Stack.Screen
          name="updates"
          options={{ title: '更新与版本' }}
        />
      </Stack>
      {showSplash && (
        <View style={s.splashOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    splashOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.bg,
    },
  });
