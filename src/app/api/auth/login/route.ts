import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (cleanPass === 'bwr01') {
      const isAdmin = cleanUser === 'admin';
      const isTeacher = cleanUser === 'teacher' || cleanUser === 'user' || cleanUser === 'ครู';

      if (isAdmin || isTeacher) {
        const response = NextResponse.json({
          success: true,
          role: isAdmin ? 'admin' : 'teacher',
          isAdmin
        });

        response.cookies.set({
          name: 'bwr_auth_token',
          value: isAdmin ? 'auth_admin_authenticated' : 'auth_teacher_authenticated',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/'
        });
        return response;
      }
    }

    return NextResponse.json(
      { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' },
      { status: 500 }
    );
  }
}
