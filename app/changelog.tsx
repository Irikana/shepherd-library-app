// 全部更新日志页：静态内置展示所有版本的更新日志，按版本升序展示（最初 → 最新）
// 数据源：src/lib/changelog-data.ts（由 scripts/gen-changelog.js 从仓库 changelog/ 目录生成，随 App 发布内置，不联网）
// 纯原生 Text 渲染，行内支持 `代码` 与 **加粗** 片段
// 0.0.15.10：顶部新增可横向滑动的时间条——节点为菱形时间标记，进度线随当前版本平滑生长，
//            点击进入时有轻微弹性缩放；时间条与下方日志卡片双向联动（点节点跳卡片，滚卡片带节点）
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { CHANGELOG_DATA, type ChangelogEntry } from '../src/lib/changelog-data';
import { SPACING, useTheme, type Palette } from '../src/theme';

/** 时间条单个节点宽度（含间距），用于计算进度线与定位 */
const ITEM_W = 84;
/** 时间条内容左内边距 */
const PAD_L = 14;

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

/** 第 i 个节点中心相对时间条内容起点的横向距离 */
function nodeCenter(i: number): number {
  return PAD_L + i * ITEM_W + ITEM_W / 2;
}

export default function ChangelogScreen() {
  const { colors } = useTheme();
  const s = createStyles(colors);
  const logs: ChangelogEntry[] = CHANGELOG_DATA;
  const count = logs.length;

  const listRef = useRef<ScrollView>(null);
  const barRef = useRef<ScrollView>(null);
  /** 每张日志卡片相对内容容器顶部的 y 偏移（onLayout 采集） */
  const cardOffsets = useRef<number[]>([]);
  /** 时间条可视宽度（用于把当前节点保持可见） */
  const barWidth = useRef(0);
  const activeRef = useRef(0);

  const [active, setActive] = useState(0);
  /** 进度线与菱形游标共用的横向位置（px，JS 驱动以便同时动画 width） */
  const ringX = useRef(new Animated.Value(nodeCenter(0))).current;
  /** 点击节点时的弹性缩放 */
  const ringPop = useRef(new Animated.Value(1)).current;
  /** 入场淡入上移 */
  const enter = useRef(new Animated.Value(0)).current;

  const contentWidth = useMemo(() => PAD_L * 2 + Math.max(1, count) * ITEM_W, [count]);

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 380, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [enter]);

  /** 进度线宽度：从起点生长到当前节点中心（单版本时无需生长动画） */
  const progressWidth =
    count > 1
      ? ringX.interpolate({
          inputRange: [nodeCenter(0), nodeCenter(count - 1)],
          outputRange: [nodeCenter(0), nodeCenter(count - 1)],
          extrapolate: 'clamp',
        })
      : nodeCenter(0);

  /** 选中某个版本：更新游标 + 弹性反馈；fromBar 为真时同时滚动到对应卡片 */
  const focusIndex = useCallback(
    (i: number, fromBar: boolean) => {
      if (i < 0 || i >= count) return;
      activeRef.current = i;
      setActive(i);
      Animated.timing(ringX, { toValue: nodeCenter(i), duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
      if (fromBar) {
        ringPop.setValue(0.72);
        Animated.spring(ringPop, { toValue: 1, friction: 3.6, tension: 160, useNativeDriver: true }).start();
        const y = cardOffsets.current[i];
        if (typeof y === 'number') listRef.current?.scrollTo({ y: Math.max(0, y - 6), animated: true });
      } else {
        // 由列表滚动带动：让时间条跟着走，保证当前节点可见
        const viewW = barWidth.current || 320;
        const target = Math.max(0, nodeCenter(i) - viewW / 2);
        barRef.current?.scrollTo({ x: target, animated: true });
      }
    },
    [count, ringPop, ringX],
  );

  /** 纵向滚动时按卡片偏移定位当前版本（列表滚动 → 时间条联动） */
  const onListScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!count) return;
      const y = e.nativeEvent.contentOffset.y;
      const offs = cardOffsets.current;
      let idx = 0;
      for (let i = 0; i < offs.length; i++) {
        if (typeof offs[i] === 'number' && offs[i] - 24 <= y) idx = i;
      }
      if (idx !== activeRef.current) focusIndex(idx, false);
    },
    [count, focusIndex],
  );

  if (count === 0) {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <Text style={s.sectionTitle}>全部更新日志</Text>
        <View style={[s.box, s.centerBox]}>
          <Text style={s.hint}>暂无更新日志。版本发布后会自动收录。</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={s.container}>
      {/* 可滑动时间条 */}
      <Animated.View
        style={[
          s.barWrap,
          {
            opacity: enter,
            transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
          },
        ]}
      >
        <View style={s.barHeader}>
          <Text style={s.barTitle}>版本时间线</Text>
          <Text style={s.barCount}>共 {count} 个版本</Text>
        </View>
        <Animated.ScrollView
          ref={barRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          contentContainerStyle={s.barContent}
          onLayout={(e) => {
            barWidth.current = e.nativeEvent.layout.width;
          }}
        >
          <View style={[s.barTrack, { width: contentWidth }]}>
            <View style={s.trackLine} />
            <Animated.View style={[s.trackProgress, { width: progressWidth }]} />
            <Animated.View
              style={[
                s.trackCursor,
                { transform: [{ translateX: ringX }, { scale: ringPop }, { rotate: '45deg' }] },
              ]}
              pointerEvents="none"
            />
            {logs.map((log, i) => (
              <PressableItem
                key={log.key}
                width={ITEM_W}
                label={`v${log.key}`}
                active={i === active}
                first={i === 0}
                last={i === count - 1}
                onPress={() => focusIndex(i, true)}
              />
            ))}
          </View>
        </Animated.ScrollView>
        <Text style={s.barHint}>左右滑动查看更早或更新的版本，点击节点直接跳到该版本说明</Text>
      </Animated.View>

      <ScrollView
        ref={listRef}
        style={s.list}
        contentContainerStyle={s.content}
        onScroll={onListScroll}
        scrollEventThrottle={64}
      >
        <Text style={s.sectionTitle}>全部更新日志</Text>
        <Text style={s.hint}>
          从最初版本到最新版本的完整迭代记录，随 App 版本内置，无需联网。
          {` 当前共收录 ${count} 个版本。`}
        </Text>

        {logs.map((log, idx) => (
          <View
            key={log.key}
            style={[s.versionCard, idx === 0 && s.firstCard, idx === active && s.versionCardActive]}
            onLayout={(e) => {
              cardOffsets.current[idx] = e.nativeEvent.layout.y;
            }}
          >
            <View style={s.versionHeader}>
              <Text style={s.versionTag}>v{log.key}</Text>
              <Text style={s.versionTitle}>{log.title}</Text>
              {idx === active && <Text style={s.currentMark}>当前定位</Text>}
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
        ))}
      </ScrollView>
    </View>
  );
}

/** 时间条节点：菱形时间标记 + 版本号（扁平风格，无圆角） */
function PressableItem({
  width,
  label,
  active,
  first,
  last,
  onPress,
}: {
  width: number;
  label: string;
  active: boolean;
  first: boolean;
  last: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const s = createStyles(colors);
  return (
    <PressableCell width={width} onPress={onPress}>
      <View style={s.nodeDotWrap}>
        <View style={[s.nodeDot, active && s.nodeDotActive]} />
      </View>
      <Text style={[s.nodeLabel, active && s.nodeLabelActive, last && s.nodeLabelLast]} numberOfLines={1}>
        {label}
      </Text>
      {first && <Text style={s.nodeEdge}>最初</Text>}
      {last && <Text style={[s.nodeEdge, s.nodeEdgeRight]}>最新</Text>}
    </PressableCell>
  );
}

/** 节点外框（单独抽出，保持横向排列宽度稳定） */
function PressableCell({ width, onPress, children }: { width: number; onPress: () => void; children: React.ReactNode }) {
  const { colors } = useTheme();
  const s = createStyles(colors);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.nodeCell, { width }, pressed && s.nodeCellPressed]}>
      {children}
    </Pressable>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgSubtle },
    // 时间条
    barWrap: {
      backgroundColor: COLORS.bg,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      paddingTop: SPACING.sm,
    },
    barHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.xs,
    },
    barTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.5 },
    barCount: { fontSize: 11, color: COLORS.textLight },
    barContent: { paddingLeft: 0, paddingRight: SPACING.md },
    barTrack: { height: 66, justifyContent: 'flex-start' },
    trackLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 17,
      height: 1,
      backgroundColor: COLORS.borderDark,
    },
    trackProgress: {
      position: 'absolute',
      left: 0,
      top: 16,
      height: 3,
      backgroundColor: COLORS.accentLight,
    },
    trackCursor: {
      position: 'absolute',
      left: -7,
      top: 12,
      width: 14,
      height: 14,
      backgroundColor: COLORS.accent,
    },
    nodeCell: {
      alignItems: 'center',
      paddingTop: 8,
    },
    nodeCellPressed: { opacity: 0.6 },
    nodeDotWrap: { height: 20, alignItems: 'center', justifyContent: 'center' },
    nodeDot: {
      width: 8,
      height: 8,
      backgroundColor: COLORS.borderDark,
      transform: [{ rotate: '45deg' }],
    },
    nodeDotActive: { backgroundColor: COLORS.accent },
    nodeLabel: { fontSize: 11, color: COLORS.textLight, marginTop: 4, textAlign: 'center', maxWidth: ITEM_W - 6 },
    nodeLabelActive: { color: COLORS.accent, fontWeight: '700' },
    nodeLabelLast: { maxWidth: ITEM_W },
    nodeEdge: { fontSize: 10, color: COLORS.textLight, marginTop: 1 },
    nodeEdgeRight: { color: COLORS.accentLight },
    barHint: { fontSize: 11, color: COLORS.textLight, paddingHorizontal: SPACING.md, paddingBottom: 6 },
    // 日志卡片
    list: { flex: 1 },
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
    versionCardActive: {
      borderColor: COLORS.accentLight,
      borderTopColor: COLORS.accent,
      backgroundColor: COLORS.bg,
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
    currentMark: {
      fontSize: 10,
      color: COLORS.accent,
      borderWidth: 1,
      borderColor: COLORS.accentLight,
      paddingHorizontal: 4,
      paddingVertical: 1,
      marginLeft: SPACING.sm,
    },
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
