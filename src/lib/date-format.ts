// 统一日期与时间格式化工具
// 规约：所有时间精确到分钟，元数据表单格式为 YYYY/MM/DD/HH/mm

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** 获取精确到分钟的当前时间字符串，格式：YYYY/MM/DD/HH/mm */
export function nowFormatted(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}/${m}/${d}/${hh}/${mm}`;
}

/** 解析任意支持的日期时间字符串，返回各部分数值 */
export function parseDateComponents(str: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} | null {
  if (!str) return null;
  // 匹配 YYYY/MM/DD/HH/mm 或 YYYY/MM/DD/HH:mm
  const m1 = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})[/-](\d{1,2})[:/](\d{1,2})$/);
  if (m1) {
    return {
      year: parseInt(m1[1], 10),
      month: parseInt(m1[2], 10),
      day: parseInt(m1[3], 10),
      hour: parseInt(m1[4], 10),
      minute: parseInt(m1[5], 10),
    };
  }
  // 匹配 YYYY-MM-DD HH:mm 或 YYYY/MM/DD HH:mm
  const m2 = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})\s+(\d{1,2}):(\d{1,2})$/);
  if (m2) {
    return {
      year: parseInt(m2[1], 10),
      month: parseInt(m2[2], 10),
      day: parseInt(m2[3], 10),
      hour: parseInt(m2[4], 10),
      minute: parseInt(m2[5], 10),
    };
  }
  // 匹配中文 YYYY年M月D日 HH:mm 或 YYYY年M月D日HH时mm分
  const m3 = str.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日(?:\s*(\d{1,2})(?:时|:)(\d{1,2})分?)?$/);
  if (m3) {
    return {
      year: parseInt(m3[1], 10),
      month: parseInt(m3[2], 10),
      day: parseInt(m3[3], 10),
      hour: m3[4] ? parseInt(m3[4], 10) : 0,
      minute: m3[5] ? parseInt(m3[5], 10) : 0,
    };
  }
  // 仅日期 YYYY-MM-DD 或 YYYY/MM/DD
  const m4 = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (m4) {
    return {
      year: parseInt(m4[1], 10),
      month: parseInt(m4[2], 10),
      day: parseInt(m4[3], 10),
      hour: 0,
      minute: 0,
    };
  }
  return null;
}

/** 规范化为 YYYY/MM/DD/HH/mm 字符串 */
export function normalizeDateToMinute(str: string): string {
  const c = parseDateComponents(str);
  if (!c) return str;
  return `${c.year}/${pad(c.month)}/${pad(c.day)}/${pad(c.hour)}/${pad(c.minute)}`;
}

/** 将日期时间字符串格式化为中文展示格式（YYYY年M月D日 HH:mm） */
export function formatDateCN(dateStr: string): string {
  const c = parseDateComponents(dateStr);
  if (!c) return dateStr;
  const timeSuffix = c.hour || c.minute ? ` ${pad(c.hour)}:${pad(c.minute)}` : '';
  return `${c.year}年${c.month}月${c.day}日${timeSuffix}`;
}

/** 将日期时间字符串转为毫秒时间戳（用于排序；解析失败或空值返回 0） */
export function dateToTimestamp(str?: string): number {
  if (!str) return 0;
  const c = parseDateComponents(str.trim());
  if (!c) {
    const t = new Date(str).getTime();
    return isNaN(t) ? 0 : t;
  }
  return new Date(c.year, c.month - 1, c.day, c.hour, c.minute).getTime();
}

