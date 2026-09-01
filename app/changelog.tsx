// 全部更新日志页：静态内置展示所有版本的更新日志，按版本升序展示（最初 → 最新）
// 数据源：src/lib/changelog-data.ts（由 scripts/gen-changelog.js 从仓库 changelog/ 目录生成，随 App 发布内置，不联网）
// 纯原生 Text 渲染，行内支持 `代码` 与 **加粗** 片段
import React from 'react';
import { ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { CHANGELOG_DATA, type ChangelogEntry } from '../src/lib/changelog-data';
import { SPACING, useTheme, type Palette } from '../src/theme';

/** 行内文本：支持 `代码` 与 **加粗** 片段 */
function InlineText({
  text,
  baseStyle,
  monoStyle,
}: {
  text: string;
  baseStyle: StyleProp<TextStyle>;
  monoStyle: StyleProp<TextStyle>;
}) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  if (parts.length <= 1) return <Text style={baseStyle}>{text}</Text>;
  return (
    <Text style={baseStyle}>
      {parts.map((p, i) => {
        if (p.length > 2 && p.startsWith('`') && p.endsWith('`')) {
          return (
            <Text key={i} style={monoStyle}>
              {p.slice(1, -1)}
            </Text>
          );
        }
        if (p.length > 4 && p.startsWith('**') && p.endsWith('**')) {
          return (
            <Text key={i} style={[baseStyle, { fontWeight: '700' }]}>
              {p.slice(2, -2)}
            </Text>
          );
        }
        return p;
      })}
    </Text>
  );
}

export default function ChangelogScreen() {
  const { colors } = useTheme();
  const s = createStyles(colors);
  const logs: ChangelogEntry[] = CHANGELOG_DATA;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.sectionTitle}>全部更新日志</Text>
      <Text style={s.hint}>
        从最初版本到最新版本的完整迭代记录，随 App 版本内置，无需联网。
        {logs.length > 0 && ` 当前共收录 ${logs.length} 个版本。`}
      </Text>

      {logs.length === 0 ? (
        <View style={[s.box, s.centerBox]}>
          <Text style={s.hint}>暂无更新日志。版本发布后会自动收录。</Text>
        </View>
      ) : (
        logs.map((log, idx) => (
          <View key={log.key} style={[s.versionCard, idx === 0 && s.firstCard]}>
            <View style={s.versionHeader}>
              <Text style={s.versionTag}>v{log.key}</Text>
              <Text style={s.versionTitle}>{log.title}</Text>
            </View>
            {log.blocks.map((b, i) => {
              if (b.kind === 'version') return null;
              if (b.kind === 'section') {
                return (
                  <Text key={i} style={s.sectionText}>
                    {b.text}
                  </Text>
                );
              }
              return (
                <View key={i} style={s.bulletRow}>
                  <Text style={s.bulletDot}>•</Text>
                  <View style={{ flex: 1 }}>
                    <InlineText text={b.text} baseStyle={s.bulletText} monoStyle={s.monoText} />
                  </View>
                </View>
              );
            })}
          </View>
        ))
      )}
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
    hint: { fontSize: 12, color: COLORS.textLight, lineHeight: 17, marginBottom: SPACING.sm },
    centerBox: { alignItems: 'center', paddingVertical: SPACING.lg },
    box: {
      backgroundColor: COLORS.bg,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      marginBottom: SPACING.md,
    },
    versionCard: {
      backgroundColor: COLORS.bg,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderTopWidth: 2,
      borderTopColor: COLORS.accentLight,
    },
    firstCard: { marginTop: SPACING.xs },
    versionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.sm,
      flexWrap: 'wrap',
    },
    versionTag: {
      fontSize: 15,
      fontWeight: '700',
      color: '#fff',
      backgroundColor: COLORS.accent,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginRight: SPACING.sm,
    },
    versionTitle: { fontSize: 13, color: COLORS.textSecondary, flexShrink: 1 },
    sectionText: {
      fontSize: 13,
      fontWeight: '700',
      color: COLORS.accent,
      marginTop: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    bulletRow: { flexDirection: 'row', marginBottom: SPACING.sm, alignItems: 'flex-start' },
    bulletDot: { color: COLORS.accentLight, fontSize: 13, marginRight: SPACING.xs, lineHeight: 21 },
    bulletText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 21, flex: 1 },
    monoText: {
      fontFamily: 'monospace',
      fontSize: 12,
      color: COLORS.accent,
      backgroundColor: COLORS.bgMuted,
      paddingHorizontal: 3,
    },
  });
