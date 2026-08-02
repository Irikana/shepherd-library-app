// 录音时长小时钟：圆形表盘，拖动指针选择 时/分/秒
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { COLORS, SPACING } from '../theme';

interface TimePickerModalProps {
  visible: boolean;
  /** 当前值，支持 "MM:SS" 或 "H:MM:SS" */
  value: string;
  onConfirm: (duration: string) => void;
  onCancel: () => void;
}

type Mode = 'hour' | 'minute' | 'second';

const MODES: { key: Mode; label: string }[] = [
  { key: 'hour', label: '时' },
  { key: 'minute', label: '分' },
  { key: 'second', label: '秒' },
];

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

/** 极坐标 → 表盘内坐标（角度 0 在顶部，顺时针） */
function polar(cx: number, cy: number, radius: number, deg: number): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

export function TimePickerModal({ visible, value, onConfirm, onCancel }: TimePickerModalProps) {
  const { width: winWidth } = useWindowDimensions();
  // 表盘直径：≤320pt 小屏自适应（overlay padding 48 + panel padding 32）
  const DIAL_SIZE = Math.min(280, Math.floor(winWidth - 96));
  const CENTER = DIAL_SIZE / 2;
  const RADIUS = CENTER - 26;
  const POINTER_LEN = RADIUS - 18;
  const [mode, setMode] = useState<Mode>('minute');
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);

  useEffect(() => {
    if (visible) {
      const { h, m, s } = parseDuration(value);
      setHour(h);
      setMinute(m);
      setSecond(s);
      setMode('minute');
    }
  }, [visible, value]);

  const activeValue = mode === 'hour' ? hour : mode === 'minute' ? minute : second;
  const steps = mode === 'hour' ? 24 : 60; // 小时 24 格（0-23），分/秒 60 格
  const pointerDeg = (activeValue / steps) * 360;

  /** 把触摸点映射为表盘值 */
  const pickFromTouch = (lx: number, ly: number) => {
    const dx = lx - CENTER;
    const dy = ly - CENTER;
    const rad = Math.atan2(dy, dx);
    let deg = ((rad * 180) / Math.PI + 360) % 360;
    deg = (deg + 90) % 360; // 转为 0 在顶部
    const v = Math.round((deg / 360) * steps) % steps;
    if (mode === 'hour') setHour(v);
    else if (mode === 'minute') setMinute(v);
    else setSecond(v);
  };

  const ticks = Array.from({ length: 60 }, (_, i) => i); // 刻度：60 条，主刻度每 5 条
  const numbers = mode === 'hour'
    ? Array.from({ length: 24 }, (_, i) => i) // 小时：0-23
    : Array.from({ length: 12 }, (_, i) => i * 5); // 分/秒：0,5,10...55

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.overlay}>
        <View style={s.panel}>
          <Text style={s.title}>录音时长</Text>

          {/* 当前值显示 */}
          <View style={s.valueRow}>
            {(['hour', 'minute', 'second'] as Mode[]).map((k, i) => (
              <React.Fragment key={k}>
                {i > 0 && <Text style={s.colon}>:</Text>}
                <Pressable onPress={() => setMode(k)}>
                  <Text style={[s.valueText, mode === k && s.valueTextActive]}>
                    {pad2(k === 'hour' ? hour : k === 'minute' ? minute : second)}
                  </Text>
                </Pressable>
              </React.Fragment>
            ))}
          </View>

          {/* 模式切换 */}
          <View style={s.modeRow}>
            {MODES.map((m) => (
              <Pressable
                key={m.key}
                style={[s.modeChip, mode === m.key && s.modeChipActive]}
                onPress={() => setMode(m.key)}
              >
                <Text style={[s.modeText, mode === m.key && s.modeTextActive]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* 表盘 */}
          <View
            style={[s.dial, { width: DIAL_SIZE, height: DIAL_SIZE, borderRadius: DIAL_SIZE / 2 }]}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(e) => pickFromTouch(e.nativeEvent.locationX, e.nativeEvent.locationY)}
            onResponderMove={(e) => pickFromTouch(e.nativeEvent.locationX, e.nativeEvent.locationY)}
          >
            {/* 刻度线 */}
            {ticks.map((i) => {
              const major = i % 5 === 0;
              const deg = (i / 60) * 360;
              const { x, y } = polar(CENTER, CENTER, major ? RADIUS - 6 : RADIUS - 2, deg);
              return (
                <View
                  key={i}
                  style={[
                    s.tick,
                    {
                      left: x - 1,
                      top: y - (major ? 5 : 2.5),
                      height: major ? 10 : 5,
                      backgroundColor: major ? COLORS.accent : COLORS.border,
                    },
                  ]}
                />
              );
            })}
            {/* 数字 */}
            {numbers.map((n) => {
              const deg = (n / steps) * 360;
              const { x, y } = polar(CENTER, CENTER, RADIUS - 22, deg);
              return (
                <Text
                  key={n}
                  style={[
                    s.dialNum,
                    {
                      left: x - 12,
                      top: y - 9,
                    },
                    activeValue === n && s.dialNumActive,
                  ]}
                >
                  {n}
                </Text>
              );
            })}
            {/* 指针 */}
            <View
              style={[
                s.pointer,
                {
                  left: CENTER - 2,
                  top: CENTER,
                  height: POINTER_LEN,
                  transform: [{ rotate: `${pointerDeg}deg` }],
                  transformOrigin: 'top center',
                },
              ]}
            />
            {/* 圆心 */}
            <View style={[s.hub, { left: CENTER - 6, top: CENTER - 6 }]} />
          </View>

          <Text style={s.hint}>在表盘上拖动指针选择，点击上方数字可切换单位</Text>

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

const s = StyleSheet.create({
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
    color: COLORS.textLight,
    paddingHorizontal: 6,
    fontVariant: ['tabular-nums'],
  },
  valueTextActive: { color: COLORS.accent },
  colon: { fontSize: 26, fontWeight: '700', color: COLORS.textSecondary },
  modeRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.md },
  modeChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 4,
    paddingHorizontal: 14,
    backgroundColor: COLORS.bgSubtle,
  },
  modeChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  modeText: { fontSize: 13, color: COLORS.textSecondary },
  modeTextActive: { color: '#fff', fontWeight: '600' },
  dial: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgSubtle,
  },
  tick: { position: 'absolute', width: 2 },
  dialNum: {
    position: 'absolute',
    width: 24,
    height: 18,
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.textLight,
  },
  dialNumActive: { color: COLORS.accent, fontWeight: '700' },
  pointer: {
    position: 'absolute',
    width: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  hub: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
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
