// 预览与上传页：WebView 渲染生成 HTML + 校验 + 按条目类型发布
// 0.0.7：文章与新闻合并上传——form.isNews 时触发新闻板块同步；全局 publishBusy 锁防重复提交
// 词条统一：form.entryType==='knowledge' 时走知识馆发布（词条页 + 分类页列表同步），
//          本页因此同时服务两种条目；/compose/knowledge-preview 只是渲染同一组件的兼容路由
// 注意：generatedHtml 存的始终是「要上传到仓库的规范 HTML」（只有 CSS 的 <link>）；
//      网站样式表只在渲染预览时套上（否则上传的页面会带着一整份内联样式，站点换配色时不跟随）
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { HtmlPreview } from '../../src/components/HtmlPreview';
import { useComposeStore } from '../../src/store/compose-store';
import { useConfigStore } from '../../src/store/config-store';
import { useDraftsStore } from '../../src/store/drafts-store';
import { getFile, putFile } from '../../src/lib/github-client';
import { buildPreviewHtml, getSiteCss, PREVIEW_BASE_URL } from '../../src/lib/site-style';
import { validateArticleHtml, validateKnowledgeHtml } from '../../src/templates/validators';
import { KNOWLEDGE_CATEGORIES } from '../../src/templates/knowledge-entry';
import { publishKnowledgeEntry } from '../../src/lib/knowledge-sync';
import {
  buildSearchKeywords,
  insertIntoLibraryHtml,
  insertIntoNavigatorHtml,
  insertSearchEntry,
  removeFromLibraryHtml,
  removeFromNavigatorHtml,
} from '../../src/lib/article-sync';
import { removeNewsItem, syncNewsSections } from '../../src/lib/news-sync';
import { SPACING, useTheme, type Palette } from '../../src/theme';

export function PreviewScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    form,
    generatedHtml,
    newsKind,
    posterBase64,
    publishBusy,
    setUploadStatus,
    setPublishBusy,
    reset,
  } = useComposeStore();
  const categories = useConfigStore((s) => s.categories);
  const [uploading, setUploading] = useState(false);
  const [progressLogs, setProgressLogs] = useState<string[]>([]);
  const [logVisible, setLogVisible] = useState(false);
  const [siteCss, setSiteCss] = useState<string | null>(null);
  const s = createStyles(colors);

  const isKnowledge = form.entryType === 'knowledge';
  // 文章分类在元数据表单中选择（form.category）
  const category = categories.find((c) => c.key === form.category) ?? categories[0];
  // 词条的知识馆分类（form.knowledgeCategory）
  const knowledgeCat = KNOWLEDGE_CATEGORIES[form.knowledgeCategory] ?? KNOWLEDGE_CATEGORIES.phenomenon;

  useEffect(() => {
    navigation.setOptions({ title: isKnowledge ? '知识词条预览' : '预览与上传' });
  }, [navigation, isKnowledge]);

  // 预览用的网站样式（style.css + 精修层）：失败时退化为无样式渲染，不阻塞发布
  useEffect(() => {
    if (siteCss) return;
    let alive = true;
    void getSiteCss().then((css) => {
      if (alive && css) setSiteCss(css);
    });
    return () => {
      alive = false;
    };
  }, [siteCss]);

  // 词条页与文章页各按自己的必需构件校验（词条不再跳过这一步）
  const validation = generatedHtml
    ? isKnowledge
      ? validateKnowledgeHtml(generatedHtml)
      : validateArticleHtml(generatedHtml)
    : null;

  /** 发布公共流程：确认 → 忙碌锁 → 步骤日志 → 结果弹窗 */
  const runPublish = (opts: {
    alertTitle: string;
    alertMessage: string;
    confirmLabel: string;
    commitLabel: string;
    run: () => Promise<string[]>;
  }) => {
    if (publishBusy) {
      Alert.alert('正在上传', '请等待当前上传完成。');
      return;
    }
    Alert.alert(opts.alertTitle, `${opts.alertMessage}\n\n提交后约 1-2 分钟 GitHub Pages 生效。`, [
      { text: '取消', style: 'cancel' },
      {
        text: opts.confirmLabel,
        onPress: async () => {
          setPublishBusy(true);
          setUploading(true);
          setUploadStatus('uploading');
          const steps: string[] = [];
          try {
            steps.push(...(await opts.run()));
            // 区分成功/失败步骤，失败项标红，便于发现「隐藏文章但未从公开列表移除」这类部分失败
            const hasFail = steps.some((x) => x.includes('失败') || x.includes('未移除') || x.includes('可手动'));
            setProgressLogs(
              steps.map((x) => (hasFail && (x.includes('失败') || x.includes('可手动')) ? `[失败] ${x}` : x)),
            );
          } catch (err) {
            const msg = (err as Error).message;
            setUploadStatus('error', msg);
            setUploading(false);
            steps.push(`${opts.commitLabel}：${msg}`);
            setProgressLogs(steps);
            setLogVisible(true);
            return;
          }
          setUploading(false);
          setLogVisible(true);
        },
      },
    ]);
  };

  /** 文章（含新闻 / 隐藏文章）：上传页面 + 搜索数据 + library.html 列表 + 新闻板块同步 */
  const uploadArticle = async (): Promise<string[]> => {
    if (!generatedHtml) return [];
    const title = form.title.trim();
    const titleEn = form.titleEn.trim();
    const steps: string[] = [];
    const filePath = `library/${category.dir}/${titleEn}.html`;
    const posterPath = form.isNews && newsKind === 'poster' && posterBase64
      ? `image/poster/${titleEn}.png`
      : null;

    // 1. 上传海报（如有）
    if (posterPath && posterBase64) {
      await putFile(posterPath, posterBase64, {
        message: `新闻海报：${title}（移动端 App）`,
        contentIsBase64: true,
      });
      steps.push(`海报已上传：${posterPath}`);
    }

    // 2. 上传文章
    await putFile(filePath, generatedHtml, {
      message: `上传文章：${title}（移动端 App）`,
    });
    setUploadStatus('done', undefined, filePath);
    steps.push(`文章已上传：${filePath}`);

    // 3. 站内搜索数据同步
    try {
      const { content, sha } = await getFile('js/library-dynamic.js');
      const updated = insertSearchEntry(content, {
        title,
        keywords: buildSearchKeywords(form),
        urlPath: filePath,
      });
      if (updated !== content) {
        await putFile('js/library-dynamic.js', updated, {
          sha,
          message: `站内搜索数据同步：${title}（移动端 App）`,
        });
        steps.push('站内搜索数据已同步');
      }
    } catch {
      steps.push('站内搜索同步失败（可手动添加）');
    }

    if (form.hidden) {
      // 隐藏文章：主动从公开列表移除（若之前已发布过）
      steps.push('（隐藏文章：正在从公开列表移除…）');
      try {
        const { content, sha } = await getFile('library/library.html');
        const updated = removeFromLibraryHtml(content, category, `${titleEn}.html`);
        if (updated !== content) {
          await putFile('library/library.html', updated, {
            sha,
            message: `隐藏文章：${title}（移动端 App）`,
          });
          steps.push('library.html 已移除文章条目');
        }
      } catch {
        steps.push('library.html 移除失败（可手动添加）');
      }
      try {
        const { content, sha } = await getFile('en/library/library.html');
        const updated = removeFromLibraryHtml(content, category, `${titleEn}.html`);
        if (updated !== content) {
          await putFile('en/library/library.html', updated, {
            sha,
            message: `Article hidden: ${titleEn} (mobile app)`,
          });
          steps.push('en/library/library.html 已移除文章条目');
        }
      } catch {
        steps.push('en/library/library.html 移除失败（可手动添加）');
      }
      try {
        const { content, sha } = await getFile('navigator.html');
        const updated = removeFromNavigatorHtml(content, category, `${titleEn}.html`);
        if (updated !== content) {
          await putFile('navigator.html', updated, {
            sha,
            message: `隐藏文章：${title}（navigator.html，移动端 App）`,
          });
          steps.push('navigator.html 已移除文章条目');
        }
      } catch {
        steps.push('navigator.html 移除失败（可手动添加）');
      }
      if (form.isNews) {
        const newsSteps = await removeNewsItem({
          title,
          titleEn,
          date: form.createDate,
          kind: newsKind,
          posterPath: posterPath ?? undefined,
          categoryDir: category.dir,
        });
        steps.push(...newsSteps);
      }
      return steps;
    }

    // 4. 非隐藏文章：同步 library.html 文章列表（中英文）
    try {
      const { content, sha } = await getFile('library/library.html');
      const updated = insertIntoLibraryHtml(content, category, `${titleEn}.html`, title);
      if (updated !== content) {
        await putFile('library/library.html', updated, {
          sha,
          message: `文章列表同步：${title}（移动端 App）`,
        });
        steps.push('library.html 已同步');
      }
    } catch {
      steps.push('library.html 同步失败（可手动添加）');
    }
    try {
      const { content, sha } = await getFile('en/library/library.html');
      const updated = insertIntoLibraryHtml(content, category, `${titleEn}.html`, titleEn, true);
      if (updated !== content) {
        await putFile('en/library/library.html', updated, {
          sha,
          message: `Article list sync: ${titleEn} (mobile app)`,
        });
        steps.push('en/library/library.html 已同步');
      }
    } catch {
      steps.push('en/library/library.html 同步失败（可手动添加）');
    }

    // 4b. 导航枢纽同步（navigator.html 只有中文版，链接相对站点根）
    try {
      const { content, sha } = await getFile('navigator.html');
      const updated = insertIntoNavigatorHtml(content, category, `${titleEn}.html`, title);
      if (updated !== content) {
        await putFile('navigator.html', updated, {
          sha,
          message: `导航枢纽同步：${title}（移动端 App）`,
        });
        steps.push('navigator.html 已同步');
      }
    } catch {
      steps.push('navigator.html 同步失败（可手动添加）');
    }

    // 5. 新闻板块同步（form.isNews 时触发）
    if (form.isNews) {
      const newsSteps = await syncNewsSections({
        title,
        titleEn,
        date: form.createDate,
        kind: newsKind,
        posterPath: posterPath ?? undefined,
        categoryDir: category.dir,
      });
      steps.push(...newsSteps);
    }
    return steps;
  };

  /** 词条：上传 knowledge-hall/categories/{分类}/{titleEn}.html + 同步分类页词条列表 */
  const uploadKnowledge = async (): Promise<string[]> => {
    if (!generatedHtml) return [];
    const title = form.title.trim();
    const titleEn = form.titleEn.trim();
    const filePath = `knowledge-hall/categories/${form.knowledgeCategory}/${titleEn}.html`;
    const steps = await publishKnowledgeEntry({
      title,
      titleEn,
      category: form.knowledgeCategory,
      html: generatedHtml,
    });
    setUploadStatus('done', undefined, filePath);
    return steps;
  };

  /** 发布前校验 + 按条目类型分支确认文案 */
  const handleUpload = () => {
    if (!generatedHtml) {
      Alert.alert('无预览内容');
      return;
    }
    const title = form.title.trim();
    const titleEn = form.titleEn.trim();
    if (!title) {
      Alert.alert(isKnowledge ? '词条标题不能为空' : '标题不能为空');
      return;
    }
    if (!titleEn) {
      Alert.alert(
        '英文标题不能为空',
        isKnowledge
          ? '英文标题将作为词条页文件名，请填写英文标题（如 inverse-method）。'
          : '英文标题将作为文件名，请填写英文标题（如 a-new-article）。',
      );
      return;
    }
    if (/[\\/\u0000-\u001f<>:"|?*]|\.\./.test(titleEn)) {
      Alert.alert('英文标题不合法', '英文标题将作为文件名，不能包含 / \\ : * ? " < > | 等字符或 ..');
      return;
    }

    if (isKnowledge) {
      runPublish({
        alertTitle: '确认发布知识词条',
        alertMessage: `分类：${knowledgeCat.label}\n将创建文件：\nknowledge-hall/categories/${form.knowledgeCategory}/${titleEn}.html\n\n并同步更新 ${knowledgeCat.page} 的词条列表。`,
        confirmLabel: '发布',
        commitLabel: '发布失败',
        run: uploadKnowledge,
      });
      return;
    }

    const filePath = `library/${category.dir}/${titleEn}.html`;
    const posterPath = form.isNews && newsKind === 'poster' && posterBase64
      ? `image/poster/${titleEn}.png`
      : null;
    const confirmMsg = form.hidden
      ? `分类：${category.label}（隐藏）\n将创建/更新文件：\n${filePath}\n\n隐藏文章：不显示在 library.html 列表与新闻，仅加入站内搜索数据。`
      : form.isNews
        ? `分类：${category.label}\n（在新闻板块展示：${newsKind === 'poster' ? '海报新闻' : '文字新闻'}）\n\n将执行：\n${posterPath ? `1. 上传海报 ${posterPath}\n` : ''}2. 上传文章 ${filePath}\n3. 更新主页新闻区 index.html\n4. 更新 news.html\n5. 更新英文主页 en/index.html\n6. 同步 library.html 文章列表`
        : `分类：${category.label}\n将创建/更新文件：\n${filePath}\n\n并同步更新 library.html 文章列表与站内搜索数据。`;

    runPublish({
      alertTitle: '确认上传',
      alertMessage: confirmMsg,
      confirmLabel: '上传',
      commitLabel: '上传失败',
      run: uploadArticle,
    });
  };

  const handleDone = () => {
    setPublishBusy(false);
    const did = useComposeStore.getState().draftId;
    if (did) useDraftsStore.getState().remove(did);
    setLogVisible(false);
    // 发布成功：会话结束（表单清空 + draftId 归零），下次从入口进来得的是新草稿
    reset();
    router.replace('/');
  };

  if (!generatedHtml) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>无预览内容，请先返回撰写页生成</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* 校验状态条（词条页的必需性由撰写页的分节校验保证） */}
      {validation && (
        <View style={[s.validateBar, validation.valid ? s.validateOk : s.validateFail]}>
          <Text style={[s.validateText, validation.valid ? s.validateTextOk : s.validateTextFail]}>
            {validation.valid
              ? 'HTML 校验通过'
              : `缺少：${validation.missing.join('、')}`}
          </Text>
        </View>
      )}

      {/* 目标位置提示 */}
      <View style={s.categoryBox}>
        <Text style={s.categoryHint}>
          {isKnowledge
            ? `知识分类：${knowledgeCat.label} → 上传至 knowledge-hall/categories/${form.knowledgeCategory}/（在撰写页的词条信息中修改） | 发布后同步 ${knowledgeCat.page} 词条列表`
            : `文章分类：${category.label}（在元数据表单中修改）→ 上传至 library/${category.dir}/` +
              `${form.isNews ? ` | 新闻形态：${newsKind === 'poster' ? '海报新闻' : '文字新闻'}` : ''}`}
        </Text>
      </View>

      <View style={s.preview}>
        <HtmlPreview html={buildPreviewHtml(generatedHtml, siteCss)} baseUrl={PREVIEW_BASE_URL} />
      </View>

      {/* 底部操作 */}
      <View style={s.footer}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>返回修改</Text>
        </Pressable>
        <Pressable
          style={[s.uploadBtn, (uploading || publishBusy) && s.btnDisabled]}
          onPress={handleUpload}
          disabled={uploading || publishBusy}
        >
          <Text style={s.uploadBtnText}>
            {uploading ? '上传中…' : publishBusy ? '等待中…' : isKnowledge ? '发布知识词条' : '上传到仓库'}
          </Text>
        </Pressable>
      </View>

      {/* 上传中遮罩 */}
      {uploading && (
        <View style={s.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={s.overlayText}>正在上传…</Text>
          <Text style={s.overlayHint}>请勿返回或重复操作</Text>
        </View>
      )}

      {/* 结果日志弹窗 */}
      <Modal visible={logVisible} transparent animationType="fade" onRequestClose={handleDone}>
        <View style={s.logOverlay}>
          <View style={s.logPanel}>
            <Text style={s.logTitle}>{isKnowledge ? '发布结果' : '上传结果'}</Text>
            <ScrollView style={s.logScroll}>
              {progressLogs.map((msg, i) => (
                <Text key={i} style={[s.logItem, (msg.startsWith('上传失败') || msg.startsWith('发布失败') || msg.includes('[失败]')) && s.logError]}>
                  {msg}
                </Text>
              ))}
            </ScrollView>
            <Pressable style={s.logDone} onPress={handleDone}>
              <Text style={s.logDoneText}>完成</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default PreviewScreen;

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: COLORS.textLight, fontSize: 14 },
    validateBar: { padding: SPACING.sm + 2, borderLeftWidth: 4 },
    validateOk: { backgroundColor: COLORS.successBg, borderLeftColor: COLORS.success },
    validateFail: { backgroundColor: COLORS.dangerBg, borderLeftColor: COLORS.danger },
    validateText: { fontSize: 13 },
    validateTextOk: { color: COLORS.success },
    validateTextFail: { color: COLORS.danger },
    categoryBox: {
      padding: SPACING.sm + 2,
      borderBottomWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.bgSubtle,
    },
    categoryHint: { fontSize: 11, color: COLORS.textLight, lineHeight: 16 },
    preview: { flex: 1 },
    footer: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      gap: SPACING.sm,
    },
    backBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      alignItems: 'center',
    },
    backText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '500' },
    uploadBtn: {
      flex: 2,
      backgroundColor: COLORS.accent,
      padding: SPACING.md,
      alignItems: 'center',
    },
    btnDisabled: { opacity: 0.5 },
    uploadBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    overlayText: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: SPACING.sm },
    overlayHint: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 8 },
    logOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: SPACING.lg,
    },
    logPanel: {
      backgroundColor: COLORS.bg,
      maxHeight: '70%',
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
    },
    logTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
    logScroll: { flexGrow: 0, maxHeight: 300 },
    logItem: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 2 },
    logError: { color: COLORS.danger },
    logDone: {
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.sm + 2,
      alignItems: 'center',
      marginTop: SPACING.md,
      backgroundColor: COLORS.bgSubtle,
    },
    logDoneText: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },
  });
