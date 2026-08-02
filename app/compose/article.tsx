// 撰写文章页：元数据表单 + Markdown 编辑器（分段切换）+ 草稿自动保存
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MetaForm } from '../../src/components/MetaForm';
import { MarkdownEditor } from '../../src/components/MarkdownEditor';
import { useComposeStore } from '../../src/store/compose-store';
import { useDraftsStore } from '../../src/store/drafts-store';
import { generateArticleHtml } from '../../src/templates/article';
import { validateArticleHtml } from '../../src/templates/validators';
import { buildPreviewHtml, getSiteCss } from '../../src/lib/site-style';
import { SPACING, useTheme, type Palette } from '../../src/theme';

type Tab = 'meta' | 'body';

export default function ComposeArticleScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>('meta');
  const [preparing, setPreparing] = useState(false);
  const { form, setGeneratedHtml, draftId, startDraft } = useComposeStore();
  const s = createStyles(colors);

  // 进入撰写页：无草稿上下文时生成新草稿 id（此后编辑会自动保存）
  useEffect(() => {
    if (!draftId) startDraft();
  }, [draftId, startDraft]);

  // 自动保存草稿（防抖），退出软件重进后可在草稿箱恢复
  useEffect(() => {
    if (!draftId) return;
    const t = setTimeout(() => {
      useDraftsStore.getState().upsert({
        id: draftId,
        title: form.title.trim() || '未命名',
        updatedAt: Date.now(),
        form,
      });
    }, 600);
    return () => clearTimeout(t);
  }, [form, draftId]);

  const handlePreview = async () => {
    if (!form.title.trim()) {
      Alert.alert('标题不能为空');
      return;
    }
    if (!form.titleEn.trim()) {
      Alert.alert('英文标题不能为空', '英文标题将作为文件名，用于更好的路径兼容性。');
      return;
    }
    if (!form.bodyMarkdown.trim()) {
      Alert.alert('正文不能为空');
      return;
    }
    const html = generateArticleHtml(form);
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
    setPreparing(true);
    try {
      // 读取网站 style.css 内联到预览，真实渲染出网站视觉组件
      const css = await getSiteCss();
      const previewHtml = buildPreviewHtml(html, css);
      goPreview(previewHtml);
    } catch {
      // 样式加载失败时回退为无样式预览，不阻塞
      goPreview(html);
    } finally {
      setPreparing(false);
    }
  };

  const goPreview = (html: string) => {
    setGeneratedHtml(html);
    router.push('/compose/preview');
  };

  return (
    <View style={s.container}>
      {/* 分段切换 */}
      <View style={s.tabs}>
        <Pressable
          style={[s.tab, tab === 'meta' && s.tabActive]}
          onPress={() => setTab('meta')}
        >
          <Text style={[s.tabText, tab === 'meta' && s.tabTextActive]}>元数据</Text>
        </Pressable>
        <Pressable
          style={[s.tab, tab === 'body' && s.tabActive]}
          onPress={() => setTab('body')}
        >
          <Text style={[s.tabText, tab === 'body' && s.tabTextActive]}>正文</Text>
        </Pressable>
      </View>

      {/* 内容 */}
      <View style={s.content}>
        {tab === 'meta' ? <MetaForm /> : <MarkdownEditor />}
      </View>

      {/* 底部预览按钮 */}
      <View style={s.footer}>
        <Pressable style={[s.previewBtn, preparing && s.btnDisabled]} onPress={handlePreview} disabled={preparing}>
          <Text style={s.previewBtnText}>{preparing ? '加载网站样式…' : '生成预览'}</Text>
        </Pressable>
      </View>
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
    content: { flex: 1 },
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
