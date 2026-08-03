// 首页：功能入口卡片 + 版本号 + 速率限制 + 设置入口
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useAuthStore } from '../src/store/auth-store';
import { useDraftsStore } from '../src/store/drafts-store';
import { rateLimit } from '../src/lib/rate-limit';
import { SPACING, useTheme, type Palette } from '../src/theme';
import LogoImage from '../src/assets/shephrdsLibraryWrite.png';
import GearImage from '../src/assets/settings-gear.png';

const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';

interface FeatureItem {
  title: string;
  desc: string;
  href?: string;
  enabled: boolean;
  badge?: string;
}

/** 平台感知的确认对话框 */
function confirmDialog(
  title: string,
  message: string,
  onConfirm: () => void,
): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: onConfirm },
    ]);
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const { login, version, logout, refreshVersion } = useAuthStore();
  const { isDark, colors } = useTheme();
  const s = createStyles(colors);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  const draftCount = useDraftsStore((st) => st.drafts.length);

  const FEATURES: FeatureItem[] = [
    {
      title: '撰写文章',
      desc: '双标题 + Markdown 编辑器，生成合规 HTML 后分类上传；支持在新闻板块展示（含海报）',
      href: '/compose/article',
      enabled: true,
    },
    {
      title: '草稿箱',
      desc: '自动保存的未完成文章，可恢复继续编辑',
      href: '/drafts',
      enabled: true,
      badge: draftCount > 0 ? `${draftCount} 篇` : undefined,
    },
    {
      title: '内容编辑',
      desc: '浏览仓库文件树，查看并编辑 HTML/CSS/JS/Markdown 等文本文件',
      href: '/browser',
      enabled: true,
    },
    {
      title: '图片上传',
      desc: '从相册选图，原图上传到 image/ 等图片目录',
      href: '/upload',
      enabled: true,
    },
    {
      title: '日志/版本',
      desc: '检查更新、下载最新 APK、访问 SlyWrite 网站',
      href: '/updates',
      enabled: true,
    },
  ];

  const handleLogout = () => {
    confirmDialog('退出登录', '确定要退出吗？Token 将从本机清除。', () => logout());
  };

  const handleRefreshVersion = async () => {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      await refreshVersion();
      // refreshVersion 成功时不报错，检查 version 是否更新
      const currentVersion = useAuthStore.getState().version;
      if (currentVersion) {
        setRefreshMsg(`已刷新：${currentVersion}`);
      } else {
        setRefreshMsg('版本号暂未获取到');
      }
    } catch {
      setRefreshMsg('刷新失败，请检查网络');
    } finally {
      setRefreshing(false);
      // 3 秒后清除提示
      setTimeout(() => setRefreshMsg(null), 3000);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* 品牌区 */}
      <View style={s.brand}>
        <Image
          source={LogoImage}
          style={[s.logo, isDark ? s.logoDark : s.logoLight]}
          resizeMode="contain"
        />
        <View style={{ flex: 1 }}>
          <Text style={s.brandName}>SlyWrite</Text>
          <Text style={s.brandSub}>牧羊人图书馆 · 写作管理</Text>
        </View>
        <View style={s.brandRight}>
          <View style={s.appVersionBox}>
            <Text style={s.appVersionLabel}>软件版本</Text>
            <Text style={s.appVersionValue}>v{APP_VERSION}</Text>
          </View>
          <Pressable style={s.settingsBtn} onPress={() => router.push('/settings')} hitSlop={8}>
            <Image source={GearImage} style={s.settingsGear} resizeMode="contain" />
          </Pressable>
        </View>
      </View>

      {/* 状态条 */}
      <View style={s.statusBar}>
        <View style={{ flex: 1 }}>
          <Text style={s.statusLabel}>已登录</Text>
          <Text style={s.statusValue}>{login}</Text>
        </View>
        <View style={s.versionBox}>
          <Text style={s.versionLabel}>网站版本</Text>
          <Text style={s.versionValue}>{version ?? '—'}</Text>
        </View>
      </View>

      {/* 速率限制 */}
      {rateLimit.isLow && (
        <View style={s.rateWarn}>
          <Text style={s.rateWarnText}>
            API 速率剩余 {rateLimit.state.remaining}，重置于{' '}
            {rateLimit.resetDate?.toLocaleTimeString() ?? '稍后'}
          </Text>
        </View>
      )}

      {/* 刷新反馈 */}
      {refreshMsg && (
        <View style={s.refreshMsgBox}>
          <Text style={s.refreshMsgText}>{refreshMsg}</Text>
        </View>
      )}

      {/* 功能入口 */}
      <Text style={s.sectionTitle}>功能</Text>
      {FEATURES.map((f) => (
        <Pressable
          key={f.title}
          style={[s.card, !f.enabled && s.cardDisabled]}
          onPress={() => f.enabled && f.href && router.push(f.href)}
        >
          <View style={s.cardHeader}>
            <Text style={[s.cardTitle, !f.enabled && s.textDisabled]}>{f.title}</Text>
            {f.badge && <Text style={s.badge}>{f.badge}</Text>}
          </View>
          <Text style={s.cardDesc}>{f.desc}</Text>
        </Pressable>
      ))}

      {/* 操作 */}
      <View style={s.actions}>
        <Pressable
          style={[s.refreshBtn, refreshing && s.btnDisabled]}
          onPress={handleRefreshVersion}
          disabled={refreshing}
        >
          <Text style={s.refreshText}>{refreshing ? '刷新中…' : '刷新版本号'}</Text>
        </Pressable>
        <Pressable style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>退出登录</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgSubtle },
    content: { padding: SPACING.md, paddingBottom: SPACING.xl },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.bg,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      marginBottom: SPACING.md,
    },
    logo: { width: 56, height: 56, marginRight: SPACING.sm },
    logoDark: { tintColor: '#ffffff' },
    logoLight: { tintColor: '#1a1a1a' },
    brandName: { fontSize: 22, fontWeight: '700', color: COLORS.accent },
    brandSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
    brandRight: { flexDirection: 'row', alignItems: 'center', marginLeft: SPACING.sm },
    appVersionBox: { alignItems: 'flex-end', marginRight: SPACING.sm },
    appVersionLabel: { fontSize: 11, color: COLORS.textLight },
    appVersionValue: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
    settingsBtn: {
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.bgSubtle,
      padding: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingsGear: { width: 22, height: 22 },
    statusBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.bg,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      marginBottom: SPACING.md,
    },
    statusLabel: { fontSize: 12, color: COLORS.textLight },
    statusValue: { fontSize: 15, color: COLORS.accent, fontWeight: '600', marginTop: 2 },
    versionBox: { alignItems: 'flex-end' },
    versionLabel: { fontSize: 12, color: COLORS.textLight },
    versionValue: { fontSize: 16, color: COLORS.accent, fontWeight: '700', marginTop: 2 },
    rateWarn: {
      backgroundColor: COLORS.dangerBg,
      borderLeftWidth: 4,
      borderLeftColor: COLORS.danger,
      padding: SPACING.sm + 2,
      marginBottom: SPACING.md,
    },
    rateWarnText: { fontSize: 13, color: COLORS.danger },
    refreshMsgBox: {
      backgroundColor: COLORS.infoBg,
      borderLeftWidth: 4,
      borderLeftColor: COLORS.accentLight,
      padding: SPACING.sm + 2,
      marginBottom: SPACING.md,
    },
    refreshMsgText: { fontSize: 13, color: COLORS.accentLight },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.textSecondary,
      marginBottom: SPACING.sm,
    },
    card: {
      backgroundColor: COLORS.bg,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
    },
    cardDisabled: { opacity: 0.55 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
    textDisabled: { color: COLORS.textLight },
    cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, lineHeight: 20 },
    badge: {
      fontSize: 11,
      fontWeight: '600',
      color: COLORS.textLight,
      backgroundColor: COLORS.bgMuted,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
    btnDisabled: { opacity: 0.5 },
    refreshBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.accent,
      padding: SPACING.sm + 2,
      alignItems: 'center',
    },
    refreshText: { color: COLORS.accent, fontWeight: '600', fontSize: 14 },
    logoutBtn: {
      borderWidth: 1,
      borderColor: COLORS.danger,
      padding: SPACING.sm + 2,
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
    },
    logoutText: { color: COLORS.danger, fontWeight: '600', fontSize: 14 },
  });
