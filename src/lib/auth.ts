import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Session handling for the app.
 *
 * The old implementation only compared a static string in a cookie, so anybody
 * could become "admin" by typing `document.cookie = 'bwr_auth_token=auth_admin_authenticated'`.
 * The cookie now carries an HMAC-SHA256 signed payload ({ role, exp }) and is
 * verified both in the middleware and in every API route.
 *
 * Works in both the Node.js and Edge runtimes (Web Crypto only).
 */

export type Role = 'admin' | 'teacher';

export const SESSION_COOKIE = 'bwr_auth_token';
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

function getSecret(): string {
  return process.env.AUTH_SECRET || 'school-budget-tracker-dev-secret-please-change';
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/** Create a signed session token for the given role. */
export async function createSessionToken(role: Role): Promise<string> {
  const payload = { role, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(), new TextEncoder().encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Verify a session token. Returns the role, or null when invalid/expired. */
export async function verifySessionToken(token?: string | null): Promise<Role | null> {
  if (!token || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(),
      fromBase64Url(signature),
      new TextEncoder().encode(body)
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as {
      role?: string;
      exp?: number;
    };
    if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
    if (payload.role !== 'admin' && payload.role !== 'teacher') return null;
    return payload.role;
  } catch {
    return null;
  }
}

/** Read the signed session of an incoming request. */
export async function getSessionRole(req: NextRequest): Promise<Role | null> {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

/**
 * Guard an API route. Returns a response when the request must be rejected,
 * or null when it may continue.
 */
export async function guardRequest(
  req: NextRequest,
  allowed: Role[] = ['admin', 'teacher']
): Promise<NextResponse | null> {
  const role = await getSessionRole(req);
  if (!role) {
    return NextResponse.json({ success: false, error: 'กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
  }
  if (!allowed.includes(role)) {
    return NextResponse.json(
      { success: false, error: 'ไม่มีสิทธิ์ดำเนินการนี้ (ต้องเป็นผู้ดูแลระบบ)' },
      { status: 403 }
    );
  }
  return null;
}
