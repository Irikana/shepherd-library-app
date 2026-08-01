// UTF-8 安全的 Base64 编解码（React Native Hermes 兼容，无依赖）
// GitHub Contents API 要求 content 字段为 base64

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** UTF-8 字符串 -> Base64 */
export function b64encode(str: string): string {
  // 先转 UTF-8 字节序列（unescape+encodeURIComponent 经典技巧，Hermes 支持）
  const utf8 = unescape(encodeURIComponent(str));
  let out = '';
  for (let i = 0; i < utf8.length; i += 3) {
    const b1 = utf8.charCodeAt(i);
    const b2 = i + 1 < utf8.length ? utf8.charCodeAt(i + 1) : NaN;
    const b3 = i + 2 < utf8.length ? utf8.charCodeAt(i + 2) : NaN;
    out += B64_CHARS[b1 >> 2];
    out += B64_CHARS[((b1 & 0x03) << 4) | (isNaN(b2) ? 0 : b2 >> 4)];
    out += isNaN(b2) ? '=' : B64_CHARS[((b2 & 0x0f) << 2) | (isNaN(b3) ? 0 : b3 >> 6)];
    out += isNaN(b3) ? '=' : B64_CHARS[b3 & 0x3f];
  }
  return out;
}

/** Base64 -> UTF-8 字符串 */
export function b64decode(b64: string): string {
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  let utf8 = '';
  for (let i = 0; i < clean.length; i += 4) {
    const c1 = B64_CHARS.indexOf(clean[i]);
    const c2 = B64_CHARS.indexOf(clean[i + 1]);
    const c3 = clean[i + 2] ? B64_CHARS.indexOf(clean[i + 2]) : 0;
    const c4 = clean[i + 3] ? B64_CHARS.indexOf(clean[i + 3]) : 0;
    const n = (c1 << 18) | (c2 << 12) | (c3 << 6) | c4;
    utf8 += String.fromCharCode((n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff);
  }
  // 去掉末尾 padding 产生的 \0，再转回 UTF-8
  return decodeURIComponent(escape(utf8.replace(/\0+$/, '')));
}
