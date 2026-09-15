// 草稿箱：列出本机缓存的未完成文章与知识词条，可恢复继续编辑或删除
// 这里是唯一的「继续编辑」入口：resume() 用 normalizeDraftForm 把任意版本草稿规整成统一表单，
// 再交给 compose-store.loadDraft（带上草稿 id），最后进入统一撰写页——
// 「新建」不在这里发生，由首页入口的 startNewArticle / startNewKnowledge 负责
import React, { useEffect } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useDraftsStore, draftEntryType, normalizeDraftForm } from '../src/store/drafts-store';
import { useComposeStore } from '../src/store/compose-store';
import { SPACING, useTheme, type Palette } from '../src/theme';

function formatTime(ts: number): string {
  const d = new Date(ts);
  const p2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

export default function DraftsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const { drafts, init } = useDraftsStore();

  useEffect(() => {
    init();
  }, [init]);

  const resume = (id: string) => {
    const draft = useDraftsStore.getState().drafts.find((d) => d.id === id);
    if (!draft) return;
    // 旧草稿（无 entryType / 旧知识词条形状 / 旧新闻标记）在这里一次性迁移为统一表单
    useComposeStore.getState().loadDraft(draft.id, normalizeDraftForm(draft));
    router.push('/compose/article');
  };

  const remove = (id: string, title: string) => {
    Alert.alert('删除草稿', `确定删除「${title}」吗？删除后无法恢复。`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => useDraftsStore.getState().remove(id) },
    ]);
  };

  if (drafts.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyTitle}>暂无草稿</Text>
        <Text style={s.emptyText}>撰写文章或知识词条时会自动保存，退出后仍可在此恢复</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={s.container}
      contentContainerStyle={s.content}
      data={drafts}
      keyExtractor={(d) => d.id}
      renderItem={({ item }) => (
        <View style={s.card}>
          <Pressable style={{ flex: 1 }} onPress={() => resume(item.id)}>
            <View style={s.cardHeader}>
              <Text style={s.cardKind}>{draftEntryType(item) === 'knowledge' ? '知识词条' : '文章'}</Text>
              <Text style={s.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            <Text style={s.cardTime}>上次编辑：{formatTime(item.updatedAt)}</Text>
            <Text style={s.cardDesc} numberOfLines={2}>
              {item.form.bodyMarkdown?.trim() || '（正文为空）'}
            </Text>
          </Pressable>
          <View style={s.actions}>
            <Pressable style={s.resumeBtn} onPress={() => resume(item.id)}>
              <Text style={s.resumeText}>继续编辑</Text>
            </Pressable>
            <Pressable style={s.delBtn} onPress={() => remove(item.id, item.title)}>
              <Text style={s.delText}>删除</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgSubtle },
    content: { padding: SPACING.md, paddingBottom: SPACING.xl },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs },
    emptyText: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', lineHeight: 19 },
    card: {
      backgroundColor: COLORS.bg,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
    },
    cardTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.text },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
    cardKind: {
      fontSize: 11,
      fontWeight: '600',
      color: COLORS.textLight,
      backgroundColor: COLORS.bgMuted,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    cardTime: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
    cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6, lineHeight: 18 },
    actions: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.sm },
    resumeBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.accent,
      paddingVertical: SPACING.sm,
      alignItems: 'center',
    },
    resumeText: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
    delBtn: {
      borderWidth: 1,
      borderColor: COLORS.danger,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      alignItems: 'center',
    },
    delText: { fontSize: 13, color: COLORS.danger, fontWeight: '600' },
  });
