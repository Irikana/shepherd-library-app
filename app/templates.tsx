import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTemplatesStore, type EditorTemplate } from '../src/store/templates-store';
import { SPACING, useTheme, type Palette } from '../src/theme';

export default function TemplatesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = createStyles(colors);

  const templates = useTemplatesStore((st) => st.templates);
  const addTemplate = useTemplatesStore((st) => st.addTemplate);
  const updateTemplate = useTemplatesStore((st) => st.updateTemplate);
  const deleteTemplate = useTemplatesStore((st) => st.deleteTemplate);
  const resetToDefaults = useTemplatesStore((st) => st.resetToDefaults);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formContent, setFormContent] = useState('');

  const openNewModal = () => {
    setEditingId(null);
    setFormTitle('');
    setFormDesc('');
    setFormContent('');
    setModalVisible(true);
  };

  const openEditModal = (t: EditorTemplate) => {
    setEditingId(t.id);
    setFormTitle(t.title);
    setFormDesc(t.description || '');
    setFormContent(t.content);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      if (Platform.OS === 'web') {
        window.alert('请输入模板名称');
      } else {
        Alert.alert('提示', '请输入模板名称');
      }
      return;
    }
    if (editingId) {
      await updateTemplate(editingId, formTitle, formContent, formDesc);
    } else {
      await addTemplate(formTitle, formContent, formDesc);
    }
    setModalVisible(false);
  };

  const handleDelete = (t: EditorTemplate) => {
    const confirmAction = async () => {
      await deleteTemplate(t.id);
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`确定删除模板「${t.title}」吗？`)) {
        confirmAction();
      }
    } else {
      Alert.alert('删除模板', `确定删除模板「${t.title}」吗？`, [
        { text: '取消', style: 'cancel' },
        { text: '删除', style: 'destructive', onPress: confirmAction },
      ]);
    }
  };

  const handleReset = () => {
    const confirmAction = async () => {
      await resetToDefaults();
    };
    if (Platform.OS === 'web') {
      if (window.confirm('确定要恢复为默认模板列表吗？自定义模板将被覆盖。')) {
        confirmAction();
      }
    } else {
      Alert.alert('恢复预设', '确定要恢复为默认模板列表吗？自定义模板将被覆盖。', [
        { text: '取消', style: 'cancel' },
        { text: '恢复预设', style: 'destructive', onPress: confirmAction },
      ]);
    }
  };

  return (
    <View style={s.container}>
      <Stack.Screen
        options={{
          title: '模板管理',
          headerRight: () => (
            <Pressable style={s.headerBtn} onPress={openNewModal}>
              <Text style={s.headerBtnText}>+ 新建</Text>
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <View style={s.introBox}>
            <Text style={s.introText}>
              管理正文编辑时的习惯格式与自定义片段。编辑正文时点击「模板」菜单即可一键插入。模板中用 § 标记插入后的光标落点。
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardMain}>
              <View style={s.cardHead}>
                <Text style={s.cardTitle}>{item.title}</Text>
                <Text style={s.cardDate}>{item.updatedAt}</Text>
              </View>
              {item.description ? (
                <Text style={s.cardDesc}>{item.description}</Text>
              ) : null}
              <Text style={s.cardPreview} numberOfLines={3}>
                {item.content}
              </Text>
            </View>
            <View style={s.cardActions}>
              <Pressable style={s.actionBtn} onPress={() => openEditModal(item)}>
                <Text style={s.actionBtnText}>编辑</Text>
              </Pressable>
              <Pressable style={[s.actionBtn, s.deleteBtn]} onPress={() => handleDelete(item)}>
                <Text style={[s.actionBtnText, s.deleteBtnText]}>删除</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={s.footer}>
            <Pressable style={s.resetBtn} onPress={handleReset}>
              <Text style={s.resetBtnText}>恢复内置预设模板</Text>
            </Pressable>
          </View>
        }
      />

      {/* 新建/编辑模板弹窗 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalDialog}>
            <Text style={s.modalTitle}>
              {editingId ? '编辑模板' : '新建模板'}
            </Text>
            <ScrollView style={s.modalScroll} keyboardShouldPersistTaps="handled">
              <Text style={s.fieldLabel}>模板名称</Text>
              <TextInput
                style={s.textInput}
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder="例如：采访记录 / 观察随笔"
                placeholderTextColor={colors.textLight}
              />

              <Text style={s.fieldLabel}>说明描述（可选）</Text>
              <TextInput
                style={s.textInput}
                value={formDesc}
                onChangeText={setFormDesc}
                placeholder="简要描述模板结构或使用场景"
                placeholderTextColor={colors.textLight}
              />

              <Text style={s.fieldLabel}>模板正文内容</Text>
              <Text style={s.fieldHint}>
                支持 Markdown 与 HTML，内容中的 § 符号表示插入时光标停留的位置。
              </Text>
              <TextInput
                style={[s.textInput, s.contentInput]}
                value={formContent}
                onChangeText={setFormContent}
                placeholder="在此输入模板正文..."
                placeholderTextColor={colors.textLight}
                multiline
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={s.modalActions}>
              <Pressable style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelBtnText}>取消</Text>
              </Pressable>
              <Pressable style={s.saveBtn} onPress={handleSave}>
                <Text style={s.saveBtnText}>保存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.bg,
    },
    headerBtn: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
    },
    headerBtnText: {
      color: COLORS.accent,
      fontSize: 14,
      fontWeight: '600',
    },
    listContent: {
      padding: SPACING.md,
    },
    introBox: {
      backgroundColor: COLORS.bgSubtle,
      borderLeftWidth: 3,
      borderLeftColor: COLORS.accent,
      padding: SPACING.md,
      marginBottom: SPACING.md,
    },
    introText: {
      fontSize: 13,
      lineHeight: 20,
      color: COLORS.textSecondary,
    },
    card: {
      backgroundColor: COLORS.bgSubtle,
      borderWidth: 1,
      borderColor: COLORS.border,
      marginBottom: SPACING.md,
    },
    cardMain: {
      padding: SPACING.md,
    },
    cardHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.xs,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.text,
      flex: 1,
    },
    cardDate: {
      fontSize: 12,
      color: COLORS.textLight,
      marginLeft: SPACING.sm,
    },
    cardDesc: {
      fontSize: 13,
      color: COLORS.textSecondary,
      marginBottom: SPACING.sm,
    },
    cardPreview: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 12,
      lineHeight: 18,
      color: COLORS.textLight,
      backgroundColor: COLORS.bg,
      padding: SPACING.sm,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    cardActions: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
    },
    actionBtn: {
      flex: 1,
      paddingVertical: SPACING.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionBtnText: {
      fontSize: 13,
      color: COLORS.textSecondary,
    },
    deleteBtn: {
      borderLeftWidth: 1,
      borderLeftColor: COLORS.border,
    },
    deleteBtnText: {
      color: COLORS.danger,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: SPACING.lg,
    },
    resetBtn: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    resetBtnText: {
      fontSize: 12,
      color: COLORS.textLight,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.md,
    },
    modalDialog: {
      width: '100%',
      maxWidth: 500,
      maxHeight: '85%',
      backgroundColor: COLORS.bg,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.lg,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: SPACING.md,
    },
    modalScroll: {
      maxHeight: 400,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.text,
      marginTop: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    fieldHint: {
      fontSize: 11,
      color: COLORS.textLight,
      marginBottom: SPACING.xs,
    },
    textInput: {
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.bgSubtle,
      color: COLORS.text,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      fontSize: 14,
    },
    contentInput: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      height: 180,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: SPACING.sm,
      marginTop: SPACING.md,
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
    },
    cancelBtn: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    cancelBtnText: {
      fontSize: 14,
      color: COLORS.textSecondary,
    },
    saveBtn: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      backgroundColor: COLORS.accent,
    },
    saveBtnText: {
      fontSize: 14,
      color: '#fff',
      fontWeight: '600',
    },
  });
