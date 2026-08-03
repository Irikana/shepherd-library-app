// 设置页：主题（浅色 / 深色 / 跟随系统）+ 站点配置管理（自定义分类 / 标签 / 上传目录）
// 0.0.7：新增「站点配置」——新增项同步到仓库 slywrite-config.json（真正意义上的创建，App 与网站共享）
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSettingsStore } from '../src/store/settings-store';
import { useConfigStore } from '../src/store/config-store';
import { SPACING, useTheme, type Palette, type ThemeMode } from '../src/theme';

const OPTIONS: { key: ThemeMode; label: string; desc: string }[] = [
  { key: 'system', label: '跟随系统', desc: '随系统外观设置自动切换' },
  { key: 'light', label: '浅色', desc: '始终使用浅色主题' },
  { key: 'dark', label: '深色', desc: '始终使用深色主题' },
];

export default function SettingsScreen() {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const { colors } = useTheme();
  const s = createStyles(colors);

  // 站点配置
  const categories = useConfigStore((st) => st.categories);
  const tags = useConfigStore((st) => st.tags);
  const uploadDirs = useConfigStore((st) => st.uploadDirs);
  const saving = useConfigStore((st) => st.saving);
  const syncError = useConfigStore((st) => st.syncError);
  const addCategory = useConfigStore((st) => st.addCategory);
  const removeCategory = useConfigStore((st) => st.removeCategory);
  const addTag = useConfigStore((st) => st.addTag);
  const removeTag = useConfigStore((st) => st.removeTag);
  const addUploadDir = useConfigStore((st) => st.addUploadDir);
  const removeUploadDir = useConfigStore((st) => st.removeUploadDir);

  // 新增表单
  const [catName, setCatName] = useState('');
  const [catEnName, setCatEnName] = useState('');
  const [catDir, setCatDir] = useState('');
  const [tagName, setTagName] = useState('');
  const [dirLabel, setDirLabel] = useState('');
  const [dirValue, setDirValue] = useState('');

  const confirmRemove = (msg: string, onConfirm: () => void) => {
    Alert.alert('确认删除', msg, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: onConfirm },
    ]);
  };

  const handleAddCategory = async () => {
    const res = await addCategory({ label: catName, enLabel: catEnName, dir: catDir });
    if (!res.ok) {
      Alert.alert('创建失败', res.error ?? '未知错误');
      return;
    }
    Alert.alert('创建成功', '新分类已同步到仓库与 library.html（中英文版）分类列表。');
    setCatName('');
    setCatEnName('');
    setCatDir('');
  };

  const handleAddTag = async () => {
    const res = await addTag(tagName);
    if (!res.ok) {
      Alert.alert('添加失败', res.error ?? '未知错误');
      return;
    }
    Alert.alert('添加成功', '新标签已同步到仓库，撰写文章时可选用。');
    setTagName('');
  };

  const handleAddUploadDir = async () => {
    const res = await addUploadDir(dirLabel, dirValue);
    if (!res.ok) {
      Alert.alert('添加失败', res.error ?? '未知错误');
      return;
    }
    Alert.alert('添加成功', '新目录已同步到仓库，图片上传时可选用。');
    setDirLabel('');
    setDirValue('');
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.sectionTitle}>主题</Text>
      <View style={s.optionGroup}>
        {OPTIONS.map((o) => {
          const active = themeMode === o.key;
          return (
            <Pressable
              key={o.key}
              style={[s.option, active && s.optionActive]}
              onPress={() => setThemeMode(o.key)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[s.optionLabel, active && s.optionLabelActive]}>{o.label}</Text>
                <Text style={s.optionDesc}>{o.desc}</Text>
              </View>
              {active && <Text style={s.optionMark}>已选</Text>}
            </Pressable>
          );
        })}
      </View>

      {/* 站点配置：分类 / 标签 / 上传目录 */}
      <Text style={s.sectionTitle}>站点配置</Text>
      <Text style={s.hint}>
        自定义分类、标签与上传目录会写入仓库根目录 slywrite-config.json，App 与网站共享，永久生效。
      </Text>
      {saving && <Text style={s.syncState}>正在同步仓库…</Text>}
      {syncError && <Text style={s.syncError}>上次同步失败：{syncError}</Text>}

      {/* 文章分类 */}
      <Text style={s.subTitle}>文章分类</Text>
      <View style={s.itemGroup}>
        {categories.map((c) => (
          <View key={c.key} style={s.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.itemLabel}>{c.label}</Text>
              <Text style={s.itemDesc}>library/{c.dir}/</Text>
            </View>
            <Text style={s.itemMark}>{c.key.startsWith('custom-') ? '自定义' : '内置'}</Text>
            {c.key.startsWith('custom-') && (
              <Pressable
                style={s.delBtn}
                onPress={() =>
                  confirmRemove(`删除分类「${c.label}」？已上传到该分类的文章将不再出现在 library.html 分类列表。`, () => {
                    removeCategory(c.key).then((res) => {
                      if (!res.ok) Alert.alert('删除失败', res.error ?? '未知错误');
                    });
                  })
                }
              >
                <Text style={s.delText}>删除</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>
      <View style={s.formRow}>
        <TextInput style={[s.input, s.inputHalf]} value={catName} onChangeText={setCatName} placeholder="分类名称（中文）" placeholderTextColor={colors.textLight} />
        <TextInput style={[s.input, s.inputHalf]} value={catEnName} onChangeText={setCatEnName} placeholder="英文名称（英文版）" placeholderTextColor={colors.textLight} autoCapitalize="none" />
      </View>
      <View style={s.formRow}>
        <TextInput style={[s.input, s.inputFlex]} value={catDir} onChangeText={setCatDir} placeholder="仓库目录（英文，如 my-category）" placeholderTextColor={colors.textLight} autoCapitalize="none" autoCorrect={false} />
        <Pressable style={s.addBtn} onPress={handleAddCategory} disabled={saving}>
          <Text style={s.addBtnText}>创建分类</Text>
        </Pressable>
      </View>

      {/* 标签 */}
      <Text style={s.subTitle}>标签</Text>
      <View style={s.itemGroup}>
        {tags.map((t) => (
          <View key={t} style={s.itemRow}>
            <Text style={s.itemLabel}>{t}</Text>
            <Text style={s.itemMark}>{['新闻', '小说', '包含AI', '有删减'].includes(t) ? '内置' : '自定义'}</Text>
            {!['新闻', '小说', '包含AI', '有删减'].includes(t) && (
              <Pressable
                style={s.delBtn}
                onPress={() =>
                  confirmRemove(`删除标签「${t}」？`, () => {
                    removeTag(t).then((res) => {
                      if (!res.ok) Alert.alert('删除失败', res.error ?? '未知错误');
                    });
                  })
                }
              >
                <Text style={s.delText}>删除</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>
      <View style={s.formRow}>
        <TextInput style={[s.input, s.inputFlex]} value={tagName} onChangeText={setTagName} placeholder="新标签名称" placeholderTextColor={colors.textLight} />
        <Pressable style={s.addBtn} onPress={handleAddTag} disabled={saving}>
          <Text style={s.addBtnText}>添加标签</Text>
        </Pressable>
      </View>

      {/* 上传目录 */}
      <Text style={s.subTitle}>上传目录（图片）</Text>
      <View style={s.itemGroup}>
        {uploadDirs.map((d) => (
          <View key={d.value} style={s.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.itemLabel}>{d.label}</Text>
              <Text style={s.itemDesc}>{d.value}</Text>
            </View>
            <Text style={s.itemMark}>
              {['image/poster/', 'image/', 'docs/paper-figures/'].includes(d.value) ? '内置' : '自定义'}
            </Text>
            {!['image/poster/', 'image/', 'docs/paper-figures/'].includes(d.value) && (
              <Pressable
                style={s.delBtn}
                onPress={() =>
                  confirmRemove(`删除目录「${d.label}」？`, () => {
                    removeUploadDir(d.value).then((res) => {
                      if (!res.ok) Alert.alert('删除失败', res.error ?? '未知错误');
                    });
                  })
                }
              >
                <Text style={s.delText}>删除</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>
      <View style={s.formRow}>
        <TextInput style={[s.input, s.inputHalf]} value={dirLabel} onChangeText={setDirLabel} placeholder="显示名（如 我的目录）" placeholderTextColor={colors.textLight} />
        <TextInput style={[s.input, s.inputHalf]} value={dirValue} onChangeText={setDirValue} placeholder="路径（如 image/my-dir/）" placeholderTextColor={colors.textLight} autoCapitalize="none" autoCorrect={false} />
      </View>
      <Pressable style={s.addBtnFull} onPress={handleAddUploadDir} disabled={saving}>
        <Text style={s.addBtnText}>添加上传目录</Text>
      </Pressable>

      <Text style={[s.sectionTitle, { marginTop: SPACING.lg }]}>关于</Text>
      <View style={s.aboutBox}>
        <Text style={s.aboutName}>SlyWrite</Text>
        <Text style={s.aboutDesc}>牧羊人图书馆 · 写作管理</Text>
        <Text style={s.aboutLine}>主题设置保存在本机；自定义分类/标签/目录同步到网站仓库。</Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgSubtle },
    content: { padding: SPACING.md, paddingBottom: SPACING.xl },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.textSecondary,
      marginBottom: SPACING.sm,
    },
    subTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.textSecondary,
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
    },
    hint: { fontSize: 12, color: COLORS.textLight, lineHeight: 18, marginBottom: SPACING.sm },
    syncState: { fontSize: 12, color: COLORS.accent, marginBottom: SPACING.sm },
    syncError: { fontSize: 12, color: COLORS.danger, marginBottom: SPACING.sm },
    optionGroup: {
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.bg,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    optionActive: { backgroundColor: COLORS.infoBg },
    optionLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    optionLabelActive: { color: COLORS.accent },
    optionDesc: { fontSize: 12, color: COLORS.textLight, marginTop: 3 },
    optionMark: { fontSize: 12, color: COLORS.accent, fontWeight: '600' },
    itemGroup: {
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.bg,
      marginBottom: SPACING.xs,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    itemLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    itemDesc: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
    itemMark: { fontSize: 11, color: COLORS.textLight, marginHorizontal: SPACING.sm },
    delBtn: {
      borderWidth: 1,
      borderColor: COLORS.danger,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    delText: { fontSize: 12, color: COLORS.danger, fontWeight: '600' },
    formRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.xs },
    input: {
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.sm,
      fontSize: 13,
      color: COLORS.text,
      backgroundColor: COLORS.bg,
    },
    inputHalf: { flex: 1 },
    inputFlex: { flex: 1 },
    addBtn: {
      borderWidth: 1,
      borderColor: COLORS.accent,
      paddingHorizontal: SPACING.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.bgSubtle,
    },
    addBtnFull: {
      borderWidth: 1,
      borderColor: COLORS.accent,
      padding: SPACING.sm + 2,
      alignItems: 'center',
      backgroundColor: COLORS.bgSubtle,
    },
    addBtnText: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
    aboutBox: {
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.bg,
      padding: SPACING.md,
    },
    aboutName: { fontSize: 16, fontWeight: '700', color: COLORS.accent },
    aboutDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
    aboutLine: { fontSize: 12, color: COLORS.textLight, marginTop: SPACING.sm, lineHeight: 18 },
  });
