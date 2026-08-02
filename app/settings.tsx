// 设置页：主题（浅色 / 深色 / 跟随系统）
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSettingsStore } from '../src/store/settings-store';
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
      <Text style={s.hint}>
        浅色主题下 logo 将切换为黑色版本，深色主题下保持白色，确保在不同背景下清晰可见。
      </Text>

      <Text style={[s.sectionTitle, { marginTop: SPACING.lg }]}>关于</Text>
      <View style={s.aboutBox}>
        <Text style={s.aboutName}>SlyWrite</Text>
        <Text style={s.aboutDesc}>牧羊人图书馆 · 写作管理</Text>
        <Text style={s.aboutLine}>主题设置保存在本机，下次启动自动生效。</Text>
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
    hint: {
      fontSize: 12,
      color: COLORS.textLight,
      lineHeight: 18,
      marginTop: SPACING.sm,
    },
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
