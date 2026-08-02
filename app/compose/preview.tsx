// 预览与上传页：WebView 渲染生成 HTML + 校验 + 分类上传 + 同步 library.html 文章列表
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { HtmlPreview } from '../../src/components/HtmlPreview';
import { useComposeStore } from '../../src/store/compose-store';
import { useDraftsStore } from '../../src/store/drafts-store';
import { getFile, putFile } from '../../src/lib/github-client';
import { PREVIEW_BASE_URL } from '../../src/lib/site-style';
import { validateArticleHtml } from '../../src/templates/validators';
import {
  ARTICLE_CATEGORIES,
  buildSearchKeywords,
  insertIntoLibraryHtml,
  insertSearchEntry,
} from '../../src/lib/article-sync';
import { SPACING, useTheme, type Palette } from '../../src/theme';

export default function PreviewScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { form, generatedHtml, setUploadStatus, reset } = useComposeStore();
  const [uploading, setUploading] = useState(false);
  const s = createStyles(colors);

  // 文章分类在元数据表单中选择（form.category）
  const category =
    ARTICLE_CATEGORIES.find((c) => c.key === form.category) ?? ARTICLE_CATEGORIES[0];

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
    // 英文标题同时是文件名：拒绝路径分隔符与危险字符，防止写入仓库任意路径
    if (/[\\/\u0000-\u001f<>:"|?*]|\.\./.test(titleEn)) {
      Alert.alert('英文标题不合法', '英文标题将作为文件名，不能包含 / \\ : * ? " < > | 等字符或 ..');
      return;
    }

    const filePath = `${category.dir}/${titleEn}.html`;

    Alert.alert(
      '确认上传',
      form.hidden
        ? `分类：${category.label}（隐藏）\n将创建/更新文件：\nlibrary/${filePath}\n\n隐藏文章：不显示在 library.html 列表与新闻，仅加入站内搜索数据（查找按钮可找到）。\n\n提交后约 1-2 分钟 GitHub Pages 生效。`
        : `分类：${category.label}\n将创建/更新文件：\nlibrary/${filePath}\n\n并同步更新 library.html（中文/英文）文章列表与站内搜索数据。\n\n提交后约 1-2 分钟 GitHub Pages 生效。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '上传',
          onPress: async () => {
            setUploading(true);
            try {
              setUploadStatus('uploading');
              await putFile(filePath, generatedHtml, {
                message: `上传文章：${title}（移动端 App）`,
              });

              // 站内搜索数据同步（js/library-dynamic.js 的 Search.data）——隐藏文章也加入，仅能通过查找按钮找到
              let searchSynced = false;
              try {
                const { content, sha } = await getFile('js/library-dynamic.js');
                const updated = insertSearchEntry(content, {
                  title,
                  keywords: buildSearchKeywords(form),
                  urlPath: `${category.dir}/${titleEn}.html`,
                });
                if (updated !== content) {
                  await putFile('js/library-dynamic.js', updated, {
                    sha,
                    message: `站内搜索数据同步：${title}（移动端 App）`,
                  });
                  searchSynced = true;
                }
              } catch {
                // 搜索数据同步失败不阻塞
              }

              // 非隐藏文章：同步 library.html（中文/英文）文章列表
              let librarySynced = false;
              let enLibrarySynced = false;
              if (!form.hidden) {
                try {
                  const { content, sha } = await getFile('library/library.html');
                  const updated = insertIntoLibraryHtml(content, category, `${titleEn}.html`, title);
                  if (updated !== content) {
                    await putFile('library/library.html', updated, {
                      sha,
                      message: `文章列表同步：${title}（移动端 App）`,
                    });
                    librarySynced = true;
                  }
                } catch {
                  // library.html 同步失败不阻塞上传结果，仅提示
                }

                // 同步英文版 library.html（用英文标题）
                try {
                  const { content, sha } = await getFile('en/library/library.html');
                  const updated = insertIntoLibraryHtml(content, category, `${titleEn}.html`, titleEn, true);
                  if (updated !== content) {
                    await putFile('en/library/library.html', updated, {
                      sha,
                      message: `Article list sync: ${titleEn} (mobile app)`,
                    });
                    enLibrarySynced = true;
                  }
                } catch {
                  // 英文版同步失败不阻塞
                }
              }

              setUploadStatus('done', undefined, filePath);
              setUploading(false);
              Alert.alert(
                '上传成功',
                form.hidden
                  ? `文件：library/${filePath}\n\n隐藏文章：未同步公开列表。站内搜索数据${searchSynced ? '已加入' : '同步失败（可手动添加）'}。\n\n约 1-2 分钟后可在网站查看。`
                  : `文件：library/${filePath}\n\nlibrary.html 文章列表${librarySynced ? '已同步' : '同步失败（可手动添加）'}；英文版${enLibrarySynced ? '已同步' : '同步失败（可手动添加）'}；站内搜索${searchSynced ? '已同步' : '同步失败（可手动添加）'}。\n\n约 1-2 分钟后可在网站查看。`,
                [
                  {
                    text: '完成',
                    onPress: () => {
                      // 上传成功：清除对应草稿
                      const { draftId } = useComposeStore.getState();
                      if (draftId) useDraftsStore.getState().remove(draftId);
                      reset();
                      router.replace('/');
                    },
                  },
                ],
              );
            } catch (err) {
              const msg = (err as Error).message;
              setUploadStatus('error', msg);
              setUploading(false);
              Alert.alert('上传失败', msg);
            }
          },
        },
      ],
    );
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

      {/* 分类提示（分类在元数据表单中选择） */}
      <View style={s.categoryBox}>
        <Text style={s.categoryHint}>
          文章分类：{category.label}（在元数据表单中修改）→ 上传至 library/{category.dir}/
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
          style={[s.uploadBtn, uploading && s.btnDisabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          <Text style={s.uploadBtnText}>{uploading ? '上传中…' : '上传到仓库'}</Text>
        </Pressable>
      </View>
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
  });
