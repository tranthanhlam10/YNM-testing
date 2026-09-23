import farmhash from 'farmhash';
 
/**
 * Chuẩn hóa chuỗi văn bản trước khi băm hash tiêu đề.
 *
 * Các bước xử lý:
 * - Chuẩn hóa Unicode (NFKC).
 * - Loại bỏ emoji và ký tự kết hợp (variation selector, zero-width joiner).
 * - Gộp/xóa khoảng trắng, tab, xuống dòng.
 * - Trim đầu cuối.
 *
 * @param {string} text - Chuỗi văn bản đầu vào.
 * @returns {string} Chuỗi đã chuẩn hóa; trả về nguyên giá trị nếu `text` falsy.
 */
export function normalizeText(text: string): string {
  if (!text) return text;
 
  const removeEmojis = (text: string): string => {
    return text
      .replace(/\p{Extended_Pictographic}/gu, '')
      .replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '')
      .replace(/\uFE0F/g, '')
      .replace(/\u200D/g, '');
  };
 
  text = text
    .normalize('NFKC')
    // .replace(/[\u0300-\u036F]/g, '')
    .replace(/\v+/g, '')
    .replace(/[ \t]+/g, '')
    .replace(/\s*\n\s*/g, '');
 
  text = removeEmojis(text);
 
  return text.trim();
}
/**
 * Băm (hash) một chuỗi văn bản bằng thuật toán FarmHash (hash64)
 * và chuyển đổi sang dạng chuỗi thập lục phân (hex) có độ dài cố định 16 ký tự.
 *
 * Chuỗi đầu vào được {@link normalizeText} trước khi băm để đảm bảo hash ổn định
 * khi tiêu đề chỉ khác nhau về khoảng trắng hoặc emoji.
 *
 * @param {string} text - Chuỗi văn bản đầu vào cần băm.
 * @returns {string} Chuỗi hex 16 ký tự (luôn được pad '0' ở đầu nếu thiếu).
 * @example
 * hash16Farm('Sản phẩm A'); // -> "a1b2c3d4e5f67890"
 */
export function hash16Farm(text: string): string {
  const normalize = normalizeText(text);

  // farmhash.hash64 trả về chuỗi số 64-bit dưới dạng String (Vd: "14294474320234057850")
  const hash64Str = farmhash.hash64(normalize);

  // Chuyển chuỗi số đó thành BigInt rồi chuyển sang Hex
  // Sử dụng BigInt vì số 64-bit vượt quá phạm vi lưu trữ số an toàn của JavaScript (Number.MAX_SAFE_INTEGER)
  const hex = BigInt(hash64Str).toString(16);
 
  // Đảm bảo luôn đủ 16 ký tự
  return hex.padStart(16, '0');
}
