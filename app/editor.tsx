// 文本文件编辑器：查看/编辑/保存仓库中的文本文件，支持新建文件
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { putFile, getFile } from '../src/lib/github-client';
import { useEditorStore } from '../src/store/editor-store';
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

export default function EditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ path?: string; name?: string }>();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const {
    path,
    name,
    content,
    sha,
    isNew,
    dirty,
    load,
    loadNew,
    setContent,
    markSaved,
  } = useEditorStore();
  const [saving, setSaving] = useState(false);
  const [newDir, setNewDir] = useState(NEW_FILE_ROOTS[0].value);
  const [newFileName, setNewFileName] = useState('');
  const inputRef = useRef<TextInput>(null);

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
    setSaving(true);
    try {
      await putFile(targetPath, content, {
        sha: isNew ? undefined : (sha ?? undefined),
        message: isNew ? `新建文件：${targetPath}（移动端 App）` : `编辑文件：${targetPath}（移动端 App）`,
      });
      markSaved(targetPath, null);
      setSaving(false);
      Alert.alert(
        '保存成功',
        `文件：${targetPath}\n\n约 1-2 分钟后网站生效。`,
        [{ text: '完成' }],
      );
    } catch (err) {
      setSaving(false);
      Alert.alert('保存失败', (err as Error).message);
    }
  };

  const handleBack = () => {
    if (dirty) {
      Alert.alert('放弃修改？', '当前文件有未保存的修改，返回将丢失。', [
        { text: '继续编辑', style: 'cancel' },
        { text: '放弃', style: 'destructive', onPress: () => router.back() },
      ]);
      return;
    }
    router.back();
  };

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
          {isNew ? '新建模式' : dirty ? '已修改' : '已保存'}
        </Text>
      </View>

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

      {/* 编辑器 */}
      <ScrollView style={s.editorScroll} keyboardShouldPersistTaps="handled">
        <TextInput
          ref={inputRef}
          style={s.editor}
          value={content}
          onChangeText={setContent}
          placeholder="在此编辑文件内容…"
          placeholderTextColor={colors.textLight}
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={isNew}
        />
      </ScrollView>

      {/* 底部操作 */}
      <View style={s.footer}>
        <Pressable style={s.backBtn} onPress={handleBack}>
          <Text style={s.backText}>返回</Text>
        </Pressable>
        <Pressable
          style={[s.saveBtn, (saving || (!dirty && !isNew)) && s.btnDisabled]}
          onPress={handleSave}
          disabled={saving || (!dirty && !isNew)}
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
    editorScroll: { flex: 1 },
    editor: {
      flexGrow: 1,
      padding: SPACING.md,
      fontSize: 14,
      lineHeight: 21,
      fontFamily: 'monospace',
      color: COLORS.text,
      backgroundColor: COLORS.bg,
      textAlignVertical: 'top',
      minHeight: 200,
    },
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
