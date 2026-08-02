// 创建日期选择器：月历弹窗（点击选日）+ 自定义字符串输入模式
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { COLORS, SPACING } from '../theme';

interface DatePickerModalProps {
  visible: boolean;
  /** 当前值，格式 YYYY-MM-DD（可为空或任意字符串） */
  value: string;
  onConfirm: (date: string) => void;
  onCancel: () => void;
}

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

/** 解析 YYYY-MM-DD，失败返回 null（含严格的天数校验） */
function parseDate(str: string): { y: number; m: number; d: number } | null {
  const m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  if (mo < 1 || mo > 12 || d < 1 || d > daysInMonth(y, mo)) return null;
  return { y, m: mo, d };
}

/** 某年某月天数 */
function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function DatePickerModal({ visible, value, onConfirm, onCancel }: DatePickerModalProps) {
  const initial = parseDate(value);
  const now = new Date();
  const [viewYear, setViewYear] = useState(initial?.y ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial?.m ?? now.getMonth() + 1);
  const [selected, setSelected] = useState(initial);
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState(value);

  // 打开弹窗时同步当前值
  React.useEffect(() => {
    if (visible) {
      const cur = parseDate(value);
      setViewYear(cur?.y ?? now.getFullYear());
      setViewMonth(cur?.m ?? now.getMonth() + 1);
      setSelected(cur);
      setCustomText(value);
      setCustomMode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  /** 月历格子：当月日期 + 前后月补位（周一开头） */
  const cells = useMemo(() => {
    const total = daysInMonth(viewYear, viewMonth);
    // getDay(): 0=周日；转为周一开头偏移
    const firstDow = (new Date(viewYear, viewMonth - 1, 1).getDay() + 6) % 7;
    const list: { day: number; month: number; year: number; inMonth: boolean }[] = [];
    const prevTotal = daysInMonth(viewYear, viewMonth - 1);
    for (let i = firstDow - 1; i >= 0; i--) {
      list.push({ day: prevTotal - i, month: viewMonth - 1, year: viewYear, inMonth: false });
    }
    for (let d = 1; d <= total; d++) {
      list.push({ day: d, month: viewMonth, year: viewYear, inMonth: true });
    }
    while (list.length % 7 !== 0) {
      const last = list[list.length - 1];
      list.push({ day: last.day + 1, month: viewMonth + 1, year: viewYear, inMonth: false });
    }
    return list;
  }, [viewYear, viewMonth]);

  const isSelected = (c: (typeof cells)[number]) =>
    !!selected && selected.y === c.year && selected.m === c.month && selected.d === c.day;

  const shiftMonth = (delta: number) => {
    let y = viewYear;
    let m = viewMonth + delta;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setViewYear(y);
    setViewMonth(m);
  };

  const handleConfirm = () => {
    if (customMode) {
      const t = customText.trim();
      if (t) onConfirm(t);
      return;
    }
    if (selected) {
      onConfirm(`${selected.y}-${pad2(selected.m)}-${pad2(selected.d)}`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.overlay}>
        <View style={s.panel}>
          {customMode ? (
            <>
              <Text style={s.title}>自定义日期</Text>
              <TextInput
                style={s.customInput}
                value={customText}
                onChangeText={setCustomText}
                placeholder="如 2026年5月20日 / 2026-05-20"
                placeholderTextColor={COLORS.textLight}
                autoFocus
              />
              <Text style={s.hint}>可输入任意字符串，将原样写入创建日期</Text>
            </>
          ) : (
            <>
              <Text style={s.title}>选择日期</Text>
              {/* 年月切换 */}
              <View style={s.navRow}>
                <Pressable style={s.navBtn} onPress={() => shiftMonth(-1)}>
                  <Text style={s.navText}>‹</Text>
                </Pressable>
                <View style={s.yearMonth}>
                  <Pressable onPress={() => setViewYear(viewYear - 1)} hitSlop={8}>
                    <Text style={s.yearText}>{viewYear}年</Text>
                  </Pressable>
                  <Text style={s.monthText}>
                    {viewMonth}月
                    <Text style={s.monthHint}>（点年份可切换）</Text>
                  </Text>
                </View>
                <Pressable style={s.navBtn} onPress={() => shiftMonth(1)}>
                  <Text style={s.navText}>›</Text>
                </Pressable>
              </View>
              {/* 星期行 */}
              <View style={s.weekRow}>
                {WEEK_LABELS.map((w) => (
                  <Text key={w} style={[s.weekLabel, (w === '六' || w === '日') && s.weekend]}>
                    {w}
                  </Text>
                ))}
              </View>
              {/* 日期网格 */}
              <View style={s.grid}>
                {cells.map((c, i) => {
                  const sel = isSelected(c);
                  return (
                    <Pressable
                      key={`${c.year}-${c.month}-${c.day}-${i}`}
                      style={[s.dayCell, sel && s.dayCellActive]}
                      onPress={() => {
                        setSelected({ y: c.year, m: c.month, d: c.day });
                        if (!c.inMonth) {
                          setViewYear(c.year);
                          setViewMonth(c.month);
                        }
                      }}
                    >
                      <Text
                        style={[
                          s.dayText,
                          !c.inMonth && s.dayTextDim,
                          sel && s.dayTextActive,
                        ]}
                      >
                        {c.day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* 底部操作 */}
          <View style={s.footer}>
            <Pressable
              style={s.footerBtn}
              onPress={() => {
                setCustomMode((v) => !v);
                if (!customMode) setCustomText(value);
              }}
            >
              <Text style={s.footerText}>{customMode ? '返回日历' : '自定义'}</Text>
            </Pressable>
            <Pressable style={[s.footerBtn, s.cancelBtn]} onPress={onCancel}>
              <Text style={[s.footerText, s.cancelText]}>取消</Text>
            </Pressable>
            <Pressable style={[s.footerBtn, s.confirmBtn]} onPress={handleConfirm}>
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
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgSubtle,
  },
  navText: { fontSize: 18, color: COLORS.accent, fontWeight: '600' },
  yearMonth: { alignItems: 'center' },
  yearText: { fontSize: 16, fontWeight: '700', color: COLORS.accent },
  monthText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  monthHint: { fontSize: 11, color: COLORS.textLight },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    paddingVertical: 4,
  },
  weekend: { color: COLORS.danger },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellActive: { backgroundColor: COLORS.accent },
  dayText: { fontSize: 14, color: COLORS.text },
  dayTextDim: { color: COLORS.textLight, opacity: 0.6 },
  dayTextActive: { color: '#fff', fontWeight: '600' },
  customInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm + 2,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.bg,
  },
  hint: { fontSize: 12, color: COLORS.textLight, marginTop: SPACING.xs },
  footer: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
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
