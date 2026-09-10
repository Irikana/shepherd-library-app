// 设置页：主题（浅色 / 深色 / 跟随系统 / 温和主题）+ 站点配置管理（自定义分类 / 标签与标签颜色 / 上传目录 / 网站联系方式）
// 0.0.7：新增「站点配置」——新增项同步到仓库 slywrite-config.json（真正意义上的创建，App 与网站共享）
// 0.0.15.5：移除「毛玻璃」主题，新增「暖米 / 雾蓝 / 森绿」三个温和主题
// 0.0.15.10：标签颜色可设置（内置与自定义标签均可）；新增「网站联系方式」编辑（网站冻结顶栏读取）
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSettingsStore } from '../src/store/settings-store';
import { useConfigStore } from '../src/store/config-store';
import { TagColorPicker } from '../src/components/TagColorPicker';
import { DEFAULT_CONTACT_CHANNELS, type ContactChannel } from '../src/lib/site-config';
import { tagChipStyle } from '../src/lib/tag-colors';
import { SPACING, useTheme, type Palette, type ThemeMode } from '../src/theme';

/** TagColorPicker 的目标为「即将新建的标签」时的哨兵值 */
const NEW_TAG = '__new__';

const BUILTIN_TAGS = ['新闻', '小说', '包含AI', '有删减'];

const OPTIONS: { key: ThemeMode; label: string; desc: string }[] = [
  { key: 'system', label: '跟随系统', desc: '随系统外观设置自动切换' },
  { key: 'light', label: '浅色', desc: '始终使用浅色主题' },
  { key: 'dark', label: '深色', desc: '始终使用深色主题' },
  { key: 'warm', label: '暖米', desc: '柔和纸感米白，温和不刺眼' },
  { key: 'mist', label: '雾蓝', desc: '静谧灰蓝，低饱和柔和' },
  { key: 'sage', label: '森绿', desc: '淡雅护眼绿，清新温和' },
  { key: 'sunset', label: '日暮', desc: '暖色夕阳橙粉，如晚霞般柔和' },
  { key: 'ocean', label: '海洋', desc: '深邃蓝调，如深海般静谧' },
  { key: 'lavender', label: '薰衣草', desc: '淡紫柔和，如薰衣草田般浪漫' },
  { key: 'coffee', label: '咖啡', desc: '深棕温润，如咖啡香气般醇厚' },
  { key: 'mint', label: '薄荷', desc: '清新绿调，如晨露般清爽' },
];

export default function SettingsScreen() {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const { colors, isDark } = useTheme();
  const s = createStyles(colors);

  // 站点配置
  const categories = useConfigStore((st) => st.categories);
  const tags = useConfigStore((st) => st.tags);
  const tagColors = useConfigStore((st) => st.tagColors);
  const uploadDirs = useConfigStore((st) => st.uploadDirs);
  const contact = useConfigStore((st) => st.contact);
  const loaded = useConfigStore((st) => st.loaded);
  const saving = useConfigStore((st) => st.saving);
  const syncError = useConfigStore((st) => st.syncError);
  const addCategory = useConfigStore((st) => st.addCategory);
  const removeCategory = useConfigStore((st) => st.removeCategory);
  const addTag = useConfigStore((st) => st.addTag);
  const removeTag = useConfigStore((st) => st.removeTag);
  const setTagColor = useConfigStore((st) => st.setTagColor);
  const addUploadDir = useConfigStore((st) => st.addUploadDir);
  const removeUploadDir = useConfigStore((st) => st.removeUploadDir);
  const saveContact = useConfigStore((st) => st.saveContact);

  // 新增表单
  const [catName, setCatName] = useState('');
  const [catEnName, setCatEnName] = useState('');
  const [catDir, setCatDir] = useState('');
  const [tagName, setTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<string | null>(null);
  const [dirLabel, setDirLabel] = useState('');
  const [dirValue, setDirValue] = useState('');
  /** 正在设置颜色的标签名（NEW_TAG 表示新建标签的颜色） */
  const [colorTarget, setColorTarget] = useState<string | null>(null);

  // 网站联系方式草稿（站点配置加载后初始化；保存时整组写回）
  const [contactDraft, setContactDraft] = useState<ContactChannel[]>(DEFAULT_CONTACT_CHANNELS);
  const [contactDirty, setContactDirty] = useState(false);
  useEffect(() => {
    if (loaded && !contactDirty) setContactDraft(contact.length > 0 ? contact : DEFAULT_CONTACT_CHANNELS);
  }, [loaded, contact, contactDirty]);

  const patchContact = (idx: number, patch: Partial<ContactChannel>) => {
    setContactDirty(true);
    setContactDraft((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const addContactChannel = () => {
    setContactDirty(true);
    setContactDraft((prev) => [...prev, { key: `custom-${prev.length + 1}`, label: '', value: '', url: '', note: '' }]);
  };

  const removeContactChannel = (idx: number) => {
    setContactDirty(true);
    setContactDraft((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveContact = async () => {
    const res = await saveContact(contactDraft);
    if (!res.ok) {
      Alert.alert('保存失败', res.error ?? '未知错误');
      return;
    }
    setContactDirty(false);
    Alert.alert('已保存', '联系方式已写入站点配置 slywrite-config.json，网站顶栏约 1-2 分钟后生效。');
  };

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
    const res = await addTag(tagName, newTagColor);
    if (!res.ok) {
      Alert.alert('添加失败', res.error ?? '未知错误');
      return;
    }
    Alert.alert('添加成功', newTagColor ? '新标签已同步到仓库，并使用了你设置的颜色。' : '新标签已同步到仓库，撰写文章时可选用。');
    setTagName('');
    setNewTagColor(null);
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

  /** 标签色点：已设颜色显示实心色块，未设置显示空心（跟随主题） */
  const renderColorDot = (name: string, color: string | null | undefined, onPress: () => void) => {
    const chip = tagChipStyle(color ?? null, isDark);
    return (
      <Pressable
        style={[s.colorDot, chip ? { borderColor: chip.borderColor, backgroundColor: chip.backgroundColor } : s.colorDotEmpty]}
        onPress={onPress}
        accessibilityLabel={`设置标签 ${name} 的颜色`}
      >
        {chip ? <View style={[s.colorDotInner, { backgroundColor: color ?? undefined }]} /> : <Text style={s.colorDotText}>色</Text>}
      </Pressable>
    );
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

      {/* 标签（含标签颜色设置） */}
      <Text style={s.subTitle}>标签</Text>
      <Text style={s.hint}>点右侧色块可为任意标签（含内置标签）设置颜色；不设置则跟随主题默认色。颜色同步到站点配置。</Text>
      <View style={s.itemGroup}>
        {tags.map((t) => (
          <View key={t} style={s.itemRow}>
            <Text style={s.itemLabel}>{t}</Text>
            <Text style={s.itemMark}>{BUILTIN_TAGS.includes(t) ? '内置' : '自定义'}</Text>
            {renderColorDot(t, tagColors[t], () => setColorTarget(t))}
            {!BUILTIN_TAGS.includes(t) && (
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
        {renderColorDot(tagName || '新标签', newTagColor, () => setColorTarget(NEW_TAG))}
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

      {/* 网站联系方式（供网站冻结顶栏「联系」下拉菜单读取） */}
      <Text style={s.subTitle}>网站联系方式</Text>
      <Text style={s.hint}>
        这些内容会写入站点配置 slywrite-config.json，显示在网站顶部冻结栏的「联系」下拉菜单中。留空的项在网站上只显示名称。
      </Text>
      {contactDraft.map((c, idx) => (
        <View key={`${c.key}-${idx}`} style={s.contactBox}>
          <View style={s.contactHead}>
            <Text style={s.contactTitle}>{c.label || c.key}</Text>
            <Pressable style={s.delBtn} onPress={() => removeContactChannel(idx)}>
              <Text style={s.delText}>移除</Text>
            </Pressable>
          </View>
          <View style={s.formRow}>
            <TextInput style={[s.input, s.inputHalf]} value={c.label} onChangeText={(v) => patchContact(idx, { label: v })} placeholder="显示名（如 QQ）" placeholderTextColor={colors.textLight} />
            <TextInput style={[s.input, s.inputHalf]} value={c.key} onChangeText={(v) => patchContact(idx, { key: v })} placeholder="标识（qq / wechat / facebook / mail）" placeholderTextColor={colors.textLight} autoCapitalize="none" autoCorrect={false} />
          </View>
          <TextInput style={[s.input, s.inputGap]} value={c.value} onChangeText={(v) => patchContact(idx, { value: v })} placeholder="展示值（号码 / 微信号 / 昵称，可留空）" placeholderTextColor={colors.textLight} autoCapitalize="none" autoCorrect={false} />
          <TextInput style={[s.input, s.inputGap]} value={c.url} onChangeText={(v) => patchContact(idx, { url: v })} placeholder="链接（https://… ，可留空）" placeholderTextColor={colors.textLight} autoCapitalize="none" autoCorrect={false} keyboardType="url" />
          <TextInput style={[s.input, s.inputGap]} value={c.note} onChangeText={(v) => patchContact(idx, { note: v })} placeholder="备注（如：加好友请注明来意）" placeholderTextColor={colors.textLight} multiline />
        </View>
      ))}
      <View style={s.formRow}>
        <Pressable style={s.addBtnHalf} onPress={addContactChannel}>
          <Text style={s.addBtnText}>添加渠道</Text>
        </Pressable>
        <Pressable style={[s.addBtnHalf, !contactDirty && s.btnDisabled]} onPress={handleSaveContact} disabled={saving || !contactDirty}>
          <Text style={s.addBtnText}>{saving ? '保存中…' : '保存联系方式'}</Text>
        </Pressable>
      </View>
      {contactDirty && <Text style={s.syncState}>有未保存的联系方式修改。</Text>}

      <Text style={[s.sectionTitle, { marginTop: SPACING.lg }]}>关于</Text>
      <View style={s.aboutBox}>
        <Text style={s.aboutName}>SlyWrite</Text>
        <Text style={s.aboutDesc}>牧羊人图书馆 · 写作管理</Text>
        <Text style={s.aboutLine}>主题设置保存在本机；自定义分类、标签与标签颜色、上传目录、联系方式同步到网站仓库。</Text>
      </View>

      <TagColorPicker
        visible={colorTarget !== null}
        tagName={colorTarget === NEW_TAG ? tagName : colorTarget ?? ''}
        current={colorTarget === NEW_TAG ? newTagColor : colorTarget ? tagColors[colorTarget] : null}
        onPick={(color) => {
          if (colorTarget === NEW_TAG) {
            setNewTagColor(color);
            return;
          }
          if (!colorTarget) return;
          setTagColor(colorTarget, color).then((res) => {
            if (!res.ok) Alert.alert('设置失败', res.error ?? '未知错误');
          });
        }}
        onClose={() => setColorTarget(null)}
      />
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
    colorDot: {
      width: 28,
      height: 28,
      borderWidth: 1,
      borderColor: COLORS.borderDark,
      backgroundColor: COLORS.bgMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: SPACING.sm,
    },
    colorDotEmpty: { backgroundColor: COLORS.bgSubtle },
    colorDotInner: { width: 14, height: 14 },
    colorDotText: { fontSize: 11, color: COLORS.textLight },
    contactBox: {
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.bg,
      padding: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    contactHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xs },
    contactTitle: { fontSize: 13, fontWeight: '700', color: COLORS.accent },
    addBtnHalf: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.accent,
      paddingVertical: SPACING.sm + 2,
      alignItems: 'center',
      backgroundColor: COLORS.bgSubtle,
    },
    btnDisabled: { opacity: 0.5 },
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
    inputGap: { marginTop: SPACING.xs },
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
