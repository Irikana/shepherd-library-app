// 文章元数据表单
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SPACING, useTheme, type Palette } from '../theme';
import { useComposeStore } from '../store/compose-store';
import { useConfigStore } from '../store/config-store';
import { DatePickerModal } from './DatePickerModal';
import { TimePickerModal } from './TimePickerModal';
import type { ArticleType } from '../types';

/** 文章性质（区别于文章分类：library/ 下每个子目录是一个分类） */
const ARTICLE_TYPES: ArticleType[] = ['录音文章', '手写文章', '信息文章', '实验性文章'];

interface MetaFormProps {
  /** 可选：新闻发布页的附加区块 */
  extra?: React.ReactNode;
  /** 恢复滚动位置（切换标签页时传入上次位置，仅首次挂载时应用） */
  scrollPosition?: number;
  /** 滚动位置变化回调（用于保存浏览进度） */
  onScroll?: (y: number) => void;
}

export function MetaForm({ extra, scrollPosition, onScroll }: MetaFormProps) {
  const { form, setField, toggleTag, setArticleType, locked } = useComposeStore();
  // 分类与标签支持用户自定义（配置同步自仓库 slywrite-config.json）
  const categories = useConfigStore((s) => s.categories);
  const allTags = useConfigStore((s) => s.tags);
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const restoredRef = useRef(false);

  // 锁定状态下只读（防误触）
  const lockedMeta = locked.meta;

  // 恢复上次浏览位置（仅首次挂载时应用一次，避免与用户滚动互相覆盖）
  const onLayout = () => {
    if (!restoredRef.current && scrollPosition && scrollPosition > 0) {
      restoredRef.current = true;
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: scrollPosition, animated: false });
      });
    }
  };

  const handleScroll = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
    onScroll?.(e.nativeEvent.contentOffset.y);
  };

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
    <ScrollView
      ref={scrollRef}
      style={s.container}
      contentContainerStyle={s.content}
      onLayout={onLayout}
      onScroll={handleScroll}
      scrollEventThrottle={64}
      keyboardShouldPersistTaps="handled"
    >
      {/* 标题（中文） */}
      <Text style={s.label}>标题 *</Text>
      <TextInput
        style={s.input}
        value={form.title}
        onChangeText={(v) => setField('title', v)}
        placeholder="文章中文标题（用于页面显示）"
        placeholderTextColor={colors.textLight}
        editable={!lockedMeta}
      />

      {/* 标题（英文，文件名） */}
      <Text style={s.label}>英文标题 *</Text>
      <TextInput
        style={s.input}
        value={form.titleEn}
        onChangeText={(v) => setField('titleEn', v)}
        placeholder="英文标题，将作为文件名（如 a-new-article）"
        placeholderTextColor={colors.textLight}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!lockedMeta}
      />
      <Text style={s.hint}>英文标题将作为文件名，兼容性更好；中文标题用于页面显示</Text>

      {/* 作者 */}
      <Text style={s.label}>作者 *</Text>
      <TextInput
        style={s.input}
        value={form.author}
        onChangeText={(v) => setField('author', v)}
        placeholder="作者名"
        placeholderTextColor={colors.textLight}
        editable={!lockedMeta}
      />

      {/* 创建日期 */}
      <Text style={s.label}>创建日期 *</Text>
      <View style={s.inputRow}>
        <View style={[s.input, s.inputFlex, s.dateDisplay]}>
          <Text style={form.createDate ? s.dateText : s.datePlaceholder}>
            {form.createDate || 'YYYY-MM-DD'}
          </Text>
        </View>
        <Pressable
          style={[s.sideBtn, lockedMeta && s.btnDisabled]}
          onPress={() => setDatePickerVisible(true)}
          disabled={lockedMeta}
        >
          <Text style={s.sideBtnText}>日历</Text>
        </Pressable>
      </View>
      <Text style={s.hint}>点击「日历」从月历中精确选日期，或点击「自定义」手动输入字符串</Text>

      {/* 文章性质 */}
      <Text style={s.label}>文章性质 *</Text>
      <View style={s.chipRow}>
        {ARTICLE_TYPES.map((t) => (
          <Pressable
            key={t}
            style={[s.chip, form.articleType === t && s.chipActive, lockedMeta && s.btnDisabled]}
            onPress={() => setArticleType(t)}
            disabled={lockedMeta}
          >
            <Text style={[s.chipText, form.articleType === t && s.chipTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.hint}>文章性质指创作方式（录音/手写/信息/实验性），与文章分类（library/ 下目录）不同</Text>

      {/* 文章分类 */}
      <Text style={s.label}>文章分类 *</Text>
      <View style={s.chipRow}>
        {categories.map((c) => {
          const active = form.category === c.key;
          return (
            <Pressable
              key={c.key}
              style={[s.chip, active && s.chipActive, lockedMeta && s.btnDisabled]}
              onPress={() => setField('category', c.key)}
              disabled={lockedMeta}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={s.hint}>上传到 library/ 下对应分类目录（普通/作品/杂物/测试文章）</Text>

      {/* 在新闻板块展示（合并文章与新闻撰写） */}
      <View style={s.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>在新闻板块展示</Text>
          <Text style={s.hint}>开启后自动添加「新闻」标签，并在发布时同步主页新闻区 / news.html / 英文主页；文章固定发布到普通文章（library/paper/）</Text>
        </View>
        <Switch
          value={form.isNews}
          onValueChange={(v) => {
            setField('isNews', v);
            const tags = [...form.tags];
            const hasNews = tags.includes('新闻');
            if (v && !hasNews) {
              // 开启：强制普通文章分类 + 补上「新闻」标签
              setField('category', 'normal');
              setField('tags', [...tags.filter((t) => t !== '无'), '新闻']);
            } else if (!v && hasNews) {
              // 关闭：移除「新闻」标签
              const next = tags.filter((t) => t !== '新闻');
              setField('tags', next.length ? next : ['无']);
            }
          }}
          trackColor={{ false: colors.border, true: colors.accent }}
          disabled={lockedMeta}
        />
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
              placeholderTextColor={colors.textLight}
              editable={!lockedMeta}
            />
            <Pressable
              style={[s.sideBtn, lockedMeta && s.btnDisabled]}
              onPress={() => setTimePickerVisible(true)}
              disabled={lockedMeta}
            >
              <Text style={s.sideBtnText}>小时钟</Text>
            </Pressable>
          </View>
          <Text style={s.hint}>点击「小时钟」在轮盘上选择时/分/秒，也可直接输入</Text>
        </>
      )}

      {/* 标签 */}
      <Text style={s.label}>标签</Text>
      <View style={s.chipRow}>
        {allTags.map((tag) => {
          const active = form.tags.includes(tag);
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
                lockedMeta && s.btnDisabled,
              ]}
              onPress={() => toggleTag(tag)}
              disabled={lockedMeta}
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
        value={form.footerNote}
        onChangeText={(v) => setField('footerNote', v)}
        placeholder="生成文章页脚的补充说明"
        placeholderTextColor={colors.textLight}
        multiline
        editable={!lockedMeta}
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
            placeholderTextColor={colors.textLight}
            multiline
            editable={!lockedMeta}
          />
          <Pressable
            style={[s.footnoteDel, lockedMeta && s.btnDisabled]}
            onPress={() => removeFootnote(i)}
            disabled={lockedMeta}
          >
            <Text style={s.footnoteDelText}>删除</Text>
          </Pressable>
        </View>
      ))}
      <Pressable
        style={[s.addBtn, lockedMeta && s.btnDisabled]}
        onPress={() => setField('footnotes', [...form.footnotes, ''])}
        disabled={lockedMeta}
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
          trackColor={{ false: colors.border, true: colors.accent }}
          disabled={lockedMeta}
        />
      </View>

      {/* 隐藏开关 */}
      <View style={s.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>隐藏文章</Text>
          <Text style={s.hint}>隐藏后不同步 library.html 与新闻等公开列表，仅可通过站内搜索（查找按钮）找到</Text>
        </View>
        <Switch
          value={form.hidden}
          onValueChange={(v) => setField('hidden', v)}
          trackColor={{ false: colors.border, true: colors.accent }}
          disabled={lockedMeta}
        />
      </View>

      {/* 附加区块（如新闻发布页的新闻选项） */}
      {extra}

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
    btnDisabled: { opacity: 0.45 },
  });
