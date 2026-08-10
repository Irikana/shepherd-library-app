// 知识词条预览与发布页：WebView 渲染词条页 + 发布（上传词条页 + 同步分类页列表）
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { HtmlPreview } from '../../src/components/HtmlPreview';
import { useKnowledgeStore } from '../../src/store/knowledge-store';
import { useDraftsStore } from '../../src/store/drafts-store';
import { generateKnowledgeEntryHtml, KNOWLEDGE_CATEGORIES } from '../../src/templates/knowledge-entry';
import { publishKnowledgeEntry } from '../../src/lib/knowledge-sync';
import { getSiteCss, buildPreviewHtml, PREVIEW_BASE_URL } from '../../src/lib/site-style';
import { SPACING, useTheme, type Palette } from '../../src/theme';

export default function KnowledgePreviewScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const { form, generatedHtml, draftId, setGeneratedHtml, reset } = useKnowledgeStore();
  const [uploading, setUploading] = useState(false);
  const [logVisible, setLogVisible] = useState(false);
  const [progressLogs, setProgressLogs] = useState<string[]>([]);

  const category = KNOWLEDGE_CATEGORIES[form.category];

  const handlePublish = async () => {
    if (uploading) return;
    const html = generatedHtml ?? generateKnowledgeEntryHtml(form);
    if (!html) return;
    setUploading(true);
    const steps: string[] = [];
    try {
      const result = await publishKnowledgeEntry({
        title: form.title.trim(),
        titleEn: form.titleEn.trim(),
        category: form.category,
        html,
      });
      steps.push(...result);
      // 发布成功后清理草稿
      if (draftId) useDraftsStore.getState().remove(draftId);
      reset();
    } catch (err) {
      steps.push(`发布失败：${(err as Error).message}`);
    } finally {
      setUploading(false);
      setProgressLogs(steps);
      setLogVisible(true);
    }
  };

  const handleDone = () => {
    setLogVisible(false);
    reset();
    router.replace('/');
  };

  const previewHtml = generatedHtml ?? generateKnowledgeEntryHtml(form);

  return (
    <View style={s.container}>
      <View style={s.categoryBox}>
        <Text style={s.categoryHint}>
          知识分类：{category.label} → knowledge-hall/categories/{form.category}/
        </Text>
      </View>

      <View style={s.preview}>
        <HtmlPreview html={previewHtml} baseUrl={PREVIEW_BASE_URL} />
      </View>

      {/* 底部操作 */}
      <View style={s.footer}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>返回修改</Text>
        </Pressable>
        <Pressable
          style={[s.publishBtn, uploading && s.btnDisabled]}
          onPress={handlePublish}
          disabled={uploading}
        >
          <Text style={s.publishBtnText}>{uploading ? '发布中…' : '发布知识词条'}</Text>
        </Pressable>
      </View>

      {/* 上传中遮罩 */}
      {uploading && (
        <View style={s.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={s.overlayText}>正在发布…</Text>
          <Text style={s.overlayHint}>请勿返回或重复操作</Text>
        </View>
      )}

      {/* 结果日志弹窗 */}
      <Modal visible={logVisible} transparent animationType="fade" onRequestClose={handleDone}>
        <View style={s.logOverlay}>
          <View style={s.logPanel}>
            <Text style={s.logTitle}>发布结果</Text>
            <ScrollView style={s.logScroll}>
              {progressLogs.map((msg, i) => (
                <Text key={i} style={[s.logItem, msg.startsWith('发布失败') || msg.includes('失败') ? s.logError : undefined]}>
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
    publishBtn: {
      flex: 2,
      backgroundColor: COLORS.accent,
      padding: SPACING.md,
      alignItems: 'center',
    },
    publishBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    btnDisabled: { opacity: 0.5 },
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
