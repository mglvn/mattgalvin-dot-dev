export const COOKIE_NAME = "session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

function cookieFlags(secure: boolean): string {
  return `HttpOnly${secure ? "; Secure" : ""}; SameSite=Strict; Path=/`;
}

export async function createSessionCookie(secret: string, secure = true): Promise<string> {
  const ts = Date.now().toString();
  const sig = await hmac(ts, secret);
  const token = `${ts}.${sig}`;
  return `${COOKIE_NAME}=${token}; ${cookieFlags(secure)}; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookie(secure = true): string {
  return `${COOKIE_NAME}=; ${cookieFlags(secure)}; Max-Age=0`;
}

export async function verifySession(token: string, secret: string): Promise<boolean> {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const ts = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmac(ts, secret);
  return sig === expected;
}
