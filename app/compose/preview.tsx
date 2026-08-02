// 预览与上传页：WebView 渲染生成 HTML + 校验 + 上传到 library/paper/
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { HtmlPreview } from '../../src/components/HtmlPreview';
import { useComposeStore } from '../../src/store/compose-store';
import { putFile } from '../../src/lib/github-client';
import { PREVIEW_BASE_URL } from '../../src/lib/site-style';
import { validateArticleHtml } from '../../src/templates/validators';
import { COLORS, SPACING } from '../../src/theme';

export default function PreviewScreen() {
  const router = useRouter();
  const { form, generatedHtml, setUploadStatus, reset } = useComposeStore();
  const [uploading, setUploading] = useState(false);

  const validation = generatedHtml ? validateArticleHtml(generatedHtml) : null;

  const handleUpload = async () => {
    if (!generatedHtml) {
      Alert.alert('无预览内容');
      return;
    }
    const title = form.title.trim();
    if (!title) {
      Alert.alert('标题不能为空');
      return;
    }
    // 标题同时是文件名：拒绝路径分隔符与危险字符，防止写入仓库任意路径
    if (/[\\/\u0000-\u001f<>:"|?*]|\.\./.test(title)) {
      Alert.alert('标题不合法', '标题将作为文件名，不能包含 / \\ : * ? " < > | 等字符或 ..');
      return;
    }

    Alert.alert(
      '确认上传',
      `将创建/更新文件：\nlibrary/paper/${title}.html\n\n提交后约 1-2 分钟 GitHub Pages 生效。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '上传',
          onPress: async () => {
            setUploading(true);
            try {
              setUploadStatus('uploading');
              const path = `library/paper/${title}.html`;
              const { commitSha } = await putFile(path, generatedHtml, {
                message: `上传文章：${title}（移动端 App）`,
              });
              setUploadStatus('done', undefined, path);
              setUploading(false);
              Alert.alert(
                '上传成功',
                `文件：library/paper/${title}.html\n\ncommit: ${commitSha?.slice(0, 7) ?? '—'}\n\n约 1-2 分钟后可在网站查看。`,
                [
                  {
                    text: '完成',
                    onPress: () => {
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
        <View
          style={[
            s.validateBar,
            validation.valid ? s.validateOk : s.validateFail,
          ]}
        >
          <Text style={[s.validateText, validation.valid ? s.validateTextOk : s.validateTextFail]}>
            {validation.valid
              ? '✓ HTML 校验通过'
              : `✗ 缺少：${validation.missing.join('、')}`}
          </Text>
        </View>
      )}

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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: COLORS.textLight, fontSize: 14 },
  validateBar: { padding: SPACING.sm + 2, borderLeftWidth: 4 },
  validateOk: { backgroundColor: '#f0faf3', borderLeftColor: COLORS.success },
  validateFail: { backgroundColor: '#fdf2f2', borderLeftColor: COLORS.danger },
  validateText: { fontSize: 13 },
  validateTextOk: { color: COLORS.success },
  validateTextFail: { color: COLORS.danger },
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
