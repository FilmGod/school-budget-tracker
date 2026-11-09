'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  FolderDown, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  Plus, 
  School,
  Lock,
  Unlock,
  RotateCcw
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { 
    db, 
    currentYear, 
    setCurrentYear, 
    addFiscalYear, 
    isAdmin, 
    setIsAdmin,
    resetDatabase 
  } = useApp();

  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const navLinks = [
    { href: '/', label: 'หน้าแรก แดชบอร์ด', icon: LayoutDashboard },
    { href: '/projects', label: 'โครงการและกิจกรรม', icon: FolderKanban },
    { href: '/reports', label: 'รายงานผลกิจกรรม', icon: FileText },
    { href: '/documents', label: 'รวมเล่มแผนและไดรฟ์', icon: FolderDown },
  ];

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowAdminPinModal(true);
      setPinInput('');
      setPinError(false);
    }
  };

  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default passcode is 1234 or empty (direct enter)
    if (pinInput === '1234' || pinInput === 'admin' || pinInput === '') {
      setIsAdmin(true);
      setShowAdminPinModal(false);
    } else {
      setPinError(true);
    }
  };

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newYearInput.trim().length >= 4) {
      await addFiscalYear(newYearInput.trim());
      setShowAddYearModal(false);
      setNewYearInput('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm print:hidden">
      {/* Top Bar: School & Year Selector & Admin Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  ระบบติดตามการใช้งบประมาณ
                </span>
                <span className="hidden sm:inline-block text-xs bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full border border-sky-200">
                  แผนปฏิบัติการประจำปี
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {db.fiscalYears.find(f => f.id === currentYear)?.schoolName || 'โรงเรียนคุณภาพ'}
              </p>
            </div>
          </div>

          {/* Right Controls: Year Selector & Admin Switch */}
          <div className="flex items-center space-x-3">
            {/* Year Selector */}
            <div className="flex items-center bg-slate-100/90 rounded-lg p-1 border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-500 ml-2 mr-1" />
              <select
                value={currentYear}
                onChange={(e) => {
                  if (e.target.value === '__add__') {
                    setShowAddYearModal(true);
                  } else {
                    setCurrentYear(e.target.value);
                  }
                }}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none pr-2 py-1 cursor-pointer"
              >
                {db.fiscalYears.map((fy) => (
                  <option key={fy.id} value={fy.id}>
                    ปีงบ {fy.id}
                  </option>
                ))}
                {isAdmin && <option value="__add__">+ เพิ่มปีงบใหม่...</option>}
              </select>
            </div>

            {/* Admin Mode Button */}
            {isAdmin ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAdminToggle}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                  title="คลิกเพื่อออกจากโหมดแก้ไข"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>โหมดแก้ไข (Admin)</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้นหรือไม่?')) {
                      resetDatabase();
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="รีเซ็ตข้อมูลเริ่มต้น"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdminToggle}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-all"
                title="คลิกเพื่อเปิดสิทธิ์แก้ไข (เฉพาะผู้ดูแล)"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>โหมดครูทั่วไป (เข้า Admin)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Admin PIN Modal */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 mb-1">
              เข้าสู่โหมดผู้ดูแลระบบ (Admin)
            </h3>
            <p className="text-xs text-center text-slate-500 mb-4">
              ระบบนี้อนุญาตให้คุณแก้ไขข้อมูลโครงการและงบประมาณได้คนเดียว (รหัสเริ่มต้น: 1234 หรือกดยืนยันได้ทันที)
            </p>
            <form onSubmit={verifyPin}>
              <input
                type="password"
                placeholder="กรอกรหัสผ่าน (ค่าเริ่มต้น 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                className={`w-full px-3 py-2 text-sm text-center border rounded-lg focus:outline-none focus:ring-2 mb-2 ${
                  pinError
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-300 focus:ring-sky-500'
                }`}
              />
              {pinError && (
                <p className="text-xs text-rose-500 text-center mb-3">รหัสผ่านไม่ถูกต้อง (ลอง 1234)</p>
              )}
              <div className="flex space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAdminPinModal(false)}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow transition-colors"
                >
                  ยืนยันเข้าสู่ระบบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fiscal Year Modal */}
      {showAddYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">เพิ่มปีงบประมาณใหม่</h3>
            <p className="text-xs text-slate-500 mb-4">
              ระบุปีงบประมาณที่ต้องการสร้างเพิ่ม เช่น 2571
            </p>
            <form onSubmit={handleAddYear}>
              <input
                type="text"
                placeholder="เช่น 2571"
                value={newYearInput}
                onChange={(e) => setNewYearInput(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 mb-4"
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddYearModal(false)}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow transition-colors"
                >
                  บันทึกปีงบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
