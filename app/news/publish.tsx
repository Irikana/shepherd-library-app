// 新闻发布页：完整元数据表单（性质/标签/脚注等）+ 正文分段编辑 + 可选海报 + 分页锁定
// 发布时自动同步：文章页 / index.html 新闻区 / news.html / en/index.html / library.html / en/library/library.html
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MetaForm } from '../../src/components/MetaForm';
import { MarkdownEditor } from '../../src/components/MarkdownEditor';
import { HtmlPreview } from '../../src/components/HtmlPreview';
import { useComposeStore } from '../../src/store/compose-store';
import { useDraftsStore } from '../../src/store/drafts-store';
import { getFile, putFile } from '../../src/lib/github-client';
import { generateArticleHtml } from '../../src/templates/article';
import { validateArticleHtml } from '../../src/templates/validators';
import { buildPreviewHtml, getSiteCss } from '../../src/lib/site-style';
import { insertTextCard, replacePosterAndDemote } from '../../src/templates/news-card';
import { insertNewsListItem } from '../../src/templates/news-list-item';
import { insertIntoLibraryHtml, ARTICLE_CATEGORIES, insertSearchEntry, buildSearchKeywords } from '../../src/lib/article-sync';
import { SPACING, useTheme, type Palette } from '../../src/theme';

type NewsKind = 'text' | 'poster';
type Tab = 'meta' | 'body';

/** 新闻专属选项：新闻形态 + 海报图片（原图上传，不压缩） */
function NewsOptions({
  kind,
  setKind,
  posterUri,
  onPickPoster,
}: {
  kind: NewsKind;
  setKind: (k: NewsKind) => void;
  posterUri: string | null;
  onPickPoster: () => void;
}) {
  const { colors } = useTheme();
  const s = createStyles(colors);
  return (
    <>
      <Text style={s.label}>新闻形态</Text>
      <View style={s.chipRow}>
        <Pressable style={[s.chip, kind === 'text' && s.chipActive]} onPress={() => setKind('text')}>
          <Text style={[s.chipText, kind === 'text' && s.chipTextActive]}>文字新闻</Text>
        </Pressable>
        <Pressable style={[s.chip, kind === 'poster' && s.chipActive]} onPress={() => setKind('poster')}>
          <Text style={[s.chipText, kind === 'poster' && s.chipTextActive]}>海报新闻</Text>
        </Pressable>
      </View>

      {kind === 'poster' && (
        <>
          <Text style={s.label}>海报图片</Text>
          {posterUri && (
            <Image source={{ uri: posterUri }} style={s.posterPreview} resizeMode="contain" />
          )}
          <Pressable style={s.pickBtn} onPress={onPickPoster}>
            <Text style={s.pickBtnText}>{posterUri ? '重新选择海报' : '选择海报图片'}</Text>
          </Pressable>
          <Text style={s.hint}>原图上传到 image/poster/，不压缩；建议使用宽 800px 以上的图片</Text>
        </>
      )}
    </>
  );
}

export default function NewsPublishScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const { form, setField, draftId, startDraftWithKind, locked, scrollPositions, toggleLock, setScrollPosition } =
    useComposeStore();
  const [tab, setTab] = useState<Tab>('meta');
  const [publishing, setPublishing] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [kind, setKind] = useState<NewsKind>('text');
  const [posterUri, setPosterUri] = useState<string | null>(null);
  const [posterBase64, setPosterBase64] = useState<string | null>(null);

  // 无草稿上下文时生成新草稿（自动保存，标记为新闻类型）
  useEffect(() => {
    if (!draftId) startDraftWithKind('news');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 自动保存草稿（防抖，记录新闻类型以便从草稿箱恢复时回到本页）
  useEffect(() => {
    if (!draftId) return;
    const t = setTimeout(() => {
      useDraftsStore.getState().upsert({
        id: draftId,
        title: `[新闻] ${form.title.trim() || '未命名'}`,
        updatedAt: Date.now(),
        form,
        kind: 'news',
      });
    }, 600);
    return () => clearTimeout(t);
  }, [form, draftId]);

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
      setPosterUri(asset.uri);
      setPosterBase64(asset.base64);
    } catch (err) {
      Alert.alert('选图失败', `无法读取所选图片，请重试。\n\n${(err as Error).message}`);
    }
  };

  /** 生成并预览新闻正文（与文章一致的预览能力） */
  const handlePreview = async () => {
    if (!form.title.trim() || !form.titleEn.trim()) {
      Alert.alert('请先填写标题', '中文标题与英文标题都需要填写。');
      return;
    }
    if (!form.bodyMarkdown.trim()) {
      Alert.alert('正文不能为空');
      return;
    }
    setPreparing(true);
    try {
      const html = generateArticleHtml(form);
      const css = await getSiteCss();
      setPreviewHtml(buildPreviewHtml(html, css));
      setPreviewVisible(true);
    } catch {
      Alert.alert('预览失败', '无法生成本文预览，请重试。');
    } finally {
      setPreparing(false);
    }
  };

  const handlePublish = async () => {
    const title = form.title.trim();
    const titleEn = form.titleEn.trim();
    if (!title) {
      Alert.alert('标题不能为空');
      return;
    }
    if (!titleEn) {
      Alert.alert('英文标题不能为空', '英文标题将作为文件名。');
      return;
    }
    if (/[\\/\u0000-\u001f<>:"|?*]|\.\./.test(titleEn)) {
      Alert.alert('英文标题不合法', '英文标题将作为文件名，不能包含 / \\ : * ? " < > | 等字符或 ..');
      return;
    }
    if (!form.bodyMarkdown.trim()) {
      Alert.alert('正文不能为空');
      return;
    }
    if (kind === 'poster' && !posterBase64) {
      Alert.alert('请选择海报图片', '海报新闻需要一张海报图片。');
      return;
    }

    const html = generateArticleHtml(form);
    const result = validateArticleHtml(html);
    if (!result.valid) {
      Alert.alert('HTML 校验未通过', `缺少必需项：\n${result.missing.join('\n')}`);
      return;
    }

    const articlePath = `library/paper/${titleEn}.html`;
    const posterPath = `image/poster/${titleEn}.png`;

    Alert.alert(
      '确认发布',
      `将执行以下操作：\n` +
        `${kind === 'poster' ? `1. 上传海报 ${posterPath}\n` : ''}` +
        `2. 上传文章 ${articlePath}\n` +
        `3. 更新主页新闻区 index.html\n` +
        `4. 更新 news.html\n` +
        `5. 更新英文主页 en/index.html\n` +
        `6. 同步 library.html（中文与英文版）普通文章列表`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '发布',
          onPress: async () => {
            setPublishing(true);
            const steps: string[] = [];
            try {
              if (kind === 'poster' && posterBase64) {
                await putFile(posterPath, posterBase64, {
                  message: `新闻海报：${title}（移动端 App）`,
                  contentIsBase64: true,
                });
                steps.push(`海报已上传：${posterPath}`);
              }

              await putFile(articlePath, html, { message: `发布新闻：${title}（移动端 App）` });
              steps.push(`文章已上传：${articlePath}`);

              // 站内搜索数据同步（隐藏新闻也加入，仅能通过查找按钮找到）
              try {
                const { content: jsContent, sha: jsSha } = await getFile('js/library-dynamic.js');
                const jsUpdated = insertSearchEntry(jsContent, {
                  title,
                  keywords: buildSearchKeywords(form),
                  urlPath: `library/paper/${titleEn}.html`,
                });
                if (jsUpdated !== jsContent) {
                  await putFile('js/library-dynamic.js', jsUpdated, { sha: jsSha, message: `站内搜索数据同步：${title}（移动端 App）` });
                  steps.push('站内搜索数据已同步');
                }
              } catch {
                steps.push('站内搜索数据同步失败（可手动添加）');
              }

              // 隐藏新闻：跳过所有公开列表同步
              if (form.hidden) {
                steps.push('（隐藏新闻：未同步新闻区与文章列表）');
              } else {
                // 主页新闻区
                try {
                const { content: indexHtml, sha } = await getFile('index.html');
                const card = {
                  title,
                  date: form.createDate,
                  href: `./library/paper/${titleEn}.html`,
                };
                const updated = kind === 'poster'
                  ? replacePosterAndDemote(indexHtml, {
                      ...card,
                      posterSrc: `./image/poster/${titleEn}.png`,
                      alt: title,
                    })
                  : insertTextCard(indexHtml, card);
                if (updated !== indexHtml) {
                  await putFile('index.html', updated, { sha, message: `新闻同步：${title}（移动端 App）` });
                  steps.push('index.html 新闻区已更新');
                }
              } catch {
                steps.push('index.html 更新失败（可手动添加）');
              }

              // news.html
              try {
                const { content: newsHtml, sha } = await getFile('news.html');
                const updated = insertNewsListItem(newsHtml, {
                  title,
                  date: form.createDate,
                  href: `./library/paper/${titleEn}.html`,
                });
                if (updated !== newsHtml) {
                  await putFile('news.html', updated, { sha, message: `新闻同步：${title}（移动端 App）` });
                  steps.push('news.html 已更新');
                }
              } catch {
                steps.push('news.html 更新失败（可手动添加）');
              }

              // 英文主页（卡片标题用英文标题）
              try {
                const { content: enHtml, sha } = await getFile('en/index.html');
                const enCard = {
                  title: titleEn,
                  date: form.createDate,
                  href: `../library/paper/${titleEn}.html`,
                };
                const updated = kind === 'poster'
                  ? replacePosterAndDemote(enHtml, {
                      ...enCard,
                      posterSrc: `../image/poster/${titleEn}.png`,
                      alt: titleEn,
                    })
                  : insertTextCard(enHtml, enCard);
                if (updated !== enHtml) {
                  await putFile('en/index.html', updated, { sha, message: `News sync: ${titleEn} (mobile app)` });
                  steps.push('en/index.html 已更新');
                }
              } catch {
                steps.push('en/index.html 更新失败（可手动添加）');
              }

              // library.html 普通文章列表（中文版）
              try {
                const { content: libHtml, sha } = await getFile('library/library.html');
                const updated = insertIntoLibraryHtml(
                  libHtml,
                  ARTICLE_CATEGORIES.find((c) => c.key === 'normal')!,
                  `${titleEn}.html`,
                  title,
                );
                if (updated !== libHtml) {
                  await putFile('library/library.html', updated, { sha, message: `文章列表同步：${title}（移动端 App）` });
                  steps.push('library.html 已同步');
                }
              } catch {
                steps.push('library.html 同步失败（可手动添加）');
              }

              // library.html 普通文章列表（英文版）
              try {
                const { content: enLibHtml, sha } = await getFile('en/library/library.html');
                const updated = insertIntoLibraryHtml(
                  enLibHtml,
                  ARTICLE_CATEGORIES.find((c) => c.key === 'normal')!,
                  `${titleEn}.html`,
                  titleEn,
                  true,
                );
                if (updated !== enLibHtml) {
                  await putFile('en/library/library.html', updated, { sha, message: `Article list sync: ${titleEn} (mobile app)` });
                  steps.push('en/library/library.html 已同步');
                }
              } catch {
                steps.push('en/library/library.html 同步失败（可手动添加）');
              }
              } // 非隐藏新闻的列表同步结束

              setPublishing(false);
              const { draftId: did } = useComposeStore.getState();
              if (did) useDraftsStore.getState().remove(did);
              Alert.alert(
                '发布完成',
                steps.join('\n') + '\n\n约 1-2 分钟后网站生效。',
                [{ text: '完成', onPress: () => { useComposeStore.getState().reset(); router.replace('/'); } }],
              );
            } catch (err) {
              setPublishing(false);
              Alert.alert('发布失败', `${(err as Error).message}\n\n已完成：\n${steps.join('\n') || '无'}`);
            }
          },
        },
      ],
    );
  };

  /** 切换标签页：保留浏览进度，切换时收起键盘 */
  const switchTab = (next: Tab) => {
    if (next === tab) return;
    Keyboard.dismiss();
    setTab(next);
  };

  return (
    <View style={s.container}>
      {/* 分段切换 + 锁定开关 */}
      <View style={s.tabs}>
        <Pressable style={[s.tab, tab === 'meta' && s.tabActive]} onPress={() => switchTab('meta')}>
          <Text style={[s.tabText, tab === 'meta' && s.tabTextActive]}>元数据</Text>
        </Pressable>
        <Pressable style={[s.tab, tab === 'body' && s.tabActive]} onPress={() => switchTab('body')}>
          <Text style={[s.tabText, tab === 'body' && s.tabTextActive]}>正文</Text>
        </Pressable>
        <Pressable
          style={[s.lockBtn, locked[tab] && s.lockBtnOn]}
          onPress={() => toggleLock(tab)}
          accessibilityLabel={locked[tab] ? '解锁当前页' : '锁定当前页'}
        >
          <Text style={[s.lockText, locked[tab] && s.lockTextOn]}>
            {locked[tab] ? '已锁定' : '锁定'}
          </Text>
        </Pressable>
      </View>

      {/* 内容：两个标签页始终保持挂载，切换保留滚动位置 */}
      <View style={s.content}>
        <View style={[s.page, tab !== 'meta' && s.pageHidden]}>
          <MetaForm
            scrollPosition={scrollPositions.meta}
            onScroll={(y) => setScrollPosition('meta', y)}
            extra={
              <NewsOptions
                kind={kind}
                setKind={setKind}
                posterUri={posterUri}
                onPickPoster={pickPoster}
              />
            }
          />
        </View>
        <View style={[s.page, tab !== 'body' && s.pageHidden]}>
          <MarkdownEditor
            scrollPosition={scrollPositions.body}
            onScroll={(y) => setScrollPosition('body', y)}
          />
        </View>
      </View>

      {/* 底部按钮 */}
      <View style={s.footer}>
        <Pressable
          style={[s.previewBtn, (preparing || publishing) && s.btnDisabled]}
          onPress={handlePreview}
          disabled={preparing || publishing}
        >
          <Text style={s.previewBtnText}>{preparing ? '生成中…' : '生成预览'}</Text>
        </Pressable>
        <Pressable style={[s.publishBtn, publishing && s.btnDisabled]} onPress={handlePublish} disabled={publishing}>
          <Text style={s.publishBtnText}>{publishing ? '发布中…' : '发布新闻'}</Text>
        </Pressable>
      </View>

      {/* 正文预览（与文章一致的网站样式渲染） */}
      <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
        <View style={s.previewModal}>
          <View style={s.previewHeader}>
            <Text style={s.previewTitle}>正文预览</Text>
            <Pressable style={s.previewClose} onPress={() => setPreviewVisible(false)}>
              <Text style={s.previewCloseText}>关闭</Text>
            </Pressable>
          </View>
          {previewHtml ? (
            <View style={{ flex: 1 }}>
              <HtmlPreview html={previewHtml} />
            </View>
          ) : (
            <View style={s.previewEmpty}>
              <Text style={s.previewEmptyText}>无预览内容</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
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
    content: { flex: 1 },
    page: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.bg },
    pageHidden: { display: 'none' },
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
      flexDirection: 'row',
      gap: SPACING.sm,
      borderTopWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      backgroundColor: COLORS.bg,
    },
    previewBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.accent,
      padding: SPACING.md,
      alignItems: 'center',
      backgroundColor: COLORS.bgSubtle,
    },
    previewBtnText: { color: COLORS.accent, fontSize: 15, fontWeight: '600' },
    publishBtn: {
      flex: 2,
      backgroundColor: COLORS.accent,
      padding: SPACING.md,
      alignItems: 'center',
    },
    publishBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    btnDisabled: { opacity: 0.5 },
    previewModal: { flex: 1, backgroundColor: COLORS.bg },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      backgroundColor: COLORS.bgSubtle,
    },
    previewTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    previewClose: {
      borderWidth: 1,
      borderColor: COLORS.accent,
      paddingVertical: 6,
      paddingHorizontal: SPACING.lg,
    },
    previewCloseText: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },
    previewEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    previewEmptyText: { fontSize: 14, color: COLORS.textLight },
  });
