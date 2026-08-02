// Markdown 正文编辑器（多行输入 + 快捷插入工具栏 + 数学符号面板）
// 插入交互修复：工具栏按钮用 onPressIn 立即响应（Android 输入法打开时无需先收起键盘），
// 插入后通过 setNativeProps 恢复光标位置并保持输入框焦点
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FONT, SPACING, useTheme, type Palette } from '../theme';
import { useComposeStore } from '../store/compose-store';

interface InsertAction {
  label: string;
  insert: (before: string, selStart: number, selEnd: number) => { text: string; cursor: number };
}

/** 片段插入：§ 为光标落点，无 § 时光标在片段末尾 */
function snippetAction(label: string, snippet: string): InsertAction {
  return {
    label,
    insert: (b, s, e) => {
      const caret = snippet.indexOf('§');
      const clean = snippet.replace('§', '');
      const text = b.slice(0, s) + clean + b.slice(e);
      return { text, cursor: caret >= 0 ? s + caret : s + clean.length };
    },
  };
}

const CODE_BLOCK =
  '```js\n' +
  '§\n' +
  '```';

const TABLE =
  '| 表头1 | 表头2 |\n' +
  '| --- | --- |\n' +
  '| §内容 | 内容 |';

const CALLOUT =
  '<div class="callout">\n' +
  '  <span class="icon">ℹ️</span>\n' +
  '  <p>§提示内容</p>\n' +
  '</div>';

const ACTIONS: InsertAction[] = [
  { label: 'H2', insert: (b, s) => ({ text: b.slice(0, s) + '## ' + b.slice(s), cursor: s + 3 }) },
  { label: 'H3', insert: (b, s) => ({ text: b.slice(0, s) + '### ' + b.slice(s), cursor: s + 4 }) },
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
    label: '删除线',
    insert: (b, s, e) => {
      const sel = b.slice(s, e) || '删除';
      const text = b.slice(0, s) + `~~${sel}~~` + b.slice(e);
      return { text, cursor: s + 2 + sel.length };
    },
  },
  { label: '行内代码', insert: (b, s, e) => {
    const sel = b.slice(s, e) || 'code';
    const text = b.slice(0, s) + '`' + sel + '`' + b.slice(e);
    return { text, cursor: s + 1 + sel.length };
  } },
  { label: '链接', insert: (b, s) => ({ text: b.slice(0, s) + '[文字](https://)' + b.slice(s), cursor: s + 9 }) },
  { label: '图片', insert: (b, s) => ({ text: b.slice(0, s) + '![图片描述](https://)' + b.slice(s), cursor: s + 20 }) },
  {
    label: '蓝框',
    insert: (b, s) => {
      const block = '<div class="function-box-blue">\n  §内容\n</div>';
      return snippetAction('蓝框', block).insert(b, s, s);
    },
  },
  {
    label: '灰引',
    insert: (b, s) => {
      const block = '<div class="quote-box-grey">\n  §引用或参考内容\n</div>';
      return snippetAction('灰引', block).insert(b, s, s);
    },
  },
  {
    label: '红警',
    insert: (b, s) => {
      const block = '<div class="notice-box-red">\n  §警告内容（请谨慎使用）\n</div>';
      return snippetAction('红警', block).insert(b, s, s);
    },
  },
  { label: 'Callout', insert: (b, s) => snippetAction('Callout', CALLOUT).insert(b, s, s) },
  {
    label: '折叠块',
    insert: (b, s) => {
      const block = '<details>\n  <summary>标题</summary>\n  <div>\n    §\n  </div>\n</details>';
      return snippetAction('折叠块', block).insert(b, s, s);
    },
  },
  { label: '引用', insert: (b, s) => ({ text: b.slice(0, s) + '> ' + b.slice(s), cursor: s + 2 }) },
  { label: '列表', insert: (b, s) => ({ text: b.slice(0, s) + '- ' + b.slice(s), cursor: s + 2 }) },
  { label: '有序', insert: (b, s) => ({ text: b.slice(0, s) + '1. ' + b.slice(s), cursor: s + 3 }) },
  { label: '代码块', insert: (b, s) => snippetAction('代码块', CODE_BLOCK).insert(b, s, s) },
  { label: '表格', insert: (b, s) => snippetAction('表格', TABLE).insert(b, s, s) },
  { label: '分割线', insert: (b, s) => ({ text: b.slice(0, s) + '\n---\n' + b.slice(s), cursor: s + 5 }) },
  { label: '换行', insert: (b, s) => ({ text: b.slice(0, s) + '<br>' + b.slice(s), cursor: s + 4 }) },
  { label: '行内公式', insert: (b, s, e) => {
    const sel = b.slice(s, e) || '公式';
    const text = b.slice(0, s) + `$${sel}$` + b.slice(e);
    return { text, cursor: s + 1 + sel.length };
  } },
  { label: '独立公式', insert: (b, s, e) => {
    const sel = b.slice(s, e) || '公式';
    const text = b.slice(0, s) + `$$\n${sel}\n$$` + b.slice(e);
    return { text, cursor: s + 3 + sel.length };
  } },
];

/** 数学符号面板分组（LaTeX 片段，§ 为光标落点） */
const SYMBOL_GROUPS: { title: string; items: { label: string; insert: string }[] }[] = [
  {
    title: '希腊字母',
    items: [
      { label: 'α \\alpha', insert: '\\alpha ' },
      { label: 'β \\beta', insert: '\\beta ' },
      { label: 'γ \\gamma', insert: '\\gamma ' },
      { label: 'δ \\delta', insert: '\\delta ' },
      { label: 'ε \\epsilon', insert: '\\epsilon ' },
      { label: 'θ \\theta', insert: '\\theta ' },
      { label: 'λ \\lambda', insert: '\\lambda ' },
      { label: 'μ \\mu', insert: '\\mu ' },
      { label: 'π \\pi', insert: '\\pi ' },
      { label: 'ρ \\rho', insert: '\\rho ' },
      { label: 'σ \\sigma', insert: '\\sigma ' },
      { label: 'φ \\phi', insert: '\\phi ' },
      { label: 'ω \\omega', insert: '\\omega ' },
      { label: 'Δ \\Delta', insert: '\\Delta ' },
      { label: 'Σ \\Sigma', insert: '\\Sigma ' },
      { label: 'Ω \\Omega', insert: '\\Omega ' },
    ],
  },
  {
    title: '运算符',
    items: [
      { label: '± \\pm', insert: '\\pm ' },
      { label: '× \\times', insert: '\\times ' },
      { label: '÷ \\div', insert: '\\div ' },
      { label: '≤ \\leq', insert: '\\leq ' },
      { label: '≥ \\geq', insert: '\\geq ' },
      { label: '≠ \\neq', insert: '\\neq ' },
      { label: '≈ \\approx', insert: '\\approx ' },
      { label: '∞ \\infty', insert: '\\infty ' },
      { label: '∑ \\sum', insert: '\\sum_{§i=1}^{n} ' },
      { label: '∏ \\prod', insert: '\\prod_{§i=1}^{n} ' },
      { label: '∫ \\int', insert: '\\int_{§a}^{b} ' },
      { label: '∂ \\partial', insert: '\\partial ' },
      { label: '∇ \\nabla', insert: '\\nabla ' },
      { label: '→ \\rightarrow', insert: '\\rightarrow ' },
      { label: '∈ \\in', insert: '\\in ' },
      { label: '⊂ \\subset', insert: '\\subset ' },
      { label: '∪ \\cup', insert: '\\cup ' },
      { label: '∩ \\cap', insert: '\\cap ' },
      { label: '∀ \\forall', insert: '\\forall ' },
      { label: '∃ \\exists', insert: '\\exists ' },
    ],
  },
  {
    title: '结构',
    items: [
      { label: '分数 \\dfrac', insert: '\\dfrac{§a}{b}' },
      { label: '根号 \\sqrt', insert: '\\sqrt{§x}' },
      { label: '上标 x²', insert: 'x^{§2}' },
      { label: '下标 xₙ', insert: 'x_{§n}' },
      { label: '向量 \\vec', insert: '\\vec{§v}' },
      { label: '均值 \\overline', insert: '\\overline{§x}' },
      { label: '估计 \\hat', insert: '\\hat{§x}' },
      { label: '括号 ( )', insert: '\\left( § \\right)' },
      { label: '集合 { }', insert: '\\left\\{ § \\right\\}' },
      { label: '绝对值 | |', insert: '\\left| § \\right|' },
    ],
  },
];

export function MarkdownEditor() {
  const { form, setField } = useComposeStore();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const inputRef = React.useRef<TextInput>(null);
  const selectionRef = React.useRef({ start: 0, end: 0 });
  const [symbolsVisible, setSymbolsVisible] = useState(false);

  /** 应用插入结果：更新文本 + 恢复光标（即使输入框短暂失焦也不丢位置） */
  const applyInsert = (text: string, cursor: number) => {
    setField('bodyMarkdown', text);
    selectionRef.current = { start: cursor, end: cursor };
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (input) {
        input.setNativeProps({ selection: { start: cursor, end: cursor } });
      }
    });
  };

  const handleInsert = (action: InsertAction) => {
    const { start, end } = selectionRef.current;
    const { text, cursor } = action.insert(form.bodyMarkdown, start, end);
    applyInsert(text, cursor);
  };

  /** 插入符号片段（含 § 光标占位） */
  const insertSnippet = (snippet: string) => {
    const { start, end } = selectionRef.current;
    const caret = snippet.indexOf('§');
    const clean = snippet.replace('§', '');
    const text = form.bodyMarkdown.slice(0, start) + clean + form.bodyMarkdown.slice(end);
    applyInsert(text, start + (caret >= 0 ? caret : clean.length));
  };

  /** 脚注按钮：自动编号插入 [^n] */
  const insertFootnote = () => {
    const { start, end } = selectionRef.current;
    const body = form.bodyMarkdown;
    let maxN = 0;
    const re = /\[\^(\d+)\]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(body)) !== null) {
      maxN = Math.max(maxN, parseInt(m[1], 10));
    }
    const n = Math.max(maxN, form.footnotes.length) + 1;
    const text = body.slice(0, start) + `[^${n}]` + body.slice(end);
    applyInsert(text, start + 3 + String(n).length);
  };

  return (
    <View style={s.container}>
      <View style={s.toolbar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          // 键盘弹出时点击按钮一次即响应（不消费首次触摸），滑动不会误触（onPress 需抬起且未移动）
          keyboardShouldPersistTaps="handled"
        >
          {ACTIONS.map((a) => (
            <Pressable
              key={a.label}
              style={s.toolBtn}
              onPress={() => handleInsert(a)}
            >
              <Text style={s.toolText}>{a.label}</Text>
            </Pressable>
          ))}
          <Pressable style={[s.toolBtn, s.toolBtnFootnote]} onPress={insertFootnote}>
            <Text style={s.toolText}>脚注</Text>
          </Pressable>
          <Pressable style={[s.toolBtn, s.toolBtnSymbols]} onPress={() => setSymbolsVisible(true)}>
            <Text style={s.toolText}>数学符号</Text>
          </Pressable>
        </ScrollView>
      </View>
      <TextInput
        ref={inputRef}
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
        placeholderTextColor={colors.textLight}
        multiline
        textAlignVertical="top"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={s.counter}>{form.bodyMarkdown.length} 字</Text>

      {/* 数学符号面板 */}
      <Modal
        visible={symbolsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSymbolsVisible(false)}
      >
        <View style={s.symbolOverlay}>
          <View style={s.symbolPanel}>
            <Text style={s.symbolTitle}>数学符号</Text>
            <ScrollView style={s.symbolScroll} keyboardShouldPersistTaps="handled">
              {SYMBOL_GROUPS.map((g) => (
                <View key={g.title}>
                  <Text style={s.symbolGroupTitle}>{g.title}</Text>
                  <View style={s.symbolGrid}>
                    {g.items.map((item) => (
                      <Pressable
                        key={item.label}
                        style={s.symbolBtn}
                        onPress={() => {
                          insertSnippet(item.insert);
                          setSymbolsVisible(false);
                        }}
                      >
                        <Text style={s.symbolLabel}>{item.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
            <Pressable style={s.symbolClose} onPress={() => setSymbolsVisible(false)}>
              <Text style={s.symbolCloseText}>关闭</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
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
    toolBtnFootnote: { borderColor: COLORS.accent, backgroundColor: 'rgba(93,156,204,0.12)' },
    toolBtnSymbols: { borderColor: COLORS.accent, backgroundColor: 'rgba(93,156,204,0.12)' },
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
    symbolOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    symbolPanel: {
      backgroundColor: COLORS.bg,
      borderTopWidth: 1,
      borderColor: COLORS.border,
      maxHeight: '75%',
      padding: SPACING.md,
    },
    symbolTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.text,
      marginBottom: SPACING.sm,
    },
    symbolScroll: { flexGrow: 0 },
    symbolGroupTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.textSecondary,
      marginTop: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    symbolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
    symbolBtn: {
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: COLORS.bgSubtle,
    },
    symbolLabel: { fontSize: 12, color: COLORS.accent, fontFamily: FONT.mono },
    symbolClose: {
      marginTop: SPACING.md,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.sm + 2,
      alignItems: 'center',
      backgroundColor: COLORS.bgSubtle,
    },
    symbolCloseText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  });
