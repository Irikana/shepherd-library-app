// 更新与版本页：检查 App 最新 Release、下载 APK、显示网站版本、访问 SlyWrite 网站
// 从 App 仓库（shepherd-library-app）检查 App 更新与下载 APK；
// 从网站仓库（Irikana.github.io）显示牧羊人图书馆网站版本
// 下载：直接用 Linking 跳转浏览器下载（GitHub Release asset 自动触发下载），
// 用户下载完成后按系统提示安装
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { fetchAppRelease, fetchSiteRelease, LATEST_APK_URL, SLYWRITE_SITE_URL, compareVersions, type ReleaseInfo } from '../src/lib/releases';
import { SPACING, useTheme, type Palette } from '../src/theme';

const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  } catch {
    return iso;
  }
}

export default function UpdatesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = createStyles(colors);

  // App 版本检查
  const [appChecking, setAppChecking] = useState(true);
  const [appRelease, setAppRelease] = useState<ReleaseInfo | null>(null);
  const [appError, setAppError] = useState<string | null>(null);

  // 网站版本
  const [siteChecking, setSiteChecking] = useState(true);
  const [siteRelease, setSiteRelease] = useState<ReleaseInfo | null>(null);
  const [siteError, setSiteError] = useState<string | null>(null);

  // 下载状态
  const [downloading, setDownloading] = useState(false);

  const checkApp = useCallback(async () => {
    setAppChecking(true);
    setAppError(null);
    try {
      const r = await fetchAppRelease();
      setAppRelease(r);
    } catch (err) {
      setAppError((err as Error).message);
    } finally {
      setAppChecking(false);
    }
  }, []);

  const checkSite = useCallback(async () => {
    setSiteChecking(true);
    setSiteError(null);
    try {
      const r = await fetchSiteRelease();
      setSiteRelease(r);
    } catch (err) {
      setSiteError((err as Error).message);
    } finally {
      setSiteChecking(false);
    }
  }, []);

  useEffect(() => {
    checkApp();
    checkSite();
  }, [checkApp, checkSite]);

  /** 在 App 内直接下载 APK，完成后通过系统 Intent 自动弹出安装界面（Android） */
  const downloadApk = async () => {
    try {
      setDownloading(true);
      const url = LATEST_APK_URL;
      const fileUri = `${FileSystem.cacheDirectory}app-release.apk`;

      // 清理已有文件
      const existing = await FileSystem.getInfoAsync(fileUri);
      if (existing.exists) {
        await FileSystem.deleteAsync(fileUri);
      }

      // 下载
      const download = FileSystem.createDownloadResumable(url, fileUri);
      const result = await download.downloadAsync();
      if (!result || !result.uri) throw new Error('下载失败');

      // 获取 content:// URI（通过 Android FileProvider）
      const contentUri = await FileSystem.getContentUriAsync(result.uri);

      // 打开系统安装界面（Android 自动识别 APK content URI）
      await Linking.openURL(contentUri);
    } catch (err) {
      // 兜底：跳转浏览器下载
      Alert.alert('自动安装失败', '将打开浏览器下载，下载完成后请手动点击通知安装。');
      Linking.openURL(LATEST_APK_URL).catch(() =>
        Alert.alert('无法下载', '请稍后重试或访问 SlyWrite 网站。'),
      );
    } finally {
      setDownloading(false);
    }
  };

  const openDownload = () => {
    if (downloading) return;
    downloadApk();
  };

  const openSite = () => {
    Linking.openURL(SLYWRITE_SITE_URL).catch(() => Alert.alert('无法打开网站链接'));
  };

  const hasNewer = appRelease ? compareVersions(appRelease.tagName, APP_VERSION) > 0 : false;

  // 网站版本格式化（网站 Release tag 可能是 alpha 格式，直接显示）
  const siteVersionStr = siteRelease ? siteRelease.tagName : (siteChecking ? '…' : '—');

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* 当前版本 */}
      <Text style={s.sectionTitle}>当前版本</Text>
      <View style={s.box}>
        <View style={s.row}>
          <Text style={s.rowLabel}>App 版本</Text>
          <Text style={s.rowValue}>v{APP_VERSION}</Text>
        </View>
      </View>

      {/* App 最新版本（来自 shepherd-library-app 仓库） */}
      <Text style={s.sectionTitle}>App 最新版本</Text>
      {appChecking ? (
        <View style={[s.box, s.centerBox]}>
          <ActivityIndicator color={colors.accent} />
          <Text style={s.hint}>正在检查更新…</Text>
        </View>
      ) : appError ? (
        <View style={[s.box, s.centerBox]}>
          <Text style={s.errorText}>{appError}</Text>
          <Pressable style={[s.refreshBtn, s.retryBtn]} onPress={checkApp} disabled={appChecking}>
            <Text style={s.refreshText}>重试</Text>
          </Pressable>
        </View>
      ) : appRelease ? (
        <View style={s.box}>
          <View style={s.row}>
            <Text style={s.rowLabel}>最新版本</Text>
            <Text style={[s.rowValue, hasNewer ? s.newerText : s.latestText]}>
              {appRelease.tagName}
              {hasNewer ? '（有新版本）' : '（已是最新）'}
            </Text>
          </View>
          <Text style={s.rowLabelSmall}>发布时间</Text>
          <Text style={s.rowText}>{formatDate(appRelease.publishedAt)}</Text>
          {!!appRelease.body && (
            <>
              <Text style={s.rowLabelSmall}>更新内容</Text>
              <Text style={s.rowText}>{appRelease.body.slice(0, 500)}</Text>
            </>
          )}
          {/* 下载/安装按钮 */}
          <Pressable
            style={[s.downloadBtn, downloading && s.btnDisabled]}
            onPress={openDownload}
            disabled={downloading}
          >
            <Text style={s.downloadBtnText}>
              {downloading ? '下载中…' : `下载并安装 APK（${appRelease.tagName}）`}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={[s.box, s.centerBox]}>
          <Text style={s.hint}>暂无发布版本。构建完成后会自动发布，届时可在此检查更新。</Text>
          <Pressable style={s.siteBtn} onPress={openSite}>
            <Text style={s.siteBtnText}>访问 SlyWrite 网站</Text>
          </Pressable>
        </View>
      )}

      {/* 重新检查 App 更新 */}
      <Pressable style={s.refreshBtn} onPress={checkApp} disabled={appChecking}>
        <Text style={s.refreshText}>{appChecking ? '检查中…' : '重新检查'}</Text>
      </Pressable>

      {/* 牧羊人图书馆网站版本 */}
      <Text style={s.sectionTitle}>牧羊人图书馆网站</Text>
      <View style={s.box}>
        <View style={s.row}>
          <Text style={s.rowLabel}>网站版本</Text>
          <Text style={s.rowValue}>{siteVersionStr}</Text>
        </View>
        {siteRelease && (
          <>
            <Text style={s.rowLabelSmall}>发布时间</Text>
            <Text style={s.rowText}>{formatDate(siteRelease.publishedAt)}</Text>
          </>
        )}
        <Text style={s.hint}>「网站版本」是牧羊人图书馆网站（irikana.github.io）的版本号，与 App 更新无关</Text>
      </View>

      {/* SlyWrite 网站 */}
      <Text style={s.sectionTitle}>SlyWrite 网站</Text>
      <View style={s.box}>
        <Text style={s.rowText}>查看 SlyWrite 介绍、版本说明与下载：</Text>
        <Pressable style={s.siteBtn} onPress={openSite}>
          <Text style={s.siteBtnText}>访问 SlyWrite 网站</Text>
        </Pressable>
      </View>

      <Pressable style={s.backBtn} onPress={() => router.back()}>
        <Text style={s.backText}>返回</Text>
      </Pressable>
    </ScrollView>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgSubtle },
    content: { padding: SPACING.md, paddingBottom: SPACING.xl },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.textSecondary,
      marginBottom: SPACING.sm,
      marginTop: SPACING.sm,
    },
    box: {
      backgroundColor: COLORS.bg,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      marginBottom: SPACING.md,
    },
    centerBox: { alignItems: 'center', paddingVertical: SPACING.lg },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
    rowLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
    rowValue: { fontSize: 15, color: COLORS.text, fontWeight: '700' },
    rowLabelSmall: { fontSize: 12, color: COLORS.textLight, marginTop: SPACING.sm },
    rowText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginTop: 2 },
    newerText: { color: COLORS.accent },
    latestText: { color: COLORS.success },
    hint: { fontSize: 12, color: COLORS.textLight, marginTop: SPACING.sm, lineHeight: 17 },
    errorText: { fontSize: 13, color: COLORS.danger, lineHeight: 19 },
    downloadBtn: {
      backgroundColor: COLORS.accent,
      padding: SPACING.sm + 2,
      alignItems: 'center',
      marginTop: SPACING.md,
    },
    downloadBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    btnDisabled: { opacity: 0.5 },
    refreshBtn: {
      borderWidth: 1,
      borderColor: COLORS.accent,
      padding: SPACING.sm + 2,
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    retryBtn: { marginTop: SPACING.md, alignSelf: 'center', paddingHorizontal: SPACING.lg, marginBottom: 0 },
    refreshText: { color: COLORS.accent, fontWeight: '600', fontSize: 14 },
    siteBtn: {
      borderWidth: 1,
      borderColor: COLORS.accent,
      padding: SPACING.sm + 2,
      alignItems: 'center',
      marginTop: SPACING.sm,
    },
    siteBtnText: { color: COLORS.accent, fontWeight: '600', fontSize: 14 },
    backBtn: {
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.sm + 2,
      alignItems: 'center',
      backgroundColor: COLORS.bg,
    },
    backText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
  });