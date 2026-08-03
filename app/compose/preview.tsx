// 预览与上传页：WebView 渲染生成 HTML + 校验 + 分类上传 + 同步 library.html + 新闻区同步
// 0.0.7：文章与新闻合并上传——form.isNews 时触发新闻板块同步；全局 publishBusy 锁防重复提交
import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { HtmlPreview } from '../../src/components/HtmlPreview';
import { useComposeStore } from '../../src/store/compose-store';
import { useConfigStore } from '../../src/store/config-store';
import { useDraftsStore } from '../../src/store/drafts-store';
import { getFile, putFile } from '../../src/lib/github-client';
import { PREVIEW_BASE_URL } from '../../src/lib/site-style';
import { validateArticleHtml } from '../../src/templates/validators';
import {
  buildSearchKeywords,
  insertIntoLibraryHtml,
  insertSearchEntry,
} from '../../src/lib/article-sync';
import { syncNewsSections } from '../../src/lib/news-sync';
import { SPACING, useTheme, type Palette } from '../../src/theme';

export default function PreviewScreen() {
  const router = useRouter();
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
  const s = createStyles(colors);

  // 文章分类在元数据表单中选择（form.category）
  const category = categories.find((c) => c.key === form.category) ?? categories[0];

  const validation = generatedHtml ? validateArticleHtml(generatedHtml) : null;

  const handleUpload = async () => {
    if (!generatedHtml) {
      Alert.alert('无预览内容');
      return;
    }
    const title = form.title.trim();
    const titleEn = form.titleEn.trim();
    if (!title) {
      Alert.alert('标题不能为空');
      return;
    }
    if (!titleEn) {
      Alert.alert('英文标题不能为空', '英文标题将作为文件名，请填写英文标题（如 a-new-article）。');
      return;
    }
    if (/[\\/\u0000-\u001f<>:"|?*]|\.\./.test(titleEn)) {
      Alert.alert('英文标题不合法', '英文标题将作为文件名，不能包含 / \\ : * ? " < > | 等字符或 ..');
      return;
    }
    // 全局锁：防止重复提交或返回后重入
    if (publishBusy) {
      Alert.alert('正在上传', '请等待当前上传完成。');
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

    Alert.alert('确认上传', confirmMsg + '\n\n提交后约 1-2 分钟 GitHub Pages 生效。', [
      { text: '取消', style: 'cancel' },
      {
        text: '上传',
        onPress: async () => {
          setPublishBusy(true);
          setUploading(true);
          setUploadStatus('uploading');
          const steps: string[] = [];
          try {
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
              steps.push('（隐藏文章：未同步公开列表）');
            } else {
              // 4. 非隐藏文章：同步 library.html 文章列表（中英文）
              try {
                const { content, sha } = await getFile('library/library.html');
                const updated = insertIntoLibraryHtml(content, category, `${category.dir}/${titleEn}.html`, title);
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
                const updated = insertIntoLibraryHtml(content, category, `${category.dir}/${titleEn}.html`, titleEn, true);
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
            }

            setUploadStatus('done', undefined, filePath);
            setUploading(false);
            setProgressLogs(steps);
            setLogVisible(true);
          } catch (err) {
            const msg = (err as Error).message;
            setUploadStatus('error', msg);
            setUploading(false);
            steps.push(`上传失败：${msg}`);
            setProgressLogs(steps);
            setLogVisible(true);
          }
        },
      },
    ]);
  };

  const handleDone = () => {
    setPublishBusy(false);
    const did = useComposeStore.getState().draftId;
    if (did) useDraftsStore.getState().remove(did);
    setLogVisible(false);
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
      {/* 校验状态条 */}
      {validation && (
        <View style={[s.validateBar, validation.valid ? s.validateOk : s.validateFail]}>
          <Text style={[s.validateText, validation.valid ? s.validateTextOk : s.validateTextFail]}>
            {validation.valid
              ? 'HTML 校验通过'
              : `缺少：${validation.missing.join('、')}`}
          </Text>
        </View>
      )}

      {/* 分类提示 + 新闻标记 */}
      <View style={s.categoryBox}>
        <Text style={s.categoryHint}>
          文章分类：{category.label}（在元数据表单中修改）→ 上传至 library/{category.dir}/
          {form.isNews && ` | 新闻形态：${newsKind === 'poster' ? '海报新闻' : '文字新闻'}`}
        </Text>
      </View>

      <View style={s.preview}>
        <HtmlPreview html={generatedHtml} baseUrl={PREVIEW_BASE_URL} />
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
            {uploading ? '上传中…' : publishBusy ? '等待中…' : '上传到仓库'}
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
            <Text style={s.logTitle}>上传结果</Text>
            <ScrollView style={s.logScroll}>
              {progressLogs.map((msg, i) => (
                <Text key={i} style={[s.logItem, msg.startsWith('上传失败') && s.logError]}>
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