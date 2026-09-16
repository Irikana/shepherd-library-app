// 统一撰写页（文章 / 新闻 / 知识词条）：元数据表单 + Markdown 编辑器（分段切换）+ 草稿自动保存 + 分页锁定
// 0.0.7：新闻不再是独立入口——「在新闻板块展示」成为元数据选项，开启后可选文字/海报形态与海报图
// 词条统一：知识词条不再有自己的撰写页与表单，同由本页承载，差异只体现在 form.entryType 上
//   - 标题栏文案、元数据区块（MetaForm）、工具栏预设与分节状态（MarkdownEditor）、校验、预览生成分支都按 entryType 走
//   - /compose/knowledge 路由保留为兼容入口，直接渲染本页组件并固定 entryType='knowledge'
// 「新建 / 继续编辑」的边界（见 compose-store 顶部注释）：
//   新建由首页入口动作（startNewArticle / startNewKnowledge）决定；草稿箱条目的 loadDraft 是唯一的「继续编辑」入口；
//   本页卸载（返回退出撰写流程）时把最新表单落盘为草稿并 endSession()，会话 draftId 因此不会被下一次进入沿用；
//   从预览页 router.back() 回到本页不触发卸载（页面仍在栈里），draftId 与表单原样保留。
import React, { useEffect } from 'react';
import { Alert, Image, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MetaForm } from '../../src/components/MetaForm';
import { MarkdownEditor } from '../../src/components/MarkdownEditor';
import { useComposeStore } from '../../src/store/compose-store';
import { useConfigStore } from '../../src/store/config-store';
import { useDraftsStore, articleFormEdited, draftKindOf } from '../../src/store/drafts-store';
import { generateArticleHtml } from '../../src/templates/article';
import {
  analyzeKnowledgeSections,
  generateKnowledgeEntryHtml,
  KNOWLEDGE_SECTIONS,
  parseRelatedEntries,
} from '../../src/templates/knowledge-entry';
import { validateArticleHtml } from '../../src/templates/validators';
import { SPACING, useTheme, type Palette } from '../../src/theme';
import type { ArticleFormData, EntryType } from '../../src/types';

type Tab = 'meta' | 'body';

/** 文件名字符非法（仓库路径安全） */
const INVALID_PATH_CHARS = /[\\/\u0000-\u001f<>:"|?*]|\.\./;

/** 把当前会话表单落盘为草稿（真正编辑过才进草稿箱，全部撤销回默认值则清掉该草稿） */
function persistDraft(form: ArticleFormData, draftId: string | null): void {
  if (!draftId) return;
  const drafts = useDraftsStore.getState();
  if (articleFormEdited(form)) {
    void drafts.upsert({
      id: draftId,
      title: form.title.trim() || (form.entryType === 'knowledge' ? '未命名词条' : '未命名'),
      updatedAt: Date.now(),
      form,
      kind: draftKindOf(form),
    });
  } else {
    void drafts.remove(draftId);
  }
}

/** 词条发布前的分节要求：缺哪一节就明确说哪一节（与分析状态条共用同一份判断） */
function knowledgeSectionIssues(form: ArticleFormData): string[] {
  return analyzeKnowledgeSections(form.bodyMarkdown).map((st) => {
    if (!st.present) return `缺少「${st.def.title}」节：请在正文写一行「## ${st.def.title}」`;
    if (!st.filled) return `「${st.def.title}」节还是空的：${st.def.hint}`;
    return '';
  }).filter(Boolean);
}

/** 「关联词条」里写了却没被识别的行：逐行单独解析，解析不出条目（缺标题或缺路径、外链、页内锚点）的行即非法行 */
function unparsedRelatedLines(text: string): string[] {
  return (text || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && parseRelatedEntries(l).length === 0);
}

/** 新闻专属选项：新闻形态 + 海报图片（仅在「在新闻板块展示」开启时显示） */
function NewsOptions() {
  const { colors } = useTheme();
  const s = createStyles(colors);
  const newsKind = useComposeStore((st) => st.newsKind);
  const posterUri = useComposeStore((st) => st.posterUri);
  const setNewsKind = useComposeStore((st) => st.setNewsKind);
  const setPoster = useComposeStore((st) => st.setPoster);

  /** 选择海报：原图直接读取 base64，不压缩 */
  const pickPoster = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        base64: true,
      });
      if (res.canceled || !res.assets?.length) {
        return; // 用户取消，不算失败
      }
      const asset = res.assets[0];
      if (!asset.base64) {
        Alert.alert('选图失败', '未能读取所选图片的数据，请换一张图片重试。');
        return;
      }
      setPoster(asset.uri, asset.base64);
    } catch (err) {
      Alert.alert('选图失败', `无法读取所选图片，请重试。\n\n${(err as Error).message}`);
    }
  };

  return (
    <>
      <Text style={s.label}>新闻形态</Text>
      <View style={s.chipRow}>
        <Pressable style={[s.chip, newsKind === 'text' && s.chipActive]} onPress={() => setNewsKind('text')}>
          <Text style={[s.chipText, newsKind === 'text' && s.chipTextActive]}>文字新闻</Text>
        </Pressable>
        <Pressable style={[s.chip, newsKind === 'poster' && s.chipActive]} onPress={() => setNewsKind('poster')}>
          <Text style={[s.chipText, newsKind === 'poster' && s.chipTextActive]}>海报新闻</Text>
        </Pressable>
      </View>

      {newsKind === 'poster' && (
        <>
          <Text style={s.label}>海报图片</Text>
          {posterUri && (
            <Image source={{ uri: posterUri }} style={s.posterPreview} resizeMode="contain" />
          )}
          <Pressable style={s.pickBtn} onPress={pickPoster}>
            <Text style={s.pickBtnText}>{posterUri ? '重新选择海报' : '选择海报图片'}</Text>
          </Pressable>
          <Text style={s.hint}>原图上传到 image/poster/，不压缩；建议使用宽 800px 以上的图片</Text>
        </>
      )}
    </>
  );
}

/** 词条分节状态条：让用户在发布前看清哪一节已填写、哪一节还空着 */
function SectionStatus({ bodyMarkdown }: { bodyMarkdown: string }) {
  const { colors } = useTheme();
  const s = createStyles(colors);
  const states = analyzeKnowledgeSections(bodyMarkdown);
  return (
    <View style={s.sectionBar}>
      <View style={s.sectionBarHeader}>
        <Text style={s.sectionBarTitle}>分节状态</Text>
        <Text style={s.sectionBarHint}>
          词条页按「{SECTION_TITLES}」三节生成，三节都要有内容才能发布
        </Text>
      </View>
      {states.map((st) => {
        const label = st.filled ? '已填写' : st.present ? '有标题，无内容' : '缺这一节';
        const style = st.filled ? s.sectionOk : st.present ? s.sectionWarn : s.sectionMissing;
        return (
          <View key={st.def.key} style={s.sectionRow}>
            <Text style={s.sectionName}>{st.def.title}</Text>
            <Text style={[s.sectionState, style]}>{label}</Text>
            <Text style={s.sectionTip}>{st.def.hint}</Text>
          </View>
        );
      })}
    </View>
  );
}

/** 三节标题（状态条提示文案用） */
const SECTION_TITLES = KNOWLEDGE_SECTIONS.map((sec) => sec.title).join(' / ');

/**
 * 统一撰写页组件。
 * @param entryType 路由强制的条目类型（兼容入口 /compose/knowledge 传 'knowledge'）；
 *                  不传则由首页入口动作 / 草稿恢复决定的会话类型说了算
 */
export function ComposeScreen({ entryType }: { entryType?: EntryType }) {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [tab, setTab] = React.useState<Tab>('meta');
  const { form, locked, scrollPositions, setGeneratedHtml, setField, toggleLock, setScrollPosition } =
    useComposeStore();
  const categories = useConfigStore((s) => s.categories);
  const s = createStyles(colors);
  const isKnowledge = form.entryType === 'knowledge';

  // 标题栏与页签文案按条目类型分支
  useEffect(() => {
    navigation.setOptions({ title: isKnowledge ? '撰写知识词条' : '撰写文章' });
  }, [navigation, isKnowledge]);

  // 会话归属：入口动作已决定类型与 draftId；这里只处理两种兜底
  // 1) 路由要求的类型和当前会话不一致（例如直接进 /compose/knowledge）→ 按要求重新开局（旧会话已落盘为草稿）
  // 2) 没有草稿上下文（draftId 为 null）→ 按当前类型现开一个会话，否则编辑内容无处保存
  useEffect(() => {
    const st = useComposeStore.getState();
    const type = entryType ?? st.form.entryType;
    if (st.form.entryType !== type) {
      if (type === 'knowledge') st.startNewKnowledge();
      else st.startNewArticle();
      return;
    }
    if (!st.draftId) {
      if (type === 'knowledge') st.startNewKnowledge();
      else st.startNewArticle();
    }
  }, [entryType]);

  // 自动保存草稿（防抖）：只有真正编辑过才计入草稿箱，全部撤销回默认值则清掉该草稿
  const draftId = useComposeStore((st) => st.draftId);
  useEffect(() => {
    if (!draftId) return;
    const t = setTimeout(() => persistDraft(form, draftId), 600);
    return () => clearTimeout(t);
  }, [form, draftId]);

  // 退出撰写页（组件卸载）：把最后一次编辑落盘，并结束会话——
  // 这样「返回后再点入口」得到的一定是新草稿，不会出现「看似新稿实则续写旧草稿」
  useEffect(
    () => () => {
      const st = useComposeStore.getState();
      persistDraft(st.form, st.draftId);
      st.endSession();
    },
    [],
  );

  /** 切换标签页：保留浏览进度，切换时收起键盘 */
  const switchTab = (next: Tab) => {
    if (next === tab) return;
    Keyboard.dismiss();
    setTab(next);
  };

  /** 切换当前标签页的锁定状态 */
  const handleToggleLock = () => {
    toggleLock(tab);
  };

  const handlePreview = () => {
    const title = form.title.trim();
    const titleEn = form.titleEn.trim();
    if (!title) {
      Alert.alert(isKnowledge ? '词条标题不能为空' : '标题不能为空');
      return;
    }
    if (!titleEn) {
      Alert.alert(
        '英文标题不能为空',
        isKnowledge ? '英文标题将作为词条页文件名（如 inverse-method）。' : '英文标题将作为文件名，用于更好的路径兼容性。',
      );
      return;
    }
    if (INVALID_PATH_CHARS.test(titleEn)) {
      Alert.alert('英文标题不合法', '英文标题将作为文件名，不能包含 / \\ : * ? " < > | 等字符或 ..');
      return;
    }
    if (!form.bodyMarkdown.trim()) {
      Alert.alert(
        '正文不能为空',
        isKnowledge ? '请先用正文工具栏的「插入分节」写出概述 / 详细说明 / 历史，再逐节填写。' : '请先撰写正文。',
      );
      return;
    }

    if (isKnowledge) {
      // 词条：分节要求与实际生成逻辑一致，缺哪一节提示哪一节
      const issues = knowledgeSectionIssues(form);
      if (issues.length) {
        Alert.alert('词条分节不完整', `${issues.join('\n')}\n\n可用正文工具栏的「插入分节」一键补齐缺失的节标题。`);
        return;
      }
      const html = generateKnowledgeEntryHtml(form);
      // 关联词条写了但整行都没被识别：进预览前提醒一次，不阻断发布（可继续预览）
      const skipped = unparsedRelatedLines(form.relatedEntries);
      if (skipped.length) {
        Alert.alert(
          '关联词条有未识别的行',
          `以下 ${skipped.length} 行未被识别（缺少标题或站内路径，或是站外链接 / 页内锚点），已跳过：\n` +
            `${skipped.map((l, i) => `${i + 1}. ${l}`).join('\n')}\n\n` +
            `每行格式：标题|站内相对路径.html|关系说明（可选）\n\n仍要生成预览吗？`,
          [
            { text: '返回修改', style: 'cancel' },
            { text: '继续预览', onPress: () => goPreview(html) },
          ],
        );
        return;
      }
      goPreview(html);
      return;
    }

    if (form.isNews && useComposeStore.getState().newsKind === 'poster' && !useComposeStore.getState().posterBase64) {
      Alert.alert('请选择海报图片', '海报新闻需要一张海报图片。');
      return;
    }
    // 按所选分类目录生成（深层目录会自动调整相对路径前缀）
    const category = categories.find((c) => c.key === form.category) ?? categories[0];
    const html = generateArticleHtml(form, category.dir, useConfigStore.getState().tagColors);
    // 存起来的是「要上传到仓库的规范 HTML」；网站样式只在预览渲染时套上（见 preview.tsx），
    // 否则上传的页面会带着一整份内联 style.css，站点换主题/配色时页面不会跟随
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

  const lockedText = locked.meta || locked.body ? '已锁定' : '未锁定';

  return (
    <View style={s.container}>
      {/* 分段切换 + 锁定开关 */}
      <View style={s.tabs}>
        <Pressable
          style={[s.tab, tab === 'meta' && s.tabActive]}
          onPress={() => switchTab('meta')}
        >
          <Text style={[s.tabText, tab === 'meta' && s.tabTextActive]}>
            {isKnowledge ? '词条信息' : '元数据'}
          </Text>
        </Pressable>
        <Pressable
          style={[s.tab, tab === 'body' && s.tabActive]}
          onPress={() => switchTab('body')}
        >
          <Text style={[s.tabText, tab === 'body' && s.tabTextActive]}>正文</Text>
        </Pressable>
        <Pressable
          style={[s.lockBtn, locked[tab] && s.lockBtnOn]}
          onPress={handleToggleLock}
          accessibilityLabel={locked[tab] ? '解锁当前页' : '锁定当前页'}
        >
          <Text style={[s.lockText, locked[tab] && s.lockTextOn]}>
            {locked[tab] ? '已锁定' : '锁定'}
          </Text>
        </Pressable>
      </View>
      <Text style={s.lockHint}>
        锁定后当前页只读，切换查看不会误触；{lockedText}
      </Text>

      {/* 内容：两个标签页始终保持挂载，切换保留滚动位置 */}
      <View style={s.content}>
        <View style={[s.page, tab !== 'meta' && s.pageHidden]}>
          <MetaForm
            scrollPosition={scrollPositions.meta}
            onScroll={(y) => setScrollPosition('meta', y)}
            extra={!isKnowledge && form.isNews ? <NewsOptions /> : undefined}
          />
        </View>
        <View style={[s.page, tab !== 'body' && s.pageHidden]}>
          {isKnowledge && <SectionStatus bodyMarkdown={form.bodyMarkdown} />}
          <View style={s.editorArea}>
            <MarkdownEditor
              value={form.bodyMarkdown}
              onChangeText={(t) => setField('bodyMarkdown', t)}
              footnotes={form.footnotes}
              entryType={form.entryType}
              editable={!locked.body}
              scrollPosition={scrollPositions.body}
              onScroll={(y) => setScrollPosition('body', y)}
            />
          </View>
        </View>
      </View>

      {/* 底部预览按钮 */}
      <View style={s.footer}>
        <Pressable style={s.previewBtn} onPress={handlePreview}>
          <Text style={s.previewBtnText}>{isKnowledge ? '生成词条预览' : '生成预览'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** 统一撰写路由：/compose/article（首页入口已把会话设为对应类型），query 里带 entryType 时强制该类型 */
export default function ComposeArticleRoute() {
  const params = useLocalSearchParams<{ entryType?: string }>();
  const forced: EntryType | undefined =
    params.entryType === 'knowledge' ? 'knowledge' : params.entryType === 'article' ? 'article' : undefined;
  return <ComposeScreen entryType={forced} />;
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border },
    tab: { flex: 1, paddingVertical: SPACING.sm + 2, alignItems: 'center', backgroundColor: COLORS.bgSubtle },
    tabActive: { backgroundColor: COLORS.bg, borderBottomWidth: 2, borderBottomColor: COLORS.accent },
    tabText: { fontSize: 15, color: COLORS.textSecondary },
    tabTextActive: { color: COLORS.accent, fontWeight: '600' },
    lockBtn: {
      borderLeftWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: SPACING.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.bgSubtle,
    },
    lockBtnOn: { backgroundColor: COLORS.accent },
    lockText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
    lockTextOn: { color: '#fff', fontWeight: '600' },
    lockHint: {
      fontSize: 11,
      color: COLORS.textLight,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      backgroundColor: COLORS.bgSubtle,
      borderBottomWidth: 1,
      borderColor: COLORS.border,
    },
    content: { flex: 1 },
    page: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.bg },
    pageHidden: { display: 'none' },
    editorArea: { flex: 1 },
    sectionBar: {
      borderBottomWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.bgSubtle,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
    sectionBarHeader: { marginBottom: SPACING.xs },
    sectionBarTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
    sectionBarHint: { fontSize: 11, color: COLORS.textLight, marginTop: 2, lineHeight: 16 },
    sectionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
    sectionName: { width: 72, fontSize: 13, color: COLORS.text, fontWeight: '600' },
    sectionState: { width: 96, fontSize: 12, fontWeight: '600' },
    sectionOk: { color: COLORS.success },
    sectionWarn: { color: COLORS.warning },
    sectionMissing: { color: COLORS.danger },
    sectionTip: { flex: 1, fontSize: 11, color: COLORS.textLight },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.textSecondary,
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
    },
    hint: { fontSize: 12, color: COLORS.textLight, marginTop: 4, lineHeight: 17 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
    chip: {
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: 6,
      paddingHorizontal: 14,
      backgroundColor: COLORS.bg,
    },
    chipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
    chipText: { fontSize: 13, color: COLORS.textSecondary },
    chipTextActive: { color: '#fff', fontWeight: '600' },
    posterPreview: {
      width: '100%',
      height: 140,
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.bgSubtle,
      marginBottom: SPACING.xs,
    },
    pickBtn: {
      borderWidth: 1,
      borderColor: COLORS.accent,
      padding: SPACING.sm + 2,
      alignItems: 'center',
      backgroundColor: COLORS.bgSubtle,
    },
    pickBtnText: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
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
    btnDisabled: { opacity: 0.5 },
  });
