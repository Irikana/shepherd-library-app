// Token 登录页
import React, { useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '../src/store/auth-store';
import { SPACING, useTheme, type Palette } from '../src/theme';
import { REPO_CONFIG } from '../src/lib/config';
import LogoImage from '../src/assets/shephrdsLibraryWrite.png';

export default function LoginScreen() {
  const { loginWithToken, loading, error, clearError } = useAuthStore();
  const { isDark, colors } = useTheme();
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const s = createStyles(colors);

  const handleLogin = async () => {
    if (!token.trim()) {
      Alert.alert('请输入 Token');
      return;
    }
    try {
      await loginWithToken(token.trim());
    } catch {
      // 错误已在 store 中，下方展示
    }
  };

  const openTokenSettings = () => {
    Linking.openURL('https://github.com/settings/personal-access-tokens/new');
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Image source={LogoImage} style={[s.logo, isDark ? s.logoDark : s.logoLight]} resizeMode="contain" />
        <Text style={s.title}>SlyWrite</Text>
        <Text style={s.subtitle}>牧羊人图书馆 · 写作管理</Text>
      </View>

      <View style={s.infoBox}>
        <Text style={s.infoText}>
          需要 fine-grained Personal Access Token，仅授权仓库{' '}
          <Text style={s.bold}>{REPO_CONFIG.owner}/{REPO_CONFIG.repo}</Text>，权限：Contents: Read and write。
        </Text>
      </View>

      <Text style={s.label}>GitHub Token</Text>
      <View style={s.inputRow}>
        <TextInput
          style={[s.input, { flex: 1 }]}
          value={token}
          onChangeText={(v) => {
            setToken(v);
            if (error) clearError();
          }}
          placeholder="github_pat_xxxx..."
          placeholderTextColor={colors.textLight}
          secureTextEntry={!showToken}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable style={s.eyeBtn} onPress={() => setShowToken((v) => !v)}>
          <Text style={s.eyeText}>{showToken ? '隐藏' : '显示'}</Text>
        </Pressable>
      </View>

      {error && (
        <View style={s.errorBox}>
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      <Pressable style={[s.loginBtn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading}>
        <Text style={s.loginBtnText}>{loading ? '验证中…' : '登录'}</Text>
      </Pressable>

      <Pressable style={s.linkBtn} onPress={openTokenSettings}>
        <Text style={s.linkText}>前往 GitHub 创建 Token</Text>
      </Pressable>

      <View style={s.tipBox}>
        <Text style={s.tipTitle}>安全说明</Text>
        <Text style={s.tipText}>• Token 加密存储于设备 Keystore，不上传任何第三方</Text>
        <Text style={s.tipText}>• 仅授予 Contents 读写权限，不影响其他仓库</Text>
        <Text style={s.tipText}>• 可随时在 GitHub 设置页吊销</Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgSubtle },
    content: { padding: SPACING.lg, paddingBottom: SPACING.xl },
    header: { alignItems: 'center', marginBottom: SPACING.xl, marginTop: SPACING.xl },
    logo: { width: 96, height: 96, marginBottom: SPACING.sm },
    logoDark: { tintColor: '#ffffff' },
    logoLight: { tintColor: '#1a1a1a' },
    title: { fontSize: 26, fontWeight: '700', color: COLORS.accent },
    subtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
    infoBox: {
      backgroundColor: COLORS.infoBg,
      borderLeftWidth: 4,
      borderLeftColor: '#2980b9',
      padding: SPACING.md,
      marginBottom: SPACING.lg,
    },
    infoText: { fontSize: 13, color: '#2980b9', lineHeight: 20 },
    bold: { fontWeight: '600' },
    label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs },
    inputRow: { flexDirection: 'row', alignItems: 'stretch' },
    input: {
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.sm + 2,
      fontSize: 15,
      color: COLORS.text,
      backgroundColor: COLORS.bg,
    },
    eyeBtn: {
      borderWidth: 1,
      borderLeftWidth: 0,
      borderColor: COLORS.border,
      paddingHorizontal: SPACING.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.bgMuted,
    },
    eyeText: { fontSize: 13, color: COLORS.textSecondary },
    errorBox: {
      backgroundColor: COLORS.dangerBg,
      borderLeftWidth: 4,
      borderLeftColor: COLORS.danger,
      padding: SPACING.sm + 2,
      marginTop: SPACING.sm,
    },
    errorText: { fontSize: 13, color: COLORS.danger, lineHeight: 18 },
    loginBtn: {
      backgroundColor: COLORS.accent,
      padding: SPACING.md,
      alignItems: 'center',
      marginTop: SPACING.lg,
    },
    btnDisabled: { opacity: 0.5 },
    loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    linkBtn: { alignItems: 'center', marginTop: SPACING.md },
    linkText: { color: COLORS.accent, fontSize: 14 },
    tipBox: {
      marginTop: SPACING.xl,
      padding: SPACING.md,
      backgroundColor: COLORS.bg,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    tipTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs },
    tipText: { fontSize: 12, color: COLORS.textLight, lineHeight: 18 },
  });
