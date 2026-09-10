// 标签颜色选择器：为任意标签（内置或自定义）选择颜色
// 选择结果写入站点配置 slywrite-config.json 的 tagColors，随配置同步到网站仓库；
// 未设置颜色的标签沿用主题默认色板（tag-colors.ts 说明）。
// 遵循全站扁平规范：无圆角、无 emoji。
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PRESET_TAG_COLORS, normalizeHex, tagChipStyle } from '../lib/tag-colors';
import { SPACING, useTheme, type Palette } from '../theme';

export interface TagColorPickerProps {
  visible: boolean;
  /** 正在设置颜色的标签名 */
  tagName: string;
  /** 当前颜色（#rrggbb），null/undefined 表示跟随主题默认 */
  current?: string | null;
  /** 选定颜色；传 null 表示清除自定义颜色 */
  onPick: (color: string | null) => void;
  onClose: () => void;
}

export function TagColorPicker({ visible, tagName, current, onPick, onClose }: TagColorPickerProps) {
  const { colors, isDark } = useTheme();
  const s = createStyles(colors);
  const [hex, setHex] = useState(current ?? '');
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (visible) {
      setHex(current ?? '');
      setInvalid(false);
    }
  }, [visible, current]);

  const pick = (color: string | null) => {
    onPick(color);
    onClose();
  };

  const applyCustom = () => {
    const norm = normalizeHex(hex);
    if (!norm) {
      setInvalid(true);
      return;
    }
    pick(norm);
  };

  const preview = tagChipStyle(current ?? null, isDark);
  const draftPreview = tagChipStyle(normalizeHex(hex), isDark);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <View style={s.header}>
            <Text style={s.title}>标签颜色</Text>
            <Pressable style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeText}>关闭</Text>
            </Pressable>
          </View>
          <Text style={s.subtitle}>标签：{tagName || '（未命名）'}</Text>

          <ScrollView style={s.body} contentContainerStyle={s.bodyContent}>
            <Text style={s.label}>当前效果</Text>
            <View style={s.previewRow}>
              <View
                style={[
                  s.previewChip,
                  preview
                    ? { borderColor: preview.borderColor, backgroundColor: preview.backgroundColor }
                    : s.previewChipDefault,
                ]}
              >
                <Text style={[s.previewText, preview ? { color: preview.textColor } : s.previewTextDefault]}>
                  {tagName || '标签'}
                </Text>
              </View>
              <Text style={s.previewHint}>{current ? `自定义 ${current}` : '跟随主题默认色'}</Text>
            </View>

            <Text style={s.label}>预设颜色</Text>
            <View style={s.grid}>
              {PRESET_TAG_COLORS.map((p) => {
                const st = tagChipStyle(p.value, isDark);
                const active = (current ?? '').toLowerCase() === p.value;
                return (
                  <Pressable
                    key={p.value}
                    style={[s.swatch, active && s.swatchActive]}
                    onPress={() => pick(p.value)}
                  >
                    <View style={[s.swatchFill, { backgroundColor: st?.backgroundColor ?? p.value }]}>
                      <View style={[s.swatchDot, { backgroundColor: p.value }]} />
                    </View>
                    <Text style={s.swatchLabel} numberOfLines={1}>
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={s.label}>自定义颜色</Text>
            <View style={s.hexRow}>
              <TextInput
                style={s.hexInput}
                value={hex}
                onChangeText={(v) => {
                  setHex(v);
                  setInvalid(false);
                }}
                placeholder="#rrggbb"
                placeholderTextColor={colors.textLight}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable style={s.applyBtn} onPress={applyCustom}>
                <Text style={s.applyText}>应用</Text>
              </Pressable>
            </View>
            {invalid && <Text style={s.errorText}>颜色格式不正确，请输入 6 位十六进制，如 #2c3e50</Text>}
            {!invalid && draftPreview && normalizeHex(hex) !== (current ?? '').toLowerCase() && (
              <View style={s.previewRow}>
                <View
                  style={[
                    s.previewChip,
                    {
                      borderColor: draftPreview.borderColor,
                      backgroundColor: draftPreview.backgroundColor,
                    },
                  ]}
                >
                  <Text style={[s.previewText, { color: draftPreview.textColor }]}>{tagName || '标签'}</Text>
                </View>
                <Text style={s.previewHint}>预览（与当前不同）</Text>
              </View>
            )}

            <Pressable style={s.resetBtn} onPress={() => pick(null)}>
              <Text style={s.resetText}>清除自定义颜色（跟随主题）</Text>
            </Pressable>
            <Text style={s.hint}>
              颜色会写入站点配置文件 slywrite-config.json，撰写页与文章页标签、以及后续上传的文章 HTML 都会使用该颜色。
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      padding: SPACING.lg,
    },
    sheet: {
      backgroundColor: COLORS.bg,
      borderWidth: 1,
      borderColor: COLORS.borderDark,
      maxHeight: '86%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm + 2,
      borderBottomWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.bgSubtle,
    },
    title: { fontSize: 15, fontWeight: '700', color: COLORS.text },
    closeBtn: { paddingHorizontal: SPACING.sm, paddingVertical: 4 },
    closeText: { fontSize: 13, color: COLORS.textSecondary },
    subtitle: {
      fontSize: 12,
      color: COLORS.textLight,
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.sm,
    },
    body: { paddingHorizontal: SPACING.md },
    bodyContent: { paddingVertical: SPACING.md, paddingBottom: SPACING.xl },
    label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginTop: SPACING.md, marginBottom: SPACING.sm },
    previewRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    previewChip: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
    previewChipDefault: { borderColor: COLORS.border, backgroundColor: COLORS.bgMuted },
    previewText: { fontSize: 13, fontWeight: '600' },
    previewTextDefault: { color: COLORS.textSecondary },
    previewHint: { fontSize: 12, color: COLORS.textLight, flexShrink: 1 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    swatch: { width: '21%', alignItems: 'center' },
    swatchActive: { borderWidth: 1, borderColor: COLORS.text, padding: 2, margin: -3 },
    swatchFill: {
      width: '100%',
      height: 34,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swatchDot: { width: 16, height: 16 },
    swatchLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 3 },
    hexRow: { flexDirection: 'row', gap: SPACING.xs },
    hexInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.sm,
      fontSize: 14,
      color: COLORS.text,
      backgroundColor: COLORS.bgSubtle,
      fontFamily: 'monospace',
    },
    applyBtn: {
      borderWidth: 1,
      borderColor: COLORS.accent,
      paddingHorizontal: SPACING.md,
      justifyContent: 'center',
      backgroundColor: COLORS.bgSubtle,
    },
    applyText: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
    errorText: { fontSize: 12, color: COLORS.danger, marginTop: SPACING.xs },
    resetBtn: {
      borderWidth: 1,
      borderColor: COLORS.borderDark,
      paddingVertical: SPACING.sm + 2,
      alignItems: 'center',
      marginTop: SPACING.lg,
      backgroundColor: COLORS.bgSubtle,
    },
    resetText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
    hint: { fontSize: 11, color: COLORS.textLight, lineHeight: 17, marginTop: SPACING.sm },
  });
