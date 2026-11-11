'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <footer className="bg-white dark:bg-[#1e293b] border-t border-slate-200/80 dark:border-slate-800 py-6 print:hidden text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          ระบบติดตามการใช้งบประมาณตามแผนปฏิบัติการประจำปี (School Budget Tracker)
        </p>
        <p className="mt-1 text-slate-400 dark:text-slate-500">
          กลุ่มบริหารงบประมาณและแผนงาน โรงเรียนบางกล่ำวิทยา รัชมังคลาภิเษก
        </p>
      </div>
    </footer>
  );
}
