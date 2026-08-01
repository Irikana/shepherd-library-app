// 撰写文章页：元数据表单 + Markdown 编辑器（分段切换）
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MetaForm } from '../../src/components/MetaForm';
import { MarkdownEditor } from '../../src/components/MarkdownEditor';
import { useComposeStore } from '../../src/store/compose-store';
import { generateArticleHtml } from '../../src/templates/article';
import { validateArticleHtml } from '../../src/templates/validators';
import { COLORS, SPACING } from '../../src/theme';

type Tab = 'meta' | 'body';

export default function ComposeArticleScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('meta');
  const { form, setGeneratedHtml } = useComposeStore();

  const handlePreview = () => {
    if (!form.title.trim()) {
      Alert.alert('标题不能为空');
      return;
    }
    if (!form.bodyMarkdown.trim()) {
      Alert.alert('正文不能为空');
      return;
    }
    const html = generateArticleHtml(form);
    const result = validateArticleHtml(html);
    if (!result.valid) {
      Alert.alert(
        'HTML 校验未通过',
        `缺少必需项：\n${result.missing.join('\n')}\n\n仍要预览吗？`,
        [
          { text: '返回修改', style: 'cancel' },
          { text: '仍要预览', onPress: () => goPreview(html) },
        ],
      );
      return;
    }
    goPreview(html);
  };

  const goPreview = (html: string) => {
    setGeneratedHtml(html);
    router.push('/compose/preview');
  };

  return (
    <View style={s.container}>
      {/* 分段切换 */}
      <View style={s.tabs}>
        <Pressable
          style={[s.tab, tab === 'meta' && s.tabActive]}
          onPress={() => setTab('meta')}
        >
          <Text style={[s.tabText, tab === 'meta' && s.tabTextActive]}>元数据</Text>
        </Pressable>
        <Pressable
          style={[s.tab, tab === 'body' && s.tabActive]}
          onPress={() => setTab('body')}
        >
          <Text style={[s.tabText, tab === 'body' && s.tabTextActive]}>正文</Text>
        </Pressable>
      </View>

      {/* 内容 */}
      <View style={s.content}>
        {tab === 'meta' ? <MetaForm /> : <MarkdownEditor />}
      </View>

      {/* 底部预览按钮 */}
      <View style={s.footer}>
        <Pressable style={s.previewBtn} onPress={handlePreview}>
          <Text style={s.previewBtnText}>生成预览</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border },
  tab: { flex: 1, paddingVertical: SPACING.sm + 2, alignItems: 'center', backgroundColor: COLORS.bgSubtle },
  tabActive: { backgroundColor: COLORS.bg, borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabText: { fontSize: 15, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.accent, fontWeight: '600' },
  content: { flex: 1 },
  footer: {
    borderTopWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    backgroundColor: COLORS.bg,
  },
  previewBtn: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    alignItems: 'center',
  },
  previewBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
