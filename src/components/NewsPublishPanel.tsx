// 新闻板块发布面板（内容编辑器用）
// 需求：内容编辑功能要能「可选地展示在新闻板块」——包括此前发布时被静默跳过的新闻（可补发）。
// 能力：查询三处（index.html / news.html / en/index.html）实际收录状态 → 按文字/海报形态发布或更新 → 移除。
// 规矩与撰写页一致：海报原图上传到 image/poster/，不压缩；同步失败一定显示原因，不静默。
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { putFile } from '../lib/github-client';
import { checkNewsPresence, removeNewsItem, syncNewsSections, type NewsPresence } from '../lib/news-sync';
import type { NewsKind } from '../types';
import { SPACING, useTheme, type Palette } from '../theme';

interface NewsPublishPanelProps {
  visible: boolean;
  onClose: () => void;
  /** 中文标题（卡片显示） */
  title: string;
  /** 英文标题（文件名，不含扩展名） */
  titleEn: string;
  /** 发布日期 YYYY-MM-DD */
  date: string;
  /** 文章分类目录（相对 library/，如 paper） */
  categoryDir: string;
  /** 同步结果回调：inNews=true 表示当前已在新闻板块（用于联动「新闻」标签） */
  onResult?: (inNews: boolean) => void;
}

const EMPTY: NewsPresence = { inIndex: false, isPoster: false, inNewsList: false, inEnIndex: false };

export function NewsPublishPanel({
  visible,
  onClose,
  title,
  titleEn,
  date,
  categoryDir,
  onResult,
}: NewsPublishPanelProps) {
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [presence, setPresence] = useState<NewsPresence>(EMPTY);
  const [kind, setKind] = useState<NewsKind>('text');
  const [posterUri, setPosterUri] = useState<string | null>(null);
  const [posterBase64, setPosterBase64] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const opts = { title, titleEn, date, kind, categoryDir };

  const refresh = useCallback(async () => {
    setChecking(true);
    try {
      const { presence: p, errors: errs } = await checkNewsPresence({ titleEn, categoryDir });
      setPresence(p);
      setErrors(errs);
      if (p.isPoster) setKind('poster');
    } catch (e) {
      setErrors([`状态查询失败：${(e as Error).message}`]);
    } finally {
      setChecking(false);
    }
  }, [titleEn, categoryDir]);

  useEffect(() => {
    if (visible) {
      setReport([]);
      setErrors([]);
      void refresh();
    }
  }, [visible, refresh]);

  const pickPoster = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        base64: true,
      });
      if (res.canceled || !res.assets?.length) return;
      const asset = res.assets[0];
      if (!asset.base64) {
        Alert.alert('选图失败', '未能读取所选图片的数据，请换一张图片重试。');
        return;
      }
      setPosterUri(asset.uri);
      setPosterBase64(asset.base64);
    } catch (err) {
      Alert.alert('选图失败', `无法读取所选图片，请重试。\n\n${(err as Error).message}`);
    }
  };

  /** 发布/更新到新闻板块（海报形态先传海报） */
  const publish = async () => {
    setBusy(true);
    setReport([]);
    setErrors([]);
    try {
      let posterPath: string | undefined;
      if (kind === 'poster' && posterBase64) {
        posterPath = `image/poster/${titleEn}.png`;
        await putFile(posterPath, posterBase64, {
          message: `新闻海报：${title}（移动端 App）`,
          contentIsBase64: true,
        });
        setReport((r) => [...r, `海报已上传：${posterPath}`]);
      }
      const steps = await syncNewsSections({ ...opts, posterPath });
      setReport((r) => [...r, ...steps]);
      const { presence: p, errors: errs } = await checkNewsPresence({ titleEn, categoryDir });
      setPresence(p);
      setErrors(errs);
      onResult?.(p.inIndex || p.inNewsList);
    } catch (e) {
      setErrors([`发布失败：${(e as Error).message}`]);
    } finally {
      setBusy(false);
    }
  };

  /** 从新闻板块移除 */
  const remove = async () => {
    setBusy(true);
    setReport([]);
    setErrors([]);
    try {
      const steps = await removeNewsItem(opts);
      setReport((r) => [...r, ...steps]);
      const { presence: p, errors: errs } = await checkNewsPresence({ titleEn, categoryDir });
      setPresence(p);
      setErrors(errs);
      onResult?.(p.inIndex || p.inNewsList);
    } catch (e) {
      setErrors([`移除失败：${(e as Error).message}`]);
    } finally {
      setBusy(false);
    }
  };

  const inAny = presence.inIndex || presence.inNewsList || presence.inEnIndex;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.panel}>
          <View style={s.header}>
            <Text style={s.title}>新闻板块</Text>
            <Pressable style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeText}>关闭</Text>
            </Pressable>
          </View>
          <Text style={s.subject} numberOfLines={2}>
            {title}（library/{categoryDir}/{titleEn}.html）
          </Text>

          {/* 收录状态 */}
          <View style={s.stateBox}>
            <Text style={s.stateTitle}>
              当前状态：{checking ? '查询中…' : inAny ? (presence.isPoster ? '已在新闻区（海报）' : '已在新闻区（文字）') : '未展示在新闻板块'}
            </Text>
            <StateLine label="主页新闻区 index.html" on={presence.inIndex} busy={checking} />
            <StateLine label="新闻列表 news.html" on={presence.inNewsList} busy={checking} />
            <StateLine label="英文主页 en/index.html" on={presence.inEnIndex} busy={checking} />
            <Pressable style={s.refreshBtn} onPress={() => void refresh()} disabled={checking}>
              <Text style={s.refreshText}>{checking ? '查询中…' : '重新查询状态'}</Text>
            </Pressable>
          </View>

          {/* 形态 */}
          <Text style={s.label}>新闻形态</Text>
          <View style={s.chipRow}>
            <Pressable style={[s.chip, kind === 'text' && s.chipActive]} onPress={() => setKind('text')}>
              <Text style={[s.chipText, kind === 'text' && s.chipTextActive]}>文字新闻</Text>
            </Pressable>
            <Pressable style={[s.chip, kind === 'poster' && s.chipActive]} onPress={() => setKind('poster')}>
              <Text style={[s.chipText, kind === 'poster' && s.chipTextActive]}>海报新闻</Text>
            </Pressable>
          </View>
          <Text style={s.hint}>
            海报新闻会替换主页左侧海报位，旧海报自动降级为右侧文字新闻；右侧始终保持最多 6 条、按日期降序。
          </Text>

          {kind === 'poster' && (
            <>
              <Text style={s.label}>海报图片</Text>
              {posterUri ? <Image source={{ uri: posterUri }} style={s.poster} resizeMode="contain" /> : null}
              <Pressable style={s.pickBtn} onPress={pickPoster}>
                <Text style={s.pickText}>{posterUri ? '重新选择海报' : '选择海报图片'}</Text>
              </Pressable>
              {!posterBase64 && (
                <Text style={s.warnText}>未选择图片时发布会按文字新闻处理（保持当前海报不替换）。</Text>
              )}
            </>
          )}

          {/* 操作 */}
          <View style={s.actions}>
            <Pressable style={[s.btn, s.btnPrimary, busy && s.btnDisabled]} onPress={publish} disabled={busy}>
              <Text style={s.btnPrimaryText}>{busy ? '处理中…' : inAny ? '更新到新闻板块' : '展示在新闻板块'}</Text>
            </Pressable>
            <Pressable
              style={[s.btn, s.btnDanger, (busy || !inAny) && s.btnDisabled]}
              onPress={remove}
              disabled={busy || !inAny}
            >
              <Text style={s.btnDangerText}>从新闻板块移除</Text>
            </Pressable>
          </View>

          {/* 结果 */}
          {(report.length > 0 || errors.length > 0) && (
            <ScrollView style={s.logScroll}>
              {errors.map((m, i) => (
                <Text key={`e${i}`} style={s.logError}>
                  {m}
                </Text>
              ))}
              {report.map((m, i) => (
                <Text key={`r${i}`} style={[s.logItem, m.includes('失败') && s.logError]}>
                  {m}
                </Text>
              ))}
              <Text style={s.logFoot}>约 1-2 分钟后网站生效。</Text>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function StateLine({ label, on, busy }: { label: string; on: boolean; busy: boolean }) {
  const { colors } = useTheme();
  const s = createStyles(colors);
  return (
    <View style={s.stateLine}>
      <Text style={s.stateLabel}>{label}</Text>
      <Text style={[s.stateValue, on ? s.stateOn : s.stateOff]}>
        {busy ? '…' : on ? '已收录' : '未收录'}
      </Text>
    </View>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    panel: {
      backgroundColor: COLORS.bg,
      borderTopWidth: 2,
      borderTopColor: COLORS.accent,
      padding: SPACING.md,
      maxHeight: '88%',
    },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: 17, fontWeight: '700', color: COLORS.text },
    closeBtn: {
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: SPACING.md,
      paddingVertical: 4,
      backgroundColor: COLORS.bgSubtle,
    },
    closeText: { fontSize: 13, color: COLORS.textSecondary },
    subject: { fontSize: 12, color: COLORS.textLight, marginTop: 4, marginBottom: SPACING.sm },
    stateBox: {
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.bgSubtle,
      padding: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    stateTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.xs },
    stateLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
    stateLabel: { fontSize: 12, color: COLORS.textSecondary },
    stateValue: { fontSize: 12, fontWeight: '600' },
    stateOn: { color: COLORS.success },
    stateOff: { color: COLORS.textLight },
    refreshBtn: {
      marginTop: SPACING.xs,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: 4,
      alignItems: 'center',
      backgroundColor: COLORS.bg,
    },
    refreshText: { fontSize: 12, color: COLORS.accent },
    label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginTop: SPACING.sm, marginBottom: SPACING.xs },
    chipRow: { flexDirection: 'row', gap: SPACING.xs, flexWrap: 'wrap' },
    chip: {
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: COLORS.bg,
    },
    chipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
    chipText: { fontSize: 12, color: COLORS.textSecondary },
    chipTextActive: { color: '#fff', fontWeight: '600' },
    hint: { fontSize: 11, color: COLORS.textLight, lineHeight: 16, marginTop: SPACING.xs },
    poster: { width: '100%', height: 150, borderWidth: 1, borderColor: COLORS.border, marginTop: SPACING.xs },
    pickBtn: {
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.sm + 2,
      alignItems: 'center',
      backgroundColor: COLORS.bgSubtle,
      marginTop: SPACING.xs,
    },
    pickText: { fontSize: 13, color: COLORS.accent },
    warnText: { fontSize: 11, color: COLORS.warning, marginTop: 2 },
    actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
    btn: { flex: 1, borderWidth: 1, padding: SPACING.sm + 2, alignItems: 'center' },
    btnPrimary: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    btnDanger: { borderColor: COLORS.danger, backgroundColor: COLORS.bg },
    btnDangerText: { color: COLORS.danger, fontSize: 14, fontWeight: '600' },
    btnDisabled: { opacity: 0.5 },
    logScroll: { flexGrow: 0, maxHeight: 160, marginTop: SPACING.sm },
    logItem: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 19 },
    logError: { fontSize: 12, color: COLORS.danger, lineHeight: 19 },
    logFoot: { fontSize: 11, color: COLORS.textLight, marginTop: SPACING.xs },
  });
