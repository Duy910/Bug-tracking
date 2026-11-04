// Phiên đăng nhập: cookie "tên.chữ-ký", chữ ký HMAC-SHA256 tạo trên server.
// Dùng Web Crypto nên chạy được cả trong middleware (Edge) lẫn server Node.

export const COOKIE = "bt_session";

function secret() {
  const s = process.env.SESSION_SECRET || process.env.APP_PASSWORD;
  return s ? `bug-tracker:${s}` : null;
}

async function hmac(text) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signSession(name) {
  return `${encodeURIComponent(name)}.${await hmac(name)}`;
}

export async function verifySession(value) {
  if (!value || !secret()) return null;
  const dot = value.lastIndexOf(".");
  if (dot < 1) return null;
  let name;
  try {
    name = decodeURIComponent(value.slice(0, dot));
  } catch {
    return null;
  }
  const expected = await hmac(name);
  const given = value.slice(dot + 1);
  if (given.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0 ? name : null;
}

export async function checkPassword(input) {
  const real = process.env.APP_PASSWORD;
  if (!real || typeof input !== "string") return false;
  // So sánh qua HMAC để thời gian so sánh không lộ độ dài/nội dung mật khẩu.
  return (await hmac(`pw:${input}`)) === (await hmac(`pw:${real}`));
}
