// Markdown 正文编辑器（多行输入 + 快捷插入工具栏）
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, FONT, SPACING } from '../theme';
import { useComposeStore } from '../store/compose-store';

interface InsertAction {
  label: string;
  insert: (before: string, selStart: number, selEnd: number) => { text: string; cursor: number };
}

const ACTIONS: InsertAction[] = [
  {
    label: 'H2',
    insert: (b, s) => {
      const text = b.slice(0, s) + '## ' + b.slice(s);
      return { text, cursor: s + 3 };
    },
  },
  {
    label: 'H3',
    insert: (b, s) => {
      const text = b.slice(0, s) + '### ' + b.slice(s);
      return { text, cursor: s + 4 };
    },
  },
  {
    label: '加粗',
    insert: (b, s, e) => {
      const sel = b.slice(s, e) || '加粗';
      const text = b.slice(0, s) + `**${sel}**` + b.slice(e);
      return { text, cursor: s + 2 + sel.length };
    },
  },
  {
    label: '斜体',
    insert: (b, s, e) => {
      const sel = b.slice(s, e) || '斜体';
      const text = b.slice(0, s) + `*${sel}*` + b.slice(e);
      return { text, cursor: s + 1 + sel.length };
    },
  },
  {
    label: '链接',
    insert: (b, s) => {
      const text = b.slice(0, s) + '[文字](https://)' + b.slice(s);
      return { text, cursor: s + 9 };
    },
  },
  {
    label: '蓝框',
    insert: (b, s) => {
      const block = '<div class="function-box-blue">\n  \n</div>';
      const text = b.slice(0, s) + block + b.slice(s);
      return { text, cursor: s + 28 };
    },
  },
  {
    label: '折叠块',
    insert: (b, s) => {
      const block = '<details>\n  <summary>标题</summary>\n  <div>\n    \n  </div>\n</details>';
      const text = b.slice(0, s) + block + b.slice(s);
      return { text, cursor: s + 48 };
    },
  },
  {
    label: '换行',
    insert: (b, s) => {
      const text = b.slice(0, s) + '<br>' + b.slice(s);
      return { text, cursor: s + 4 };
    },
  },
];

export function MarkdownEditor() {
  const { form, setField } = useComposeStore();
  const selectionRef = React.useRef({ start: 0, end: 0 });

  const handleInsert = (action: InsertAction) => {
    const { start, end } = selectionRef.current;
    const { text, cursor } = action.insert(form.bodyMarkdown, start, end);
    setField('bodyMarkdown', text);
    // 注意：TextInput 的 selection 需在下个事件循环设置才生效
    setTimeout(() => {
      selectionRef.current = { start: cursor, end: cursor };
    }, 0);
  };

  return (
    <View style={s.container}>
      <View style={s.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {ACTIONS.map((a) => (
            <Pressable key={a.label} style={s.toolBtn} onPress={() => handleInsert(a)}>
              <Text style={s.toolText}>{a.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <TextInput
        style={s.editor}
        value={form.bodyMarkdown}
        onChangeText={(v) => setField('bodyMarkdown', v)}
        onSelectionChange={(e) => {
          selectionRef.current = {
            start: e.nativeEvent.selection.start,
            end: e.nativeEvent.selection.end,
          };
        }}
        placeholder="在此撰写正文（Markdown）…&#10;空行分段，可用上方工具栏插入组件"
        placeholderTextColor={COLORS.textLight}
        multiline
        textAlignVertical="top"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={s.counter}>{form.bodyMarkdown.length} 字</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  toolbar: {
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgSubtle,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  toolBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: SPACING.xs,
    backgroundColor: COLORS.bg,
  },
  toolText: { fontSize: 13, color: COLORS.accent, fontWeight: '500' },
  editor: {
    flex: 1,
    padding: SPACING.md,
    fontSize: FONT.size,
    fontFamily: FONT.mono,
    lineHeight: FONT.lineHeight,
    color: COLORS.text,
    backgroundColor: COLORS.bg,
    textAlignVertical: 'top',
  },
  counter: {
    textAlign: 'right',
    fontSize: 12,
    color: COLORS.textLight,
    padding: SPACING.xs,
    backgroundColor: COLORS.bgSubtle,
  },
});
