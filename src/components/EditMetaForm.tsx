// 文章元数据编辑表单（编辑已有文章时使用，与 editor-store 配合）
// 与撰写页 MetaForm 类似，但使用 editor-store 而非 compose-store
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SPACING, useTheme, type Palette } from '../theme';
import { useEditorStore } from '../store/editor-store';
import { useConfigStore } from '../store/config-store';
import { DatePickerModal } from './DatePickerModal';
import { TimePickerModal } from './TimePickerModal';
import type { ArticleType } from '../types';

const ARTICLE_TYPES: ArticleType[] = ['录音文章', '手写文章', '信息文章', '实验性文章'];

export function EditMetaForm() {
  const { metadata, setMetadata, toggleMetaTag, setMetaArticleType } = useEditorStore();
  const allTags = useConfigStore((s) => s.tags);
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  if (!metadata) return null;

  const updateFootnote = (index: number, text: string) => {
    const next = [...metadata.footnotes];
    next[index] = text;
    setMetadata('footnotes', next);
  };

  const removeFootnote = (index: number) => {
    const next = [...metadata.footnotes];
    next.splice(index, 1);
    setMetadata('footnotes', next);
  };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* 标题 */}
      <Text style={s.label}>标题</Text>
      <TextInput
        style={s.input}
        value={metadata.title}
        onChangeText={(v) => setMetadata('title', v)}
        placeholder="文章标题"
        placeholderTextColor={colors.textLight}
      />

      {/* 作者 */}
      <Text style={s.label}>作者</Text>
      <TextInput
        style={s.input}
        value={metadata.author}
        onChangeText={(v) => setMetadata('author', v)}
        placeholder="作者名"
        placeholderTextColor={colors.textLight}
      />

      {/* 创建日期 */}
      <Text style={s.label}>创建日期</Text>
      <View style={s.inputRow}>
        <View style={[s.input, s.inputFlex, s.dateDisplay]}>
          <Text style={metadata.createDate ? s.dateText : s.datePlaceholder}>
            {metadata.createDate || 'YYYY-MM-DD'}
          </Text>
        </View>
        <Pressable style={s.sideBtn} onPress={() => setDatePickerVisible(true)}>
          <Text style={s.sideBtnText}>日历</Text>
        </Pressable>
      </View>

      {/* 文章性质 */}
      <Text style={s.label}>文章性质</Text>
      <View style={s.chipRow}>
        {ARTICLE_TYPES.map((t) => (
          <Pressable
            key={t}
            style={[s.chip, metadata.articleType === t && s.chipActive]}
            onPress={() => setMetaArticleType(t)}
          >
            <Text style={[s.chipText, metadata.articleType === t && s.chipTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      {/* 录音时长（条件） */}
      {metadata.articleType === '录音文章' && (
        <>
          <Text style={s.label}>录音时长</Text>
          <View style={s.inputRow}>
            <TextInput
              style={[s.input, s.inputFlex]}
              value={metadata.recordingDuration}
              onChangeText={(v) => setMetadata('recordingDuration', v)}
              placeholder="如 12:34"
              placeholderTextColor={colors.textLight}
            />
            <Pressable style={s.sideBtn} onPress={() => setTimePickerVisible(true)}>
              <Text style={s.sideBtnText}>小时钟</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* 标签 */}
      <Text style={s.label}>标签</Text>
      <View style={s.chipRow}>
        {allTags.map((tag) => {
          const active = metadata.tags.includes(tag);
          return (
            <Pressable
              key={tag}
              style={[
                s.chip,
                active && tag === '新闻' && s.chipNews,
                active && tag === '包含AI' && s.chipAi,
                active && tag === '有删减' && s.chipEdited,
                active && tag === '小说' && s.chipNovel,
                active && tag !== '新闻' && tag !== '包含AI' && tag !== '有删减' && tag !== '小说' && s.chipActive,
              ]}
              onPress={() => toggleMetaTag(tag)}
            >
              <Text
                style={[
                  s.chipText,
                  active && tag === '新闻' && s.chipTextNews,
                  active && tag === '包含AI' && s.chipTextAi,
                  active && tag === '有删减' && s.chipTextEdited,
                  active && tag === '小说' && s.chipTextNovel,
                  active && tag !== '新闻' && tag !== '包含AI' && tag !== '有删减' && tag !== '小说' && s.chipTextActive,
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
        value={metadata.footerNote}
        onChangeText={(v) => setMetadata('footerNote', v)}
        placeholder="文章页脚的补充说明"
        placeholderTextColor={colors.textLight}
        multiline
      />

      {/* 脚注 */}
      <Text style={s.label}>脚注（可选）</Text>
      <Text style={s.hint}>正文中 [^n] 上标引用对应第 n 条脚注</Text>
      {metadata.footnotes.map((fn, i) => (
        <View key={i} style={s.footnoteRow}>
          <Text style={s.footnoteIndex}>[{i + 1}]</Text>
          <TextInput
            style={[s.input, s.inputFlex]}
            value={fn}
            onChangeText={(v) => updateFootnote(i, v)}
            placeholder={`脚注 ${i + 1} 的内容`}
            placeholderTextColor={colors.textLight}
            multiline
          />
          <Pressable style={s.footnoteDel} onPress={() => removeFootnote(i)}>
            <Text style={s.footnoteDelText}>删除</Text>
          </Pressable>
        </View>
      ))}
      <Pressable
        style={s.addBtn}
        onPress={() => setMetadata('footnotes', [...metadata.footnotes, ''])}
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
          value={metadata.includeMathJax}
          onValueChange={(v) => setMetadata('includeMathJax', v)}
          trackColor={{ false: colors.border, true: colors.accent }}
        />
      </View>

      {/* 弹窗 */}
      <DatePickerModal
        visible={datePickerVisible}
        value={metadata.createDate}
        onConfirm={(date) => {
          setMetadata('createDate', date);
          setDatePickerVisible(false);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />
      <TimePickerModal
        visible={timePickerVisible}
        value={metadata.recordingDuration || ''}
        onConfirm={(duration) => {
          setMetadata('recordingDuration', duration);
          setTimePickerVisible(false);
        }}
        onCancel={() => setTimePickerVisible(false)}
      />
    </ScrollView>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
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
    chipNews: { borderColor: COLORS.tagNewsBorder, backgroundColor: COLORS.tagNewsBg },
    chipAi: { borderColor: COLORS.warning, backgroundColor: COLORS.tagAiBg },
    chipEdited: { borderColor: COLORS.danger, backgroundColor: COLORS.tagEditedBg },
    chipNovel: { borderColor: COLORS.tagNovelBorder, backgroundColor: COLORS.tagNovelBg },
    chipText: { fontSize: 13, color: COLORS.textSecondary },
    chipTextActive: { color: '#fff', fontWeight: '600' },
    chipTextNews: { color: COLORS.tagNewsText, fontWeight: '600' },
    chipTextAi: { color: COLORS.tagAiText, fontWeight: '600' },
    chipTextEdited: { color: COLORS.tagEditedText, fontWeight: '600' },
    chipTextNovel: { color: COLORS.tagNovelText, fontWeight: '600' },
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
