// 标签芯片行（撰写页元数据表单与编辑页共用）
// 颜色优先级：站点配置 tagColors 中用户为该标签设置的颜色 > 主题内置色（新闻/小说/包含AI/有删减）> 通用选中态
// 遵循全站扁平规范：无圆角、无 emoji。
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useConfigStore } from '../store/config-store';
import { tagChipStyle } from '../lib/tag-colors';
import { SPACING, useTheme, type Palette } from '../theme';

export interface TagChipsProps {
  /** 全部可选标签（内置 + 自定义） */
  all: string[];
  /** 已选中标签 */
  selected: string[];
  onToggle: (tag: string) => void;
  disabled?: boolean;
}

export function TagChips({ all, selected, onToggle, disabled }: TagChipsProps) {
  const { colors, isDark } = useTheme();
  const s = createStyles(colors);
  const tagColors = useConfigStore((st) => st.tagColors);

  return (
    <View style={s.chipRow}>
      {all.map((tag) => {
        const active = selected.includes(tag);
        const custom = tagChipStyle(tagColors[tag], isDark);
        const builtin = active ? builtinChip(tag, s) : null;
        const textStyle = active ? builtin?.text ?? (custom ? { color: custom.textColor } : s.chipTextActive) : null;
        const boxStyle = active
          ? custom
            ? { borderColor: custom.borderColor, backgroundColor: custom.backgroundColor }
            : builtin?.box ?? s.chipActive
          : custom
            ? { borderColor: custom.borderColor }
            : null;
        return (
          <Pressable
            key={tag}
            style={[s.chip, boxStyle, disabled && s.btnDisabled]}
            onPress={() => onToggle(tag)}
            disabled={disabled}
          >
            <Text style={[s.chipText, textStyle]}>{tag}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** 内置四个标签的主题默认色（用户设置颜色时优先使用用户色） */
function builtinChip(tag: string, s: ReturnType<typeof createStyles>) {
  if (tag === '新闻') return { box: s.chipNews, text: s.chipTextNews };
  if (tag === '包含AI') return { box: s.chipAi, text: s.chipTextAi };
  if (tag === '有删减') return { box: s.chipEdited, text: s.chipTextEdited };
  if (tag === '小说') return { box: s.chipNovel, text: s.chipTextNovel };
  return null;
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.xs },
    chip: {
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: 6,
      paddingHorizontal: 12,
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
    btnDisabled: { opacity: 0.5 },
  });
