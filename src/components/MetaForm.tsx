// 文章元数据表单
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { COLORS, SPACING } from '../theme';
import { useComposeStore } from '../store/compose-store';
import { DatePickerModal } from './DatePickerModal';
import { TimePickerModal } from './TimePickerModal';
import type { ArticleTagName, ArticleType } from '../types';

const ARTICLE_TYPES: ArticleType[] = ['录音文章', '手写文章', '信息文章'];
const ALL_TAGS: ArticleTagName[] = ['新闻', '包含AI', '有删减', '无'];

export function MetaForm() {
  const { form, setField, toggleTag, setArticleType } = useComposeStore();
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  const updateFootnote = (index: number, text: string) => {
    const next = [...form.footnotes];
    next[index] = text;
    setField('footnotes', next);
  };

  const removeFootnote = (index: number) => {
    const next = [...form.footnotes];
    next.splice(index, 1);
    setField('footnotes', next);
  };

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
      <View style={s.inputRow}>
        <View style={[s.input, s.inputFlex, s.dateDisplay]}>
          <Text style={form.createDate ? s.dateText : s.datePlaceholder}>
            {form.createDate || 'YYYY-MM-DD'}
          </Text>
        </View>
        <Pressable style={s.sideBtn} onPress={() => setDatePickerVisible(true)}>
          <Text style={s.sideBtnText}>📅 日历</Text>
        </Pressable>
      </View>
      <Text style={s.hint}>点击「日历」从月历中精确选日期，或点击「自定义」手动输入字符串</Text>

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
          <View style={s.inputRow}>
            <TextInput
              style={[s.input, s.inputFlex]}
              value={form.recordingDuration}
              onChangeText={(v) => setField('recordingDuration', v)}
              placeholder="如 12:34"
              placeholderTextColor={COLORS.textLight}
            />
            <Pressable style={s.sideBtn} onPress={() => setTimePickerVisible(true)}>
              <Text style={s.sideBtnText}>🕐 小时钟</Text>
            </Pressable>
          </View>
          <Text style={s.hint}>点击「小时钟」在表盘上拖动选择时/分/秒，也可直接输入</Text>
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

      {/* 脚注 */}
      <Text style={s.label}>脚注（可选）</Text>
      <Text style={s.hint}>与正文中的上标脚注 [n] 对应，渲染在文章页脚（补充说明同级）。可在正文工具栏插入「脚注」标记</Text>
      {form.footnotes.map((fn, i) => (
        <View key={i} style={s.footnoteRow}>
          <Text style={s.footnoteIndex}>[{i + 1}]</Text>
          <TextInput
            style={[s.input, s.inputFlex]}
            value={fn}
            onChangeText={(v) => updateFootnote(i, v)}
            placeholder={`脚注 ${i + 1} 的内容`}
            placeholderTextColor={COLORS.textLight}
            multiline
          />
          <Pressable style={s.footnoteDel} onPress={() => removeFootnote(i)}>
            <Text style={s.footnoteDelText}>✕</Text>
          </Pressable>
        </View>
      ))}
      <Pressable
        style={s.addBtn}
        onPress={() => setField('footnotes', [...form.footnotes, ''])}
      >
        <Text style={s.addBtnText}>+ 添加脚注</Text>
      </Pressable>

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

      {/* 弹窗 */}
      <DatePickerModal
        visible={datePickerVisible}
        value={form.createDate}
        onConfirm={(date) => {
          setField('createDate', date);
          setDatePickerVisible(false);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />
      <TimePickerModal
        visible={timePickerVisible}
        value={form.recordingDuration || ''}
        onConfirm={(duration) => {
          setField('recordingDuration', duration);
          setTimePickerVisible(false);
        }}
        onCancel={() => setTimePickerVisible(false)}
      />
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
  hint: { fontSize: 12, color: COLORS.textLight, marginTop: 4, lineHeight: 17 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm + 2,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.bg,
  },
  inputFlex: { flex: 1 },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  inputRow: { flexDirection: 'row', alignItems: 'stretch' },
  dateDisplay: { justifyContent: 'center' },
  dateText: { fontSize: 15, color: COLORS.text },
  datePlaceholder: { fontSize: 15, color: COLORS.textLight },
  sideBtn: {
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgMuted,
  },
  sideBtnText: { fontSize: 13, color: COLORS.accent, fontWeight: '500' },
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
  footnoteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.xs, marginTop: SPACING.xs },
  footnoteIndex: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    paddingTop: SPACING.sm + 2,
    minWidth: 34,
  },
  footnoteDel: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.bgMuted,
  },
  footnoteDelText: { fontSize: 13, color: COLORS.danger },
  addBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.accent,
    padding: SPACING.sm + 2,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  addBtnText: { fontSize: 13, color: COLORS.accent, fontWeight: '500' },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md },
});
