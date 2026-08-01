// 文章元数据表单
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { COLORS, SPACING } from '../theme';
import { useComposeStore } from '../store/compose-store';
import type { ArticleTagName, ArticleType } from '../types';

const ARTICLE_TYPES: ArticleType[] = ['录音文章', '手写文章', '信息文章'];
const ALL_TAGS: ArticleTagName[] = ['新闻', '包含AI', '有删减', '无'];

export function MetaForm() {
  const { form, setField, toggleTag, setArticleType } = useComposeStore();

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* 标题 */}
      <Text style={s.label}>标题 *</Text>
      <TextInput
        style={s.input}
        value={form.title}
        onChangeText={(v) => setField('title', v)}
        placeholder="文章标题（用于页面标题和文件名）"
        placeholderTextColor={COLORS.textLight}
      />

      {/* 作者 */}
      <Text style={s.label}>作者 *</Text>
      <TextInput
        style={s.input}
        value={form.author}
        onChangeText={(v) => setField('author', v)}
        placeholder="作者名"
        placeholderTextColor={COLORS.textLight}
      />

      {/* 创建日期 */}
      <Text style={s.label}>创建日期 *</Text>
      <TextInput
        style={s.input}
        value={form.createDate}
        onChangeText={(v) => setField('createDate', v)}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={COLORS.textLight}
        keyboardType="numeric"
      />

      {/* 文章类型 */}
      <Text style={s.label}>文章类型 *</Text>
      <View style={s.chipRow}>
        {ARTICLE_TYPES.map((t) => (
          <Pressable
            key={t}
            style={[s.chip, form.articleType === t && s.chipActive]}
            onPress={() => setArticleType(t)}
          >
            <Text style={[s.chipText, form.articleType === t && s.chipTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      {/* 录音时长（条件） */}
      {form.articleType === '录音文章' && (
        <>
          <Text style={s.label}>录音时长</Text>
          <TextInput
            style={s.input}
            value={form.recordingDuration}
            onChangeText={(v) => setField('recordingDuration', v)}
            placeholder="如 12:34"
            placeholderTextColor={COLORS.textLight}
          />
        </>
      )}

      {/* 标签 */}
      <Text style={s.label}>标签</Text>
      <View style={s.chipRow}>
        {ALL_TAGS.map((tag) => {
          const active = form.tags.includes(tag);
          return (
            <Pressable
              key={tag}
              style={[
                s.chip,
                active && tag === '包含AI' && s.chipAi,
                active && tag === '有删减' && s.chipEdited,
                active && tag !== '包含AI' && tag !== '有删减' && s.chipActive,
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text
                style={[
                  s.chipText,
                  active && tag === '包含AI' && s.chipTextAi,
                  active && tag === '有删减' && s.chipTextEdited,
                  active && tag !== '包含AI' && tag !== '有删减' && s.chipTextActive,
                ]}
              >
                {tag}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 补充说明 */}
      <Text style={s.label}>补充说明（可选）</Text>
      <TextInput
        style={[s.input, s.inputMultiline]}
        value={form.footerNote}
        onChangeText={(v) => setField('footerNote', v)}
        placeholder="生成文章页脚的补充说明"
        placeholderTextColor={COLORS.textLight}
        multiline
      />

      {/* MathJax 开关 */}
      <View style={s.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>含数学公式</Text>
          <Text style={s.hint}>开启后注入 MathJax 3 渲染脚本</Text>
        </View>
        <Switch
          value={form.includeMathJax}
          onValueChange={(v) => setField('includeMathJax', v)}
          trackColor={{ false: COLORS.border, true: COLORS.accent }}
        />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xl },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  hint: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm + 2,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.bg,
  },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: COLORS.bg,
  },
  chipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  chipAi: { borderColor: COLORS.warning, backgroundColor: COLORS.tagAiBg },
  chipEdited: { borderColor: COLORS.danger, backgroundColor: COLORS.tagEditedBg },
  chipText: { fontSize: 13, color: COLORS.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  chipTextAi: { color: COLORS.tagAiText, fontWeight: '600' },
  chipTextEdited: { color: COLORS.tagEditedText, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md },
});
