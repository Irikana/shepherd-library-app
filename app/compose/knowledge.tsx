// 知识馆条目撰写页：词条标题 + 英文标题 + 分类 + 近义词 + 创建日期 + Markdown 正文
// 上传到 knowledge-hall/categories/{分类}/xxx.html，并同步分类页词条列表
// 复用 MarkdownEditor（工具栏 + 数学符号），草稿自动保存（独立知识词条草稿）
import React, { useEffect } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MarkdownEditor } from '../../src/components/MarkdownEditor';
import { DatePickerModal } from '../../src/components/DatePickerModal';
import { useKnowledgeStore, defaultKnowledgeForm } from '../../src/store/knowledge-store';
import { useDraftsStore } from '../../src/store/drafts-store';
import { KNOWLEDGE_CATEGORIES } from '../../src/templates/knowledge-entry';
import { SPACING, useTheme, type Palette } from '../../src/theme';

type Tab = 'meta' | 'body';

/** 文件名字符非法（仓库路径安全） */
const INVALID_PATH_CHARS = /[\\/\u0000-\u001f<>:"|?*]|\.\./;

export default function ComposeKnowledgeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [tab, setTab] = React.useState<Tab>('meta');
  const [datePickerVisible, setDatePickerVisible] = React.useState(false);
  const { form, draftId, setField, startDraft, reset } = useKnowledgeStore();

  // 进入撰写页：无草稿上下文时生成新草稿 id
  useEffect(() => {
    if (!draftId) startDraft();
  }, [draftId, startDraft]);

  // 自动保存草稿（防抖）
  useEffect(() => {
    if (!draftId) return;
    const t = setTimeout(() => {
      useDraftsStore.getState().upsert({
        id: draftId,
        title: form.title.trim() || '未命名词条',
        updatedAt: Date.now(),
        form: { ...form },
        kind: 'knowledge',
      });
    }, 600);
    return () => clearTimeout(t);
  }, [form, draftId]);

  /** 切换标签页：收起键盘 */
  const switchTab = (next: Tab) => {
    if (next === tab) return;
    Keyboard.dismiss();
    setTab(next);
  };

  const handlePublish = async () => {
    const title = form.title.trim();
    const titleEn = form.titleEn.trim();
    if (!title) {
      Alert.alert('词条标题不能为空');
      return;
    }
    if (!titleEn) {
      Alert.alert('英文标题不能为空', '英文标题将作为文件名（如 inverse-method）。');
      return;
    }
    if (INVALID_PATH_CHARS.test(titleEn)) {
      Alert.alert('英文标题不合法', '文件名不能包含 / \\ : * ? " < > | 等字符或 ..');
      return;
    }
    if (!form.bodyMarkdown.trim()) {
      Alert.alert('正文不能为空', '请填写词条的概述、详细说明、历史等内容。');
      return;
    }
    const cat = KNOWLEDGE_CATEGORIES[form.category];
    Alert.alert(
      '确认发布知识词条',
      `分类：${cat.label}\n将创建文件：\nknowledge-hall/categories/${form.category}/${titleEn}.html\n\n并同步更新 ${cat.page} 的词条列表。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '发布',
          onPress: () => router.push('/compose/knowledge-preview'),
        },
      ],
    );
  };

  return (
    <View style={s.container}>
      {/* 分段切换 */}
      <View style={s.tabs}>
        <Pressable style={[s.tab, tab === 'meta' && s.tabActive]} onPress={() => switchTab('meta')}>
          <Text style={[s.tabText, tab === 'meta' && s.tabTextActive]}>词条信息</Text>
        </Pressable>
        <Pressable style={[s.tab, tab === 'body' && s.tabActive]} onPress={() => switchTab('body')}>
          <Text style={[s.tabText, tab === 'body' && s.tabTextActive]}>正文</Text>
        </Pressable>
      </View>

      {/* 内容 */}
      <View style={s.content}>
        {tab === 'meta' ? (
          <View style={s.page}>
            {/* 词条标题（中文） */}
            <Text style={s.label}>词条标题 *</Text>
            <TextInput
              style={s.input}
              value={form.title}
              onChangeText={(v) => setField('title', v)}
              placeholder="词条中文标题（用于页面显示）"
              placeholderTextColor={colors.textLight}
            />

            {/* 英文标题（文件名） */}
            <Text style={s.label}>英文标题 *</Text>
            <TextInput
              style={s.input}
              value={form.titleEn}
              onChangeText={(v) => setField('titleEn', v)}
              placeholder="英文标题，将作为文件名（如 inverse-method）"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={s.hint}>英文标题将作为文件名；中文标题用于页面显示</Text>

            {/* 近义词/别称 */}
            <Text style={s.label}>近义词 / 别称</Text>
            <TextInput
              style={s.input}
              value={form.aliases}
              onChangeText={(v) => setField('aliases', v)}
              placeholder="如：逆向法、逆向思维（多个用顿号分隔）"
              placeholderTextColor={colors.textLight}
            />

            {/* 分类 */}
            <Text style={s.label}>知识分类 *</Text>
            <View style={s.chipRow}>
              {(Object.keys(KNOWLEDGE_CATEGORIES) as (keyof typeof KNOWLEDGE_CATEGORIES)[]).map((k) => (
                <Pressable
                  key={k}
                  style={[s.chip, form.category === k && s.chipActive]}
                  onPress={() => setField('category', k)}
                >
                  <Text style={[s.chipText, form.category === k && s.chipTextActive]}>
                    {KNOWLEDGE_CATEGORIES[k].label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={s.hint}>{KNOWLEDGE_CATEGORIES[form.category].desc}</Text>

            {/* 创建日期 */}
            <Text style={s.label}>创建日期 *</Text>
            <View style={s.inputRow}>
              <View style={[s.input, s.inputFlex, s.dateDisplay]}>
                <Text style={form.createDate ? s.dateText : s.datePlaceholder}>
                  {form.createDate || 'YYYY-MM-DD'}
                </Text>
              </View>
              <Pressable style={s.sideBtn} onPress={() => setDatePickerVisible(true)}>
                <Text style={s.sideBtnText}>日历</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={s.page}>
            <MarkdownEditor />
          </View>
        )}
      </View>

      {/* 底部发布按钮 */}
      <View style={s.footer}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>返回</Text>
        </Pressable>
        <Pressable style={s.publishBtn} onPress={handlePublish}>
          <Text style={s.publishBtnText}>发布知识词条</Text>
        </Pressable>
      </View>

      <DatePickerModal
        visible={datePickerVisible}
        value={form.createDate}
        onConfirm={(date) => {
          setField('createDate', date);
          setDatePickerVisible(false);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />
    </View>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border },
    tab: { flex: 1, paddingVertical: SPACING.sm + 2, alignItems: 'center', backgroundColor: COLORS.bgSubtle },
    tabActive: { backgroundColor: COLORS.bg, borderBottomWidth: 2, borderBottomColor: COLORS.accent },
    tabText: { fontSize: 15, color: COLORS.textSecondary },
    tabTextActive: { color: COLORS.accent, fontWeight: '600' },
    content: { flex: 1 },
    page: { flex: 1, padding: SPACING.md },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.textSecondary,
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
    },
    hint: { fontSize: 12, color: COLORS.textLight, marginTop: 4, lineHeight: 17 },
    input: {
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.sm + 2,
      fontSize: 15,
      color: COLORS.text,
      backgroundColor: COLORS.bg,
    },
    inputRow: { flexDirection: 'row', gap: SPACING.xs },
    inputFlex: { flex: 1 },
    dateDisplay: { justifyContent: 'center' },
    dateText: { fontSize: 15, color: COLORS.text },
    datePlaceholder: { fontSize: 15, color: COLORS.textLight },
    sideBtn: {
      borderWidth: 1,
      borderColor: COLORS.accent,
      paddingHorizontal: SPACING.md,
      justifyContent: 'center',
      backgroundColor: COLORS.bgSubtle,
    },
    sideBtnText: { color: COLORS.accent, fontWeight: '600', fontSize: 14 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
    chip: {
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: 6,
      paddingHorizontal: 14,
      backgroundColor: COLORS.bg,
    },
    chipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
    chipText: { fontSize: 13, color: COLORS.textSecondary },
    chipTextActive: { color: '#fff', fontWeight: '600' },
    footer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      borderTopWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      backgroundColor: COLORS.bg,
    },
    backBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      alignItems: 'center',
    },
    backText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '500' },
    publishBtn: {
      flex: 2,
      backgroundColor: COLORS.accent,
      padding: SPACING.md,
      alignItems: 'center',
    },
    publishBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  });
