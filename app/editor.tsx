// 文本文件编辑器：查看/编辑/保存仓库中的文本文件，支持新建文件
// 文章 HTML 文件自动检测并提供「元数据 / 正文 / 源码」三标签页编辑：
// - 元数据：表单化修改标题、作者、日期、性质、标签（增删）等，保存时仅替换元数据区段
// - 正文：撰写式体验——自动把正文区段 HTML 还原为 Markdown，用 MarkdownEditor（工具栏 + 数学符号）编辑，
//   保存时渲染回 HTML；视觉组件（蓝框/灰引/Callout/折叠块等）原样保留
// - 源码：编辑完整文件（含 head/脚本/导航等）
// 滚动：正文/源码统一使用 CodeEditor/MarkdownEditor（外层 ScrollView 唯一滚动 + 内部输入框不限制高度），
// 避免 Android 上 TextInput 内部滚动与父级手势冲突导致的"滑到底部"问题
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { putFile, getFile } from '../src/lib/github-client';
import { useEditorStore } from '../src/store/editor-store';
import { updateArticleHtml } from '../src/lib/article-parser';
import { insertIntoLibraryHtml, removeFromLibraryHtml } from '../src/lib/article-sync';
import type { ArticleCategory } from '../src/lib/article-sync';
import type { ArticleFormData } from '../src/types';
import { removeNewsItem, syncNewsSections } from '../src/lib/news-sync';
import { EditMetaForm } from '../src/components/EditMetaForm';
import { MarkdownEditor } from '../src/components/MarkdownEditor';
import { CodeEditor } from '../src/components/CodeEditor';
import { SPACING, useTheme, type Palette } from '../src/theme';

/** 新建文件时允许的根目录（安全白名单，防止写入仓库任意位置） */
const NEW_FILE_ROOTS = [
  { label: 'library/ 文章', value: 'library/' },
  { label: 'knowledge-hall/ 知识馆', value: 'knowledge-hall/' },
  { label: 'image/ 图片说明（.txt 或 .md）', value: 'image/' },
  { label: '根目录', value: '' },
];

/** 文件名非法字符（Windows/仓库路径安全） */
const INVALID_PATH_CHARS = /[\\/\u0000-\u001f<>:"|?*]|\.\./;

/** 隐藏/取消隐藏文章的公开列表同步结果 */
interface VisibilitySyncResult {
  ok: string[];
  fail: string[];
}

/**
 * 隐藏/取消隐藏文章时同步公开列表（library.html 中英文 + 新闻板块）
 * 各步骤独立 try/catch：失败不中断后续步骤，而是收集到 fail 中返回
 * 供保存流程与「重试同步」共用，保证同一份逻辑可重复执行
 */
async function syncVisibility(
  opts: {
    hidden: boolean;
    metadata: ArticleFormData;
    targetPath: string;
    fileName: string;
  },
): Promise<VisibilitySyncResult> {
  const { hidden, metadata, targetPath, fileName } = opts;
  const ok: string[] = [];
  const fail: string[] = [];

  // 从路径推断分类目录：library/paper/xxx.html → paper
  const catDir = targetPath.startsWith('library/')
    ? targetPath.slice('library/'.length).split('/').slice(0, -1).join('/')
    : '';
  if (!catDir) return { ok, fail };
  const category: ArticleCategory = { key: catDir, label: catDir, dir: catDir, anchor: '', enAnchor: '' };
  const titleEn = fileName.replace(/\.html?$/, '');
  const isNews = metadata.tags.includes('新闻');

  if (hidden) {
    // hidden ON：从 library.html 移除（中英文）
    for (const libPath of ['library/library.html', 'en/library/library.html']) {
      try {
        const { content: libContent, sha: libSha } = await getFile(libPath);
        const updated = removeFromLibraryHtml(libContent, category, fileName);
        if (updated !== libContent) {
          await putFile(libPath, updated, {
            sha: libSha,
            message: `已隐藏文章：${metadata.title}（${libPath}，移动端 App）`,
          });
          ok.push(`${libPath} 已移除文章条目`);
        } else {
          ok.push(`${libPath} 未找到文章条目（可能已移除）`);
        }
      } catch (e) {
        fail.push(`${libPath} 移除失败：${(e as Error).message}`);
      }
    }
    // 新闻文章：从新闻板块移除
    if (isNews) {
      try {
        const newsSteps = await removeNewsItem({
          title: metadata.title,
          titleEn,
          date: metadata.createDate,
          kind: 'text',
          categoryDir: catDir,
        });
        for (const s of newsSteps) {
          if (s.includes('失败')) fail.push(s);
          else ok.push(s);
        }
      } catch (e) {
        fail.push(`新闻板块移除失败：${(e as Error).message}`);
      }
    }
  } else {
    // hidden OFF：插入到 library.html（中英文）
    const displayTitle = metadata.title;
    for (const libPath of ['library/library.html', 'en/library/library.html']) {
      try {
        const { content: libContent, sha: libSha } = await getFile(libPath);
        const english = libPath.startsWith('en/');
        const updated = insertIntoLibraryHtml(libContent, category, fileName, english ? titleEn : displayTitle, english);
        if (updated !== libContent) {
          await putFile(libPath, updated, {
            sha: libSha,
            message: `已取消隐藏文章：${metadata.title}（${libPath}，移动端 App）`,
          });
          ok.push(`${libPath} 已插入文章条目`);
        } else {
          ok.push(`${libPath} 未找到分类锚点（文章条目未插入）`);
        }
      } catch (e) {
        fail.push(`${libPath} 插入失败：${(e as Error).message}`);
      }
    }
    // 新闻文章：重新插入新闻板块
    if (isNews) {
      try {
        const newsSteps = await syncNewsSections({
          title: metadata.title,
          titleEn,
          date: metadata.createDate,
          kind: 'text',
          categoryDir: catDir,
        });
        for (const s of newsSteps) {
          if (s.includes('失败')) fail.push(s);
          else ok.push(s);
        }
      } catch (e) {
        fail.push(`新闻板块同步失败：${(e as Error).message}`);
      }
    }
  }
  return { ok, fail };
}

type Tab = 'meta' | 'body' | 'source';

/** 文章文件的编辑标签页（元数据表单 / 正文区段 / 整页源码） */
const ARTICLE_TABS: { key: Tab; label: string }[] = [
  { key: 'meta', label: '元数据' },
  { key: 'body', label: '正文' },
  { key: 'source', label: '源码' },
];

export default function EditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ path?: string; name?: string }>();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const {
    path,
    name,
    content,
    originalContent,
    sha,
    isNew,
    dirty,
    isArticle,
    metadata,
    metadataDirty,
    bodyMarkdown,
    locked,
    load,
    loadNew,
    setContent,
    setBodyMarkdown,
    toggleLock,
    markSaved,
  } = useEditorStore();
  const [saving, setSaving] = useState(false);
  const [newDir, setNewDir] = useState(NEW_FILE_ROOTS[0].value);
  const [newFileName, setNewFileName] = useState('');
  const [tab, setTab] = useState<Tab>('meta');

  // 从文件浏览器进入：读取 store 中已加载的内容（browser.tsx 中先加载再跳转）
  useEffect(() => {
    const p = params.path ?? '';
    if (p && !path && !isNew) {
      // store 尚未加载（例如直接从链接进入），从仓库读取
      getFile(p)
        .then(({ content: c, sha: sh }) => load(p, c, sh, params.name ?? p.split('/').pop()))
        .catch(() => load(p, '', null, params.name ?? p.split('/').pop()));
    }
    if (!p && !isNew) {
      loadNew();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.path]);

  const handleSave = async () => {
    if (saving) return;
    let targetPath = path;
    if (isNew) {
      const fileName = newFileName.trim();
      if (!fileName) {
        Alert.alert('文件名不能为空');
        return;
      }
      if (INVALID_PATH_CHARS.test(fileName)) {
        Alert.alert('文件名不合法', '文件名不能包含 / \\ : * ? " < > | 等字符或 ..');
        return;
      }
      targetPath = newDir + fileName;
    }
    if (!targetPath) {
      Alert.alert('路径无效', '无法确定保存路径，请返回重新新建。');
      return;
    }

    // 合并元数据变更到 HTML（如果是文章且元数据有修改）
    let saveContent = content;
    let hiddenChanged = false;
    if (isArticle && metadataDirty && metadata) {
      saveContent = updateArticleHtml(content, metadata);
      // 检测 hidden 是否真的变了（对比原始内容）
      const wasHidden = originalContent.includes('data-article-hidden="true"');
      hiddenChanged = wasHidden !== metadata.hidden;
      // 同步回 store（让 markSaved 正确记录）
      setContent(saveContent);
    }

    setSaving(true);
    try {
      await putFile(targetPath, saveContent, {
        sha: isNew ? undefined : (sha ?? undefined),
        message: isNew ? `新建文件：${targetPath}（移动端 App）` : `编辑文件：${targetPath}（移动端 App）`,
      });

      // 如果是文章且 hidden 状态变化了，同步公开列表（library.html 中英文 + 新闻板块）
      // 失败步骤不再静默：收集到 fail 后通过 Alert 告知，并提供「重试同步」入口
      const syncOk: string[] = [];
      const syncFail: string[] = [];
      if (hiddenChanged && metadata && !isNew) {
        const fileName = name || targetPath.split('/').pop() || '';
        const result = await syncVisibility({
          hidden: metadata.hidden,
          metadata,
          targetPath,
          fileName,
        });
        syncOk.push(...result.ok);
        syncFail.push(...result.fail);
      }

      markSaved(targetPath, null);
      setSaving(false);
      const okHint = syncOk.length > 0 ? '\n\n' + syncOk.join('\n') : '';
      const failHint = syncFail.length > 0
        ? '\n\n以下同步未完成：\n' + syncFail.join('\n') + '\n\n可点击「重试同步」再次执行，或在网站手动调整。'
        : '';
      const extraHint = failHint || okHint || (metadataDirty && metadata
        ? '\n\n提示：如需同步公开列表（library.html），请使用发布功能重新上传。'
        : '');
      Alert.alert(
        syncFail.length > 0 ? '保存成功，但部分同步失败' : '保存成功',
        `文件：${targetPath}\n\n约 1-2 分钟后网站生效。${extraHint}`,
        syncFail.length > 0
          ? [
              { text: '完成' },
              {
                text: '重试同步',
                onPress: async () => {
                  setSaving(true);
                  try {
                    const fileName = name || targetPath.split('/').pop() || '';
                    const result = await syncVisibility({
                      hidden: metadata!.hidden,
                      metadata: metadata!,
                      targetPath,
                      fileName,
                    });
                    markSaved(targetPath, null);
                    setSaving(false);
                    const msg = result.fail.length > 0
                      ? '仍有同步失败：\n' + result.fail.join('\n')
                      : '同步完成：\n' + (result.ok.join('\n') || '（无需变更）');
                    Alert.alert(result.fail.length > 0 ? '重试未完全成功' : '同步完成', msg, [{ text: '完成' }]);
                  } catch (err) {
                    setSaving(false);
                    Alert.alert('重试失败', (err as Error).message, [{ text: '完成' }]);
                  }
                },
              },
            ]
          : [{ text: '完成' }],
      );
    } catch (err) {
      setSaving(false);
      Alert.alert('保存失败', (err as Error).message);
    }
  };

  const handleBack = () => {
    if (dirty || metadataDirty) {
      Alert.alert('放弃修改？', '当前文件有未保存的修改，返回将丢失。', [
        { text: '继续编辑', style: 'cancel' },
        { text: '放弃', style: 'destructive', onPress: () => router.back() },
      ]);
      return;
    }
    router.back();
  };

  /** 切换当前标签页的锁定状态（防误触） */
  const handleToggleLock = () => {
    toggleLock(tab);
  };

  /** 切换标签页：收起键盘 */
  const switchTab = (next: Tab) => {
    if (next === tab) return;
    Keyboard.dismiss();
    setTab(next);
  };

  const hasChanges = dirty || metadataDirty || isNew;

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 文件信息栏 */}
      <View style={s.infoBar}>
        <Text style={s.pathText} numberOfLines={1}>
          {isNew ? '新建文件' : name || path}
        </Text>
        <Text style={s.statusText}>
          {isNew ? '新建模式' : dirty || metadataDirty ? '已修改' : '已保存'}
        </Text>
      </View>

      {/* 文章元数据/正文/源码切换标签 + 锁定开关 */}
      {isArticle && !isNew && (
        <View style={s.tabs}>
          {ARTICLE_TABS.map((t) => (
            <Pressable
              key={t.key}
              style={[s.tab, tab === t.key && s.tabActive]}
              onPress={() => switchTab(t.key)}
            >
              <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
            </Pressable>
          ))}
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
      )}
      {(isArticle && !isNew) && (
        <Text style={s.lockHint}>
          锁定后当前页只读，切换查看不会误触；{locked.meta || locked.body || locked.source ? '已锁定' : '未锁定'}
        </Text>
      )}

      {/* 新建文件：选择目录 + 文件名 */}
      {isNew && (
        <View style={s.newBox}>
          <Text style={s.label}>保存位置</Text>
          <View style={s.chipRow}>
            {NEW_FILE_ROOTS.map((r) => (
              <Pressable
                key={r.value}
                style={[s.chip, newDir === r.value && s.chipActive]}
                onPress={() => setNewDir(r.value)}
              >
                <Text style={[s.chipText, newDir === r.value && s.chipTextActive]}>{r.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.label}>文件名（含扩展名）</Text>
          <TextInput
            style={s.input}
            value={newFileName}
            onChangeText={setNewFileName}
            placeholder="如 a-new-page.html / note.txt"
            placeholderTextColor={colors.textLight}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      )}

      {/* 编辑器主体：文章 → 元数据/正文/源码；普通文件 → 源码 */}
      {isArticle && !isNew && tab === 'meta' ? (
        <View style={s.editorArea}>
          <EditMetaForm />
        </View>
      ) : isArticle && !isNew && tab === 'body' ? (
        <View style={s.editorArea}>
          <View style={s.bodyHint}>
            <Text style={s.bodyHintText}>
              Markdown 正文编辑：与撰写页一致，可插入视觉组件（蓝框/灰引/红警/Callout/折叠块）、数学公式与脚注
            </Text>
          </View>
          {bodyMarkdown === null ? (
            <View style={s.center}>
              <Text style={s.hint}>未能自动还原正文为 Markdown，请改用「源码」标签页编辑</Text>
            </View>
          ) : (
            <MarkdownEditor
              value={bodyMarkdown}
              onChangeText={setBodyMarkdown}
              footnotes={metadata?.footnotes ?? []}
              editable={!locked.body}
            />
          )}
        </View>
      ) : (
        <CodeEditor
          value={content}
          onChangeText={setContent}
          placeholder="在此编辑文件内容…"
          autoFocus={isNew}
          editable={!locked.source}
        />
      )}

      {/* 底部操作 */}
      <View style={s.footer}>
        <Pressable style={s.backBtn} onPress={handleBack}>
          <Text style={s.backText}>返回</Text>
        </Pressable>
        <Pressable
          style={[s.saveBtn, (saving || !hasChanges) && s.btnDisabled]}
          onPress={handleSave}
          disabled={saving || !hasChanges}
        >
          <Text style={s.saveBtnText}>{saving ? '保存中…' : isNew ? '创建文件' : '保存'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    infoBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SPACING.md,
      borderBottomWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.bgSubtle,
    },
    pathText: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text, marginRight: SPACING.sm },
    statusText: { fontSize: 12, color: COLORS.textLight },
    tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border },
    tab: {
      flex: 1,
      paddingVertical: SPACING.sm + 2,
      alignItems: 'center',
      backgroundColor: COLORS.bgSubtle,
    },
    tabActive: {
      backgroundColor: COLORS.bg,
      borderBottomWidth: 2,
      borderBottomColor: COLORS.accent,
    },
    tabText: { fontSize: 15, color: COLORS.textSecondary },
    tabTextActive: { color: COLORS.accent, fontWeight: '600' },
    lockBtn: {
      paddingHorizontal: SPACING.md,
      justifyContent: 'center',
      alignItems: 'center',
      borderLeftWidth: 1,
      borderLeftColor: COLORS.border,
      backgroundColor: COLORS.bgSubtle,
    },
    lockBtnOn: { backgroundColor: COLORS.accent },
    lockText: { fontSize: 13, color: COLORS.textSecondary },
    lockTextOn: { color: '#fff', fontWeight: '600' },
    lockHint: {
      fontSize: 11,
      color: COLORS.textLight,
      paddingHorizontal: SPACING.md,
      paddingVertical: 4,
      backgroundColor: COLORS.bgMuted,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    newBox: {
      padding: SPACING.md,
      borderBottomWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.bgSubtle,
    },
    label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginTop: SPACING.sm, marginBottom: SPACING.xs },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
    chip: {
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: COLORS.bg,
    },
    chipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
    chipText: { fontSize: 12, color: COLORS.textSecondary },
    chipTextActive: { color: '#fff', fontWeight: '600' },
    input: {
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.sm,
      fontSize: 14,
      color: COLORS.text,
      backgroundColor: COLORS.bg,
    },
    editorArea: { flex: 1 },
    bodyHint: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      backgroundColor: COLORS.bgMuted,
      borderBottomWidth: 1,
      borderColor: COLORS.border,
    },
    bodyHintText: { fontSize: 12, color: COLORS.textLight, lineHeight: 17 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
    hint: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', lineHeight: 19 },
    footer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      borderTopWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      backgroundColor: COLORS.bg,
    },
    backBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      alignItems: 'center',
    },
    backText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '500' },
    saveBtn: {
      flex: 2,
      backgroundColor: COLORS.accent,
      padding: SPACING.md,
      alignItems: 'center',
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    btnDisabled: { opacity: 0.5 },
  });
