// 代码/正文编辑器：可滚动的多行文本编辑
// 滚动方案：外层 ScrollView 是唯一滚动容器，内部 TextInput 不限制高度（wrap 内容）、
// 关闭自身滚动（scrollEnabled={false}）——从机制上避免 Android 上「TextInput 内部滚动
// 与父级手势冲突」导致的"滑到底部"反馈，长文件（HTML/CSS/JS 等）可正常滑动浏览。
import React from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';
import { ReadOnlyText } from './ReadOnlyText';
import { SPACING, useTheme, type Palette } from '../theme';

interface CodeEditorProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** 等宽字体（代码/HTML）还是正文字体（正文 HTML 编辑） */
  mono?: boolean;
  /** 是否可编辑（默认 true；锁定态由外部传入 false：可滑动浏览但不能编辑） */
  editable?: boolean;
}

export function CodeEditor({ value, onChangeText, placeholder, autoFocus, mono = true, editable = true }: CodeEditorProps) {
  const { colors } = useTheme();
  const s = createStyles(colors);
  // 锁定态：Android 上 editable=false 的 TextInput 连内部滚动都会失效，
  // 改用只读分块视图——保留滑动浏览能力，且绝对无法编辑。
  if (!editable) {
    return <ReadOnlyText text={value} mono={mono} hint="已锁定：可上下滑动浏览，不能编辑（解锁后恢复编辑）" />;
  }
  return (
    <ScrollView
      style={s.scrollArea}
      contentContainerStyle={s.scrollContent}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="on-drag"
    >
      <TextInput
        style={[s.editor, mono ? s.mono : s.prose]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        multiline
        textAlignVertical="top"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        editable
        scrollEnabled={false}
        showSoftInputOnFocus
      />
    </ScrollView>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    scrollArea: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    editor: {
      padding: SPACING.md,
      paddingBottom: SPACING.xl,
      color: COLORS.text,
      backgroundColor: COLORS.bg,
      textAlignVertical: 'top',
    },
    mono: {
      fontSize: 14,
      lineHeight: 21,
      fontFamily: 'monospace',
    },
    prose: {
      fontSize: 15,
      lineHeight: 24,
    },
  });
