// 新闻发布页：撰写新闻文章（可带海报），上传并同步主页新闻区 / news.html / 英文主页 / library.html
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { MarkdownEditor } from '../../src/components/MarkdownEditor';
import { DatePickerModal } from '../../src/components/DatePickerModal';
import { useComposeStore } from '../../src/store/compose-store';
import { useDraftsStore } from '../../src/store/drafts-store';
import { getFile, putFile } from '../../src/lib/github-client';
import { generateArticleHtml } from '../../src/templates/article';
import { validateArticleHtml } from '../../src/templates/validators';
import { insertTextCard, replacePosterAndDemote } from '../../src/templates/news-card';
import { insertNewsListItem } from '../../src/templates/news-list-item';
import { insertIntoLibraryHtml, ARTICLE_CATEGORIES } from '../../src/lib/article-sync';
import { SPACING, useTheme, type Palette } from '../../src/theme';

type NewsKind = 'text' | 'poster';

export default function NewsPublishScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const { form, setField, draftId, startDraft } = useComposeStore();
  const [publishing, setPublishing] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [kind, setKind] = useState<NewsKind>('text');
  const [posterUri, setPosterUri] = useState<string | null>(null);
  const [posterBase64, setPosterBase64] = useState<string | null>(null);

  // 新闻发布强制信息文章性质；无草稿上下文时生成新草稿
  useEffect(() => {
    setField('articleType', '信息文章');
    if (!draftId) startDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 自动保存草稿（防抖）
  useEffect(() => {
    if (!draftId) return;
    const t = setTimeout(() => {
      useDraftsStore.getState().upsert({
        id: draftId,
        title: `[新闻] ${form.title.trim() || '未命名'}`,
        updatedAt: Date.now(),
        form,
      });
    }, 600);
    return () => clearTimeout(t);
  }, [form, draftId]);

  const pickPoster = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
      });
      if (res.canceled || !res.assets?.length) return;
      const uri = res.assets[0].uri;
      // 压缩到宽 800 并输出 base64（GitHub Contents API 限制）
      const processed = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true },
      );
      if (processed.base64) {
        setPosterUri(processed.uri);
        setPosterBase64(processed.base64);
      }
    } catch {
      Alert.alert('选图失败', '无法读取所选图片，请重试');
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
        `1. ${kind === 'poster' ? `上传海报 ${posterPath}` : ''}${kind === 'poster' ? '\n' : ''}` +
        `2. 上传文章 ${articlePath}\n` +
        `3. 更新主页新闻区 index.html\n` +
        `4. 更新 news.html\n` +
        `5. 更新英文主页 en/index.html\n` +
        `6. 同步 library.html 普通文章列表`,
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
                steps.push(`海报已上传：image/${posterPath}`);
              }

              await putFile(articlePath, html, { message: `发布新闻：${title}（移动端 App）` });
              steps.push(`文章已上传：${articlePath}`);

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

              // library.html 普通文章列表
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

              setPublishing(false);
              const { draftId: did } = useComposeStore.getState();
              if (did) useDraftsStore.getState().remove(did);
              Alert.alert(
                '发布完成',
                steps.join('\n') + '\n\n约 1-2 分钟后网站生效。',
                [{ text: '完成', onPress: () => { resetForm(); router.replace('/'); } }],
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

  const resetForm = () => {
    useComposeStore.getState().reset();
  };

  return (
    <View style={s.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content}>
        {/* 标题 */}
        <Text style={s.label}>标题（中文）*</Text>
        <TextInput
          style={s.input}
          value={form.title}
          onChangeText={(v) => setField('title', v)}
          placeholder="新闻标题"
          placeholderTextColor={colors.textLight}
        />

        <Text style={s.label}>英文标题 *</Text>
        <TextInput
          style={s.input}
          value={form.titleEn}
          onChangeText={(v) => setField('titleEn', v)}
          placeholder="English title（作为文件名）"
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* 发布日期 */}
        <Text style={s.label}>发布日期 *</Text>
        <View style={s.inputRow}>
          <View style={[s.input, s.inputFlex, s.dateDisplay]}>
            <Text style={form.createDate ? s.dateText : s.datePlaceholder}>
              {form.createDate || 'YYYY-MM-DD'}
            </Text>
          </View>
          <Pressable style={s.sideBtn} onPress={() => setDatePickerVisible(true)}>
            <Text style={s.sideBtnText}>日历</Text>
          </Pressable>
        </View>

        {/* 新闻形态 */}
        <Text style={s.label}>新闻形态</Text>
        <View style={s.chipRow}>
          <Pressable
            style={[s.chip, kind === 'text' && s.chipActive]}
            onPress={() => setKind('text')}
          >
            <Text style={[s.chipText, kind === 'text' && s.chipTextActive]}>文字新闻</Text>
          </Pressable>
          <Pressable
            style={[s.chip, kind === 'poster' && s.chipActive]}
            onPress={() => setKind('poster')}
          >
            <Text style={[s.chipText, kind === 'poster' && s.chipTextActive]}>海报新闻</Text>
          </Pressable>
        </View>

        {/* 海报选择 */}
        {kind === 'poster' && (
          <>
            <Text style={s.label}>海报图片</Text>
            {posterUri && (
              <Image source={{ uri: posterUri }} style={s.posterPreview} resizeMode="contain" />
            )}
            <Pressable style={s.pickBtn} onPress={pickPoster}>
              <Text style={s.pickBtnText}>{posterUri ? '重新选择海报' : '选择海报图片'}</Text>
            </Pressable>
            <Text style={s.hint}>图片将压缩至宽 800px 后上传到 image/poster/</Text>
          </>
        )}

        {/* 正文 */}
        <Text style={s.label}>正文 *</Text>
        <View style={s.editorBox}>
          <MarkdownEditor />
        </View>

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
          />
        </View>
      </ScrollView>

      {/* 底部发布按钮 */}
      <View style={s.footer}>
        <Pressable style={[s.publishBtn, publishing && s.btnDisabled]} onPress={handlePublish} disabled={publishing}>
          <Text style={s.publishBtnText}>{publishing ? '发布中…' : '发布新闻'}</Text>
        </Pressable>
      </View>

      <DatePickerModal
        visible={datePickerVisible}
        value={form.createDate}
        onConfirm={(date) => {
          setField('createDate', date);
          setDatePickerVisible(false);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />
    </View>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
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
    editorBox: { height: 320, borderWidth: 1, borderColor: COLORS.border },
    switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md },
    footer: {
      borderTopWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      backgroundColor: COLORS.bg,
    },
    publishBtn: {
      backgroundColor: COLORS.accent,
      padding: SPACING.md,
      alignItems: 'center',
    },
    publishBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    btnDisabled: { opacity: 0.5 },
  });
