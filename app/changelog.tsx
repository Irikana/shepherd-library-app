// 全部更新日志页：从 App 仓库 changelog/ 目录拉取所有版本的更新日志，按版本升序展示（最初 → 最新）
// 数据源：GitHub Contents API（base64 内容），带登录 Token 提升速率限制；
// 纯原生 Text 渲染，毛玻璃主题下保持半透明磨砂质感
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { APP_REPO_CONFIG, GITHUB_API } from '../src/lib/config';
import { getToken } from '../src/lib/auth';
import { compareVersions } from '../src/lib/releases';
import { SPACING, useTheme, type Palette } from '../src/theme';

type BlockKind = 'version' | 'section' | 'bullet';

interface VersionLog {
  key: string; // 0.0.15.3（排序/标识用）
  title: string; // 0.0.15.3（2026-08-31）
  blocks: { kind: BlockKind; text: string }[];
}

/** 从文件名提取版本号：CHANGELOG-0.0.15.3.md → 0.0.15.3 */
const verOf = (name: string) => name.replace(/^CHANGELOG-/, '').replace(/\.md$/, '');

/** 解析单个 changelog 文件为结构化块（跳过文件头标题与「与上一版本相比」说明行） */
function parseChangelog(md: string, key: string): VersionLog {
  const blocks: { kind: BlockKind; text: string }[] = [];
  let title = key;
  for (const raw of md.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('# SlyWrite 更新日志')) continue;
    if (line.startsWith('## ')) {
      title = line.slice(3).trim();
      blocks.push({ kind: 'version', text: title });
    } else if (line.startsWith('### ')) {
      blocks.push({ kind: 'section', text: line.slice(4).trim() });
    } else if (line.startsWith('- ')) {
      blocks.push({ kind: 'bullet', text: line.slice(2).trim() });
    }
  }
  return { key, title, blocks };
}

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<VersionLog[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch(
        `${GITHUB_API}/repos/${APP_REPO_CONFIG.owner}/${APP_REPO_CONFIG.repo}/contents/changelog`,
        { headers },
      );
      if (!res.ok) throw new Error(`获取更新日志失败（HTTP ${res.status}）`);
      const list = (await res.json()) as { name: string }[];
      const files = (list ?? [])
        .filter((f) => f.name?.startsWith('CHANGELOG-') && f.name.endsWith('.md'))
        .sort((a, b) => compareVersions(verOf(a.name), verOf(b.name))); // 升序：最初 → 最新

      const logs: VersionLog[] = [];
      for (const f of files) {
        const fileRes = await fetch(
          `${GITHUB_API}/repos/${APP_REPO_CONFIG.owner}/${APP_REPO_CONFIG.repo}/contents/changelog/${f.name}`,
          { headers },
        );
        if (!fileRes.ok) continue;
        const data = (await fileRes.json()) as { content?: string };
        if (!data.content) continue;
        const md = atob(data.content.replace(/\s/g, ''));
        logs.push(parseChangelog(md, verOf(f.name)));
      }
      setLogs(logs);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.sectionTitle}>全部更新日志</Text>
      <Text style={s.hint}>
        从最初版本到最新版本的完整迭代记录，与仓库 changelog/ 目录实时同步。
        {logs.length > 0 && ` 当前共收录 ${logs.length} 个版本。`}
      </Text>

      {loading ? (
        <View style={[s.box, s.centerBox]}>
          <ActivityIndicator color={colors.accent} />
          <Text style={s.hint}>正在加载更新日志…</Text>
        </View>
      ) : error ? (
        <View style={[s.box, s.centerBox]}>
          <Text style={s.errorText}>{error}</Text>
          <Pressable style={s.retryBtn} onPress={load} disabled={loading}>
            <Text style={s.retryText}>重试</Text>
          </Pressable>
        </View>
      ) : logs.length === 0 ? (
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
    errorText: { fontSize: 13, color: COLORS.danger, lineHeight: 19 },
    centerBox: { alignItems: 'center', paddingVertical: SPACING.lg },
    retryBtn: {
      borderWidth: 1,
      borderColor: COLORS.accent,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      marginTop: SPACING.md,
    },
    retryText: { color: COLORS.accent, fontWeight: '600', fontSize: 14 },
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
