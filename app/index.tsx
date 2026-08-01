// 首页：功能入口卡片 + 版本号 + 速率限制
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/auth-store';
import { rateLimit } from '../src/lib/rate-limit';
import { COLORS, SPACING } from '../src/theme';

interface FeatureItem {
  title: string;
  desc: string;
  href?: string;
  enabled: boolean;
  badge?: string;
}

const FEATURES: FeatureItem[] = [
  {
    title: '撰写文章',
    desc: '表单 + Markdown 编辑器，生成合规 HTML 后上传到 library/paper/',
    href: '/compose/article',
    enabled: true,
  },
  {
    title: '新闻发布',
    desc: '原子提交多文件，自动维护 6 条上限与海报替换',
    enabled: false,
    badge: 'Phase 2',
  },
  {
    title: '内容编辑',
    desc: '浏览仓库文件树，编辑已有 HTML/CSS/JS',
    enabled: false,
    badge: 'Phase 2',
  },
  {
    title: '图片上传',
    desc: '选图压缩后上传到 image/poster/',
    enabled: false,
    badge: 'Phase 2',
  },
  {
    title: '日志/版本',
    desc: '查看版本号与更新日志',
    enabled: false,
    badge: 'Phase 2',
  },
];

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
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

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
            ⚠ API 速率剩余 {rateLimit.state.remaining}，重置于{' '}
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgSubtle },
  content: { padding: SPACING.md, paddingBottom: SPACING.xl },
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
    backgroundColor: '#fdf2f2',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.md,
  },
  rateWarnText: { fontSize: 13, color: COLORS.danger },
  refreshMsgBox: {
    backgroundColor: '#f0f7fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2980b9',
    padding: SPACING.sm + 2,
    marginBottom: SPACING.md,
  },
  refreshMsgText: { fontSize: 13, color: '#2980b9' },
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
