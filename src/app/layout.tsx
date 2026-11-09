import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'ระบบติดตามการใช้งบประมาณตามแผนปฏิบัติการประจำปี โรงเรียนบางกล่ำวิทยารัชมังคลาภิเษก',
  description: 'ระบบติดตามและกำกับงบประมาณโรงเรียนบางกล่ำวิทยารัชมังคลาภิเษก ตามแผนปฏิบัติการประจำปี พร้อมระบบรายงานผลและส่งออกไฟล์ PDF/Word',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen flex flex-col bg-slate-50/60 text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
        <AppProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
          <footer className="bg-white border-t border-slate-200/80 py-6 print:hidden text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4">
              <p className="font-semibold text-slate-700">
                ระบบติดตามการใช้งบประมาณตามแผนปฏิบัติการประจำปี (School Budget Tracker)
              </p>
              <p className="mt-1 text-slate-400">
                พัฒนาขึ้นเพื่อการบริหารจัดการงบประมาณโรงเรียนอย่างมีประสิทธิภาพ โปร่งใส และตรวจสอบได้
              </p>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
