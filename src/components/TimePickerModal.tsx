// 录音时长选择器：三个可拖动的轮播数字盘（时/分/秒）
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SPACING, useTheme, type Palette } from '../theme';

interface TimePickerModalProps {
  visible: boolean;
  /** 当前值，支持 "MM:SS" 或 "H:MM:SS" */
  value: string;
  onConfirm: (duration: string) => void;
  onCancel: () => void;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

/** 解析 "MM:SS" / "H:MM:SS" → {h,m,s} */
function parseDuration(str: string): { h: number; m: number; s: number } {
  const parts = str.trim().split(':').map((p) => parseInt(p, 10));
  const nums = parts.filter((n) => !Number.isNaN(n));
  if (nums.length === 3) return { h: nums[0], m: nums[1], s: nums[2] };
  if (nums.length === 2) return { h: 0, m: nums[0], s: nums[1] };
  return { h: 0, m: 0, s: 0 };
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDuration(h: number, m: number, s: number): string {
  const hh = h > 0 ? `${h}:` : '';
  return `${hh}${pad2(m)}:${pad2(s)}`;
}

const NUMBERS_HOURS = Array.from({ length: 24 }, (_, i) => i);
const NUMBERS_60 = Array.from({ length: 60 }, (_, i) => i);

interface WheelProps {
  values: number[];
  selected: number;
  onSelect: (v: number) => void;
  colors: Palette;
}

/** 单个数字轮盘：可拖动，滚动结束后吸附到最近数字 */
function Wheel({ values, selected, onSelect, colors }: WheelProps) {
  const s = createStyles(colors);
  const scrollRef = useRef<ScrollView>(null);
  const contentHeight = values.length * ITEM_HEIGHT;
  const pad = ((VISIBLE_ITEMS - 1) * ITEM_HEIGHT) / 2;

  // 打开/值变化时定位到当前值
  useEffect(() => {
    const index = values.indexOf(selected);
    if (index >= 0) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, selected]);

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(values.length - 1, index));
    const v = values[clamped];
    if (v !== undefined && v !== selected) onSelect(v);
  };

  return (
    <View style={[s.wheel, { height: VISIBLE_ITEMS * ITEM_HEIGHT }]}>
      {/* 中间选中框 */}
      <View pointerEvents="none" style={[s.wheelSelector, { top: pad }]} />
      {/* 上下渐隐遮罩 */}
      <View pointerEvents="none" style={[s.wheelFade, { height: pad, top: 0 }]} />
      <View pointerEvents="none" style={[s.wheelFade, { height: pad, bottom: 0 }]} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={settle}
        onScrollEndDrag={settle}
        contentContainerStyle={{ paddingVertical: pad }}
      >
        {values.map((v) => (
          <Pressable
            key={v}
            style={{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => {
              onSelect(v);
              scrollRef.current?.scrollTo({ y: v * ITEM_HEIGHT, animated: true });
            }}
          >
            <Text style={[s.wheelItem, v === selected && s.wheelItemActive]}>{v}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export function TimePickerModal({ visible, value, onConfirm, onCancel }: TimePickerModalProps) {
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);

  useEffect(() => {
    if (visible) {
      const { h, m, s: sec } = parseDuration(value);
      setHour(h);
      setMinute(m);
      setSecond(sec);
    }
  }, [visible, value]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.overlay}>
        <View style={s.panel}>
          <Text style={s.title}>录音时长</Text>

          {/* 当前值显示 */}
          <View style={s.valueRow}>
            <Text style={s.valueText}>{pad2(hour)}</Text>
            <Text style={s.colon}>:</Text>
            <Text style={s.valueText}>{pad2(minute)}</Text>
            <Text style={s.colon}>:</Text>
            <Text style={s.valueText}>{pad2(second)}</Text>
          </View>

          {/* 轮盘 */}
          <View style={s.wheelsRow}>
            <Wheel values={NUMBERS_HOURS} selected={hour} onSelect={setHour} colors={colors} />
            <Text style={s.wheelColon}>:</Text>
            <Wheel values={NUMBERS_60} selected={minute} onSelect={setMinute} colors={colors} />
            <Text style={s.wheelColon}>:</Text>
            <Wheel values={NUMBERS_60} selected={second} onSelect={setSecond} colors={colors} />
          </View>
          <View style={s.unitRow}>
            <Text style={[s.unitText, { flex: 1 }]}>时</Text>
            <Text style={[s.unitText, { flex: 1 }]}>分</Text>
            <Text style={[s.unitText, { flex: 1 }]}>秒</Text>
          </View>

          <Text style={s.hint}>上下拖动数字轮盘选择，点击数字可直接定位</Text>

          {/* 底部操作 */}
          <View style={s.footer}>
            <Pressable
              style={s.footerBtn}
              onPress={() => {
                setHour(0);
                setMinute(0);
                setSecond(0);
              }}
            >
              <Text style={s.footerText}>清零</Text>
            </Pressable>
            <Pressable style={[s.footerBtn, s.cancelBtn]} onPress={onCancel}>
              <Text style={[s.footerText, s.cancelText]}>取消</Text>
            </Pressable>
            <Pressable
              style={[s.footerBtn, s.confirmBtn]}
              onPress={() => onConfirm(formatDuration(hour, minute, second))}
            >
              <Text style={[s.footerText, s.confirmText]}>确定</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      padding: SPACING.lg,
    },
    panel: {
      backgroundColor: COLORS.bg,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      alignItems: 'center',
    },
    title: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
    valueRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    valueText: {
      fontSize: 30,
      fontWeight: '700',
      color: COLORS.text,
      paddingHorizontal: 6,
      fontVariant: ['tabular-nums'],
    },
    colon: { fontSize: 26, fontWeight: '700', color: COLORS.textSecondary },
    wheelsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
      justifyContent: 'center',
    },
    wheel: {
      flex: 1,
      maxWidth: 90,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.bgSubtle,
    },
    wheelSelector: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: ITEM_HEIGHT,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: COLORS.accent,
      backgroundColor: 'rgba(93,156,204,0.10)',
    },
    wheelFade: {
      position: 'absolute',
      left: 0,
      right: 0,
      backgroundColor: COLORS.bgSubtle,
      opacity: 0.85,
    },
    wheelItem: {
      fontSize: 18,
      color: COLORS.textLight,
      fontVariant: ['tabular-nums'],
    },
    wheelItemActive: { color: COLORS.accent, fontWeight: '700' },
    wheelColon: { fontSize: 22, fontWeight: '700', color: COLORS.textSecondary, marginHorizontal: 6 },
    unitRow: {
      flexDirection: 'row',
      alignSelf: 'stretch',
      justifyContent: 'center',
      marginTop: 6,
    },
    unitText: {
      fontSize: 12,
      color: COLORS.textLight,
      textAlign: 'center',
      maxWidth: 90,
    },
    hint: { fontSize: 11, color: COLORS.textLight, marginTop: SPACING.sm },
    footer: { flexDirection: 'row', marginTop: SPACING.md, gap: SPACING.sm, alignSelf: 'stretch' },
    footerBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: SPACING.sm + 2,
      alignItems: 'center',
      backgroundColor: COLORS.bgSubtle,
    },
    cancelBtn: { flex: 1 },
    confirmBtn: { flex: 1, backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    footerText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
    cancelText: { color: COLORS.danger },
    confirmText: { color: '#fff', fontWeight: '600' },
  });
