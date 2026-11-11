import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: 'bwr_auth_token',
    value: '',
    httpOnly: true,
    maxAge: 0,
    path: '/'
  });
  return response;
}
