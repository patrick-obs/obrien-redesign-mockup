// Passphrase login with an HMAC-signed session cookie. Web Crypto only, so it runs in Workers and Node.
const enc = new TextEncoder();

async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export const SESSION_COOKIE = "fa_session";
const THIRTY_DAYS = 30 * 24 * 3600;

export async function makeSession(secret, now = Date.now()) {
  const exp = Math.floor(now / 1000) + THIRTY_DAYS;
  return `${exp}.${await hmacHex(secret, `session:${exp}`)}`;
}

export async function verifySession(secret, token, now = Date.now()) {
  if (!token || !secret) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) * 1000 < now) return false;
  return timingSafeEqual(sig, await hmacHex(secret, `session:${exp}`));
}

export const csrfFor = (secret, token) => hmacHex(secret, `csrf:${token}`);

export function parseCookies(header) {
  const out = {};
  for (const part of (header || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

export function sessionCookie(token, secure) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${THIRTY_DAYS}${secure ? "; Secure" : ""}`;
}
export const clearSessionCookie = () => `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
