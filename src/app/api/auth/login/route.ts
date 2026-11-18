import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS, Role } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Passwords come from .env.local.
// APP_PASSWORD is the shared/teacher password; ADMIN_PASSWORD (optional) is the
// admin-mode password. Falls back to APP_PASSWORD when ADMIN_PASSWORD is unset.
const APP_PASSWORD = process.env.APP_PASSWORD || 'bwr01';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || APP_PASSWORD;

const USERS: Record<string, Role> = {
  admin: 'admin',
  teacher: 'teacher',
  user: 'teacher',
  'ครู': 'teacher'
};

// --- brute force protection ------------------------------------------------
// Simple in-memory limiter: 5 wrong passwords lock the key for 15 minutes.
// It is per server instance (fine for a single school server); a shared store
// would be needed for multi-instance deployments.
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

type Attempt = { fails: number; lockedUntil: number };
const attempts = new Map<string, Attempt>();

function attemptKey(req: NextRequest, username: string): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || req.headers.get('x-real-ip') || 'local';
  return `${ip}:${username.toLowerCase()}`;
}

function pruneAttempts() {
  const now = Date.now();
  attempts.forEach((value, key) => {
    if (value.lockedUntil < now && value.fails === 0) attempts.delete(key);
  });
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // --- rate limit check ---
    pruneAttempts();
    const key = attemptKey(req, cleanUser);
    const record = attempts.get(key);
    if (record && record.lockedUntil > Date.now()) {
      const retryAfter = Math.ceil((record.lockedUntil - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `ลองรหัสผิดหลายครั้งเกินไป กรุณารออีก ${Math.ceil(retryAfter / 60)} นาที`
        },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const role = USERS[cleanUser];
    const expectedPassword = role === 'admin' ? ADMIN_PASSWORD : APP_PASSWORD;

    if (role && cleanPass === expectedPassword) {
      attempts.delete(key);
      const token = await createSessionToken(role);
      const isAdmin = role === 'admin';

      const response = NextResponse.json({ success: true, role, isAdmin });
      response.cookies.set({
        name: SESSION_COOKIE,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_TTL_SECONDS
      });
      return response;
    }

    // --- record failure ---
    const next = attempts.get(key) || { fails: 0, lockedUntil: 0 };
    next.fails += 1;
    let message = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
    if (next.fails >= MAX_FAILS) {
      next.lockedUntil = Date.now() + LOCK_MS;
      next.fails = 0;
      message = 'ลองรหัสผิดหลายครั้งเกินไป กรุณารออีก 15 นาที';
    } else {
      message = `ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (เหลืออีก ${MAX_FAILS - next.fails} ครั้ง)`;
    }
    attempts.set(key, next);

    return NextResponse.json({ success: false, error: message }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' },
      { status: 500 }
    );
  }
}
