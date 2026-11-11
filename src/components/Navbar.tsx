'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  RotateCcw,
  Settings,
  LogOut
} from 'lucide-react';
import SettingsModal from '@/components/SettingsModal';

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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAdminSuccessModal, setShowAdminSuccessModal] = useState(false);
  const [showAdminExitConfirmModal, setShowAdminExitConfirmModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navLinks = [
    { href: '/', label: 'หน้าแรก แดชบอร์ด', icon: LayoutDashboard },
    { href: '/projects', label: 'โครงการและกิจกรรม', icon: FolderKanban },
    { href: '/reports', label: 'รายงานผลกิจกรรม', icon: FileText },
    { href: '/documents', label: 'รวมไฟล์เอกสารงานแผน', icon: FolderDown },
  ];

  // Sliding active tab indicator
  const tabRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    ready: boolean;
    hasAnimated: boolean;
  }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
    hasAnimated: false,
  });

  const getActiveHref = () => {
    const activeLink = navLinks.find((link) =>
      link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
    );
    return activeLink ? activeLink.href : '/';
  };

  useEffect(() => {
    const updateIndicator = () => {
      const activeHref = getActiveHref();
      const targetEl = tabRefs.current[activeHref];
      if (targetEl) {
        setIndicatorStyle((prev) => ({
          left: targetEl.offsetLeft,
          top: targetEl.offsetTop,
          width: targetEl.offsetWidth,
          height: targetEl.offsetHeight,
          ready: true,
          hasAnimated: prev.ready ? true : prev.hasAnimated,
        }));
      }
    };

    updateIndicator();
    const frameId = requestAnimationFrame(updateIndicator);
    const timer = setTimeout(updateIndicator, 60);

    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(updateIndicator);
    }

    window.addEventListener('resize', updateIndicator);
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [pathname]);

  const handleTabClick = (href: string) => {
    const targetEl = tabRefs.current[href];
    if (targetEl) {
      setIndicatorStyle((prev) => ({
        left: targetEl.offsetLeft,
        top: targetEl.offsetTop,
        width: targetEl.offsetWidth,
        height: targetEl.offsetHeight,
        ready: true,
        hasAnimated: true,
      }));
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setShowAdminExitConfirmModal(true);
    } else {
      setShowAdminPinModal(true);
      setPinInput('');
      setPinError(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (e) {}
      if (typeof window !== 'undefined') {
        localStorage.removeItem('school_budget_is_admin');
      }
      window.location.href = '/login';
    }
  };

  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'plff3376plff') {
      setIsAdmin(true);
      setShowAdminPinModal(false);
      setPinError(false);
      setPinInput('');
      setShowAdminSuccessModal(true);
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

  // On login screen, do not show any navbar, menu, or logout button
  if (pathname === '/login') {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm print:hidden transition-colors duration-200">
      {/* Top Bar: School & Year Selector & Admin Toggle */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[64px] sm:min-h-[72px] py-1.5 gap-2">
          {/* Logo & System Name */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
            {/* School Emblem Logo: Circular & 50% larger (60px), fills the circle completely with no gaps */}
            <div className="w-[48px] h-[48px] sm:w-[60px] sm:h-[60px] rounded-full shadow-md bg-[#24588d] flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src="/school-logo.png"
                alt="ตราโรงเรียนบางกล่ำวิทยา รัชมังคลาภิเษก"
                className="w-full h-full object-cover object-center scale-115"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  ระบบติดตามการใช้งบประมาณ
                </span>
                <span className="hidden md:inline-block text-xs bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 whitespace-nowrap">
                  แผนปฏิบัติการประจำปี
                </span>
              </div>
              <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
                {db.fiscalYears.find(f => f.id === currentYear)?.schoolName || 'โรงเรียนบางกล่ำวิทยา รัชมังคลาภิเษก'}
              </p>
            </div>
          </div>

          {/* Right Controls: Year Selector & Settings & Admin Switch */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">
            {/* Year Selector */}
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-800 rounded-lg p-0.5 sm:p-1 border border-slate-200 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400 ml-1.5 sm:ml-2 mr-1" />
              <select
                value={currentYear}
                onChange={(e) => {
                  if (e.target.value === '__add__') {
                    setShowAddYearModal(true);
                  } else {
                    setCurrentYear(e.target.value);
                  }
                }}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none pr-1.5 sm:pr-2 py-1 cursor-pointer"
              >
                {db.fiscalYears.map((fy) => (
                  <option key={fy.id} value={fy.id} className="dark:bg-slate-800">
                    ปีงบ {fy.id}
                  </option>
                ))}
                {isAdmin && <option value="__add__" className="dark:bg-slate-800">+ เพิ่มปีงบใหม่...</option>}
              </select>
            </div>

            {/* Settings & Preferences Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="active-press p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-all flex items-center space-x-1"
              title="ตั้งค่าธีม โหมดมืด/สว่าง ขนาดตัวหนังสือ"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400" />
              <span className="hidden md:inline">ตั้งค่า</span>
            </button>

            {/* Admin Mode Button */}
            {isAdmin ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={handleAdminToggle}
                  className="active-press flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                  title="คลิกเพื่อออกจากโหมดแก้ไข"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">โหมดแก้ไข (Admin)</span>
                  <span className="sm:hidden">Admin</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้นหรือไม่?')) {
                      resetDatabase();
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="รีเซ็ตข้อมูลเริ่มต้น"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdminToggle}
                className="active-press flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-all"
                title="คลิกเพื่อเปิดสิทธิ์แก้ไข (เฉพาะผู้ดูแล)"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="hidden sm:inline">โหมดครูทั่วไป (เข้า Admin)</span>
                <span className="sm:hidden">เข้า Admin</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="active-press p-1.5 sm:px-2.5 sm:py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-semibold border border-rose-200 dark:border-rose-800 transition-all flex items-center space-x-1"
              title="ออกจากระบบ เพื่อความปลอดภัย"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-50/90 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <nav className="relative flex space-x-1 sm:space-x-3 overflow-x-auto py-1.5 sm:py-2 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            {/* Smooth Sliding Active Background Pill */}
            <div
              className="absolute left-0 top-0 bg-sky-600 rounded-lg shadow-sm pointer-events-none"
              style={{
                transform: `translate3d(${indicatorStyle.left}px, ${indicatorStyle.top}px, 0)`,
                width: `${indicatorStyle.width}px`,
                height: `${indicatorStyle.height}px`,
                opacity: indicatorStyle.ready ? 1 : 0,
                transition: indicatorStyle.hasAnimated
                  ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease'
                  : 'opacity 0.2s ease',
              }}
            />

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  ref={(el) => { tabRefs.current[link.href] = el; }}
                  href={link.href}
                  onClick={() => handleTabClick(link.href)}
                  className={`relative z-10 active-press flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${
                    isActive
                      ? indicatorStyle.ready ? 'text-white' : 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="transition-colors duration-300">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>

    {/* Admin PIN Modal */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-1">
              เข้าสู่โหมดผู้ดูแลระบบ (Admin)
            </h3>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-4">
              กรุณากรอกรหัสผ่านผู้ดูแลระบบเพื่อเปิดสิทธิ์การจัดการ แก้ไข และเบิกจ่ายงบประมาณ
            </p>
            <form onSubmit={verifyPin}>
              <input
                type="password"
                placeholder="กรอกรหัสผ่านแอดมิน"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                autoFocus
                className={`w-full px-3 py-2 text-sm text-center border rounded-lg focus:outline-none focus:ring-2 mb-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                  pinError
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-sky-500'
                }`}
              />
              {pinError && (
                <p className="text-xs text-rose-500 text-center mb-3 font-medium">รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง</p>
              )}
              <div className="flex space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPinModal(false);
                    setPinInput('');
                    setPinError(false);
                  }}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
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
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />

      {/* Admin Mode Success Popup */}
      {isClient && showAdminSuccessModal && createPortal(
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowAdminSuccessModal(false)}
        >
          <div 
            className="bg-white dark:bg-[#1e293b] rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center max-w-sm w-full mx-auto animate-scaleUp transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Green Animated Circle with Ping ripple & Animated SVG Checkmark */}
            <div className="relative mb-5 flex items-center justify-center">
              <span className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-400 opacity-40 animate-ping pointer-events-none" />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/35 relative z-10 animate-checkmark-circle">
                <svg 
                  className="w-10 h-10 sm:w-12 sm:h-12 text-white relative z-20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline 
                    points="5 13 9 17 19 7" 
                    className="animate-checkmark-stroke"
                  />
                </svg>
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1.5">
              เข้าสู่โหมดแอดมินสำเร็จ
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              เปิดสิทธิ์การจัดการ แก้ไข และเบิกจ่ายงบประมาณเรียบร้อยแล้ว
            </p>

            {/* OK Button */}
            <button
              type="button"
              onClick={() => setShowAdminSuccessModal(false)}
              className="active-press w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              ตกลง (เริ่มใช้งาน)
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Admin Mode Exit Confirmation Popup */}
      {isClient && showAdminExitConfirmModal && createPortal(
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowAdminExitConfirmModal(false)}
        >
          <div 
            className="bg-white dark:bg-[#1e293b] rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center max-w-sm w-full mx-auto animate-scaleUp transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Red Animated Circle with Ping ripple & Animated SVG Crossmark */}
            <div className="relative mb-5 flex items-center justify-center">
              <span className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-400 opacity-35 animate-ping pointer-events-none" />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-500 flex items-center justify-center shadow-xl shadow-rose-500/35 relative z-10 animate-checkmark-circle">
                <svg 
                  className="w-10 h-10 sm:w-12 sm:h-12 text-white relative z-20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3.2" 
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" className="animate-cross-stroke-1" />
                  <line x1="6" y1="6" x2="18" y2="18" className="animate-cross-stroke-2" />
                </svg>
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1.5">
              ยืนยันออกจากโหมดแอดมิน
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              คุณต้องการออกจากโหมดผู้ดูแลระบบ และสลับกลับไปเป็นโหมดคุณครูทั่วไปหรือไม่?
            </p>

            {/* Action Buttons */}
            <div className="flex space-x-3 w-full">
              <button
                type="button"
                onClick={() => setShowAdminExitConfirmModal(false)}
                className="active-press flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdmin(false);
                  setShowAdminExitConfirmModal(false);
                }}
                className="active-press flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 transition-all"
              >
                ออกจากแอดมิน
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
