import { NextRequest, NextResponse } from 'next/server';
import { getSessionRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Returns the role of the current signed session (used by the UI). */
export async function GET(req: NextRequest) {
  const role = await getSessionRole(req);
  if (!role) {
    return NextResponse.json({ success: false, role: null, isAdmin: false }, { status: 401 });
  }
  return NextResponse.json({ success: true, role, isAdmin: role === 'admin' });
}
