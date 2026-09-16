// Markdown 正文编辑器（多行输入 + 快捷插入工具栏 + 数学符号面板）
// 纯受控：value / onChangeText 必填，编辑器不再回退读写任何 store——
// 撰写页与知识词条页各自绑定自己表单的 bodyMarkdown，避免正文串写（缺陷 A 的第一处根因）
// 插入交互修复：工具栏按钮用 onPressIn 立即响应（Android 输入法打开时无需先收起键盘），
// 插入后通过 setNativeProps 恢复光标位置并保持输入框焦点
// 锁定态（editable=false）：改挂 ReadOnlyText，可滑动浏览但不能编辑
// （Android 上 editable=false 的输入框连内部滚动一起失效，用户既滑不动也看不了全文）
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
import { buildSectionScaffold } from '../templates/knowledge-entry';
import { ReadOnlyText } from './ReadOnlyText';
import type { EntryType } from '../types';

// 滚动修复说明：
// TextInput multiline + flex:1 自行管理滚动（Android 嵌套 ScrollView 会导致滚动失效）
// scrollPosition / onScroll 接口保留兼容（父组件传入时不报错），但不再实际追踪

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
  '  <span class="icon">※</span>\n' +
  '  <p>§提示内容</p>\n' +
  '</div>';

/** 站点出版预设：含网站视觉组件（蓝框/灰引/红警/Callout/折叠块） */
const LIBRARY_ACTIONS: InsertAction[] = [
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

/** 词条「插入分节」：一键补齐缺失的 概述 / 详细说明 / 历史 脚手架（已填写的节不重复插入） */
const SECTION_ACTION: InsertAction = {
  label: '插入分节',
  insert: (b, s, e) => {
    const scaffold = buildSectionScaffold(b);
    if (!scaffold) {
      // 三节都已有内容：退化为插入普通 H2，交给模板按未归类节处理
      return { text: b.slice(0, s) + '## ' + b.slice(s), cursor: s + 3 };
    }
    const head = b.slice(0, e).trimEnd();
    const tail = b.slice(e);
    const joined = head ? `${head}\n\n${scaffold}` : scaffold;
    const caret = joined.indexOf('§');
    const clean = caret >= 0 ? joined.replace('§', '') : joined;
    return { text: clean + tail, cursor: caret >= 0 ? caret : clean.length };
  },
};

/** 词条预设用到的动作标签（文章预设的子集：去掉裸 H2，改由「插入分节」提供规范节标题） */
const KNOWLEDGE_LABELS = new Set([
  'H3', '加粗', '斜体', '删除线', '行内代码', '链接', '图片', '引用', '列表', '有序',
  '蓝框', '灰引', '代码块', '表格', '分割线', '换行', '行内公式', '独立公式',
]);

/** 知识词条预设：分节脚手架 + 常用排版（提示框保留，正文组件与站点视觉一致） */
const KNOWLEDGE_ACTIONS: InsertAction[] = [
  SECTION_ACTION,
  ...LIBRARY_ACTIONS.filter((a) => KNOWLEDGE_LABELS.has(a.label)),
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

export function MarkdownEditor({
  scrollPosition,
  onScroll,
  value,
  onChangeText,
  footnotes = [],
  entryType = 'article',
  editable = true,
}: {
  /** 恢复滚动位置（切换标签页时传入上次位置，仅首次挂载时应用） */
  scrollPosition?: number;
  /** 滚动位置变化回调（用于保存浏览进度） */
  onScroll?: (y: number) => void;
  /** 受控正文值（必填：编辑器不读写任何 store） */
  value: string;
  /** 受控变更回调（必填） */
  onChangeText: (text: string) => void;
  /** 脚注列表（用于「脚注」按钮自动编号；知识词条不显示脚注按钮） */
  footnotes?: string[];
  /** 条目类型：决定工具栏预设（默认文章预设；'knowledge' 用分节脚手架预设） */
  entryType?: EntryType;
  /** 是否可编辑（默认 true；锁定态由外部传入 false —— 锁定时可滑动浏览、不可编辑） */
  editable?: boolean;
}) {
  const isKnowledge = entryType === 'knowledge';
  const { colors } = useTheme();
  const s = createStyles(colors);
  const inputRef = React.useRef<TextInput>(null);
  const selectionRef = React.useRef({ start: 0, end: 0 });
  const [symbolsVisible, setSymbolsVisible] = useState(false);

  const text = value;
  const changeText = (t: string) => onChangeText(t);
  // 锁定状态由外部 editable 决定（撰写页传入 locked.body 的反值）
  const lockedBody = !editable;
  const actions = isKnowledge ? KNOWLEDGE_ACTIONS : LIBRARY_ACTIONS;
  /** 应用插入结果：更新文本 + 恢复光标（即使输入框短暂失焦也不丢位置） */
  const applyInsert = (text: string, cursor: number) => {
    changeText(text);
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
    const { text: result, cursor } = action.insert(text, start, end);
    applyInsert(result, cursor);
  };

  /** 插入符号片段（含 § 光标占位） */
  const insertSnippet = (snippet: string) => {
    const { start, end } = selectionRef.current;
    const caret = snippet.indexOf('§');
    const clean = snippet.replace('§', '');
    const next = text.slice(0, start) + clean + text.slice(end);
    applyInsert(next, start + (caret >= 0 ? caret : clean.length));
  };

  /** 脚注按钮：自动编号插入 [^n] */
  const insertFootnote = () => {
    const { start, end } = selectionRef.current;
    const body = text;
    let maxN = 0;
    const re = /\[\^(\d+)\]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(body)) !== null) {
      maxN = Math.max(maxN, parseInt(m[1], 10));
    }
    const n = Math.max(maxN, footnotes.length) + 1;
    const next = body.slice(0, start) + `[^${n}]` + body.slice(end);
    applyInsert(next, start + 3 + String(n).length);
  };

  return (
    <View style={s.container}>
      {lockedBody ? (
        /* 锁定态：整块换成只读浏览视图（可滑动、不可编辑、工具栏不可用） */
        <ReadOnlyText
          text={text}
          mono
          hint="已锁定：可上下滑动浏览，不能编辑；如需修改请先解锁"
        />
      ) : (
        <>
          <View style={s.toolbar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              // 键盘弹出时点击按钮一次即响应（不消费首次触摸），滑动不会误触（onPress 需抬起且未移动）
              keyboardShouldPersistTaps="handled"
            >
              {actions.map((a) => (
                <Pressable
                  key={a.label}
                  style={[s.toolBtn, a.label === '插入分节' && s.toolBtnSection]}
                  onPress={() => handleInsert(a)}
                >
                  <Text style={s.toolText}>{a.label}</Text>
                </Pressable>
              ))}
              {!isKnowledge && (
                <Pressable style={[s.toolBtn, s.toolBtnFootnote]} onPress={insertFootnote}>
                  <Text style={s.toolText}>脚注</Text>
                </Pressable>
              )}
              <Pressable style={[s.toolBtn, s.toolBtnSymbols]} onPress={() => setSymbolsVisible(true)}>
                <Text style={s.toolText}>数学符号</Text>
              </Pressable>
            </ScrollView>
          </View>
          {/* 正文区域：TextInput multiline 自行管理滚动（不嵌套 ScrollView） */}
          <TextInput
            ref={inputRef}
            style={s.editor}
            value={text}
            onChangeText={changeText}
            onSelectionChange={(e) => {
              selectionRef.current = {
                start: e.nativeEvent.selection.start,
                end: e.nativeEvent.selection.end,
              };
            }}
            placeholder={
              isKnowledge
                ? '在此撰写词条正文（Markdown）…\n点上方「插入分节」建立 概述 / 详细说明 / 历史 三节，再逐节填写'
                : '在此撰写正文（Markdown）…\n空行分段，可用上方工具栏插入组件'
            }
            placeholderTextColor={colors.textLight}
            multiline
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
            showSoftInputOnFocus
          />
          <Text style={s.counter}>{text.length} 字</Text>
        </>
      )}
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
    toolBtnSection: { borderColor: COLORS.accent, backgroundColor: COLORS.bgMuted },
    toolBtnSymbols: { borderColor: COLORS.accent, backgroundColor: 'rgba(93,156,204,0.12)' },
    toolBtnDisabled: { opacity: 0.35 },
    toolText: { fontSize: 13, color: COLORS.accent, fontWeight: '500' },
    scrollArea: { flex: 1 },
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
