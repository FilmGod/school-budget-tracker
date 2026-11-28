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
  Calendar,
  Plus,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import SettingsModal from '@/components/SettingsModal';

const NAV_LINKS = [
  { href: '/', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/projects', label: 'ตรวจสอบงบประมาณคงเหลือรายกิจกรรม', icon: FolderKanban },
  { href: '/reports', label: 'รายงานผลกิจกรรม', icon: FileText },
  { href: '/documents', label: 'ดาวน์โหลดแผนกิจกรรมและแบบฟอร์ม', icon: FolderDown }
];

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

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  if (pathname === '/login') {
    return null;
  }

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const handleLogout = async () => {
    if (!confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) return;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* ignore network errors, cookie is cleared on next request anyway */
    }
    try {
      localStorage.removeItem('school_budget_is_admin');
    } catch {
      /* ignore storage errors */
    }
    window.location.href = '/login';
  };

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newYearInput.trim().length >= 4) {
      await addFiscalYear(newYearInput.trim());
      setShowAddYearModal(false);
      setNewYearInput('');
    }
  };

  const schoolName =
    db.fiscalYears.find((f) => f.id === currentYear)?.schoolName || 'โรงเรียนบางกล่ำวิทยา รัชมังคลาภิเษก';

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-line bg-surface px-3 print:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="เปิดเมนู"
          className="rounded-md p-2 text-body hover:bg-canvas"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <img src="/school-logo.png" alt="ตราโรงเรียน" className="h-8 w-8 flex-shrink-0 object-contain" />
          <span className="truncate text-sm font-semibold text-ink">ระบบติดตามงบประมาณ</span>
        </div>
        <span className="chip border border-line bg-canvas text-muted">ปี {currentYear}</span>
      </header>

      {/* Drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar / drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-line bg-surface transition-transform duration-200 print:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-4">
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex min-w-0 items-center gap-2.5">
            <img src="/school-logo.png" alt="ตราโรงเรียน" className="h-10 w-10 flex-shrink-0 object-contain" />
            <span className="min-w-0">
              <span className="block truncate text-[0.8rem] font-bold leading-tight text-ink">ระบบติดตามงบประมาณ</span>
              <span className="block truncate text-[0.62rem] leading-tight text-muted">{schoolName}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="ปิดเมนู"
            className="rounded-md p-1.5 text-muted hover:bg-canvas lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <p className="px-3 pb-1.5 text-[0.62rem] font-semibold uppercase tracking-wider text-muted">งานหลัก</p>
          <ul className="space-y-0.5">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-brandSoft font-semibold text-brand'
                        : 'text-body hover:bg-canvas'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="leading-snug">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="px-3 pb-1.5 pt-4 text-[0.62rem] font-semibold uppercase tracking-wider text-muted">
            จัดการ
          </p>
          <ul className="space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(true);
                  setMobileOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-body hover:bg-canvas"
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                <span>ตั้งค่า</span>
              </button>
            </li>
            {isAdmin && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้นหรือไม่?')) {
                      resetDatabase();
                    }
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-body hover:bg-canvas"
                >
                  <RotateCcw className="h-4 w-4 flex-shrink-0" />
                  <span>รีเซ็ตข้อมูล</span>
                </button>
              </li>
            )}
          </ul>
        </nav>

        <div className="space-y-2 border-t border-line px-3 py-3">
          <label htmlFor="fiscal-year" className="block text-[0.62rem] font-semibold uppercase tracking-wider text-muted">
            ปีงบประมาณ
          </label>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 flex-shrink-0 text-muted" />
            <select
              id="fiscal-year"
              value={currentYear}
              onChange={(e) => {
                if (e.target.value === '__add__') {
                  setShowAddYearModal(true);
                } else {
                  setCurrentYear(e.target.value);
                }
              }}
              className="min-w-0 flex-1 rounded-md border border-line bg-surface px-2 py-1.5 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand/40"
            >
              {db.fiscalYears.map((fy) => (
                <option key={fy.id} value={fy.id}>
                  ปีงบ {fy.id}
                </option>
              ))}
              {isAdmin && <option value="__add__">+ เพิ่มปีงบใหม่</option>}
            </select>
          </div>

          <div className="flex items-center gap-1.5 rounded-md bg-canvas px-2.5 py-1.5 text-[0.68rem] text-body">
            <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-brand" />
            <span className="whitespace-nowrap">{isAdmin ? 'ผู้ดูแลระบบ' : 'ครูผู้รายงาน'}</span>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAdmin(false)}
                className="ml-auto text-[0.68rem] font-semibold text-brand hover:underline"
              >
                ออกจากโหมดแก้ไข
              </button>
            )}
            {!isAdmin && (
              <Link href="/login" className="ml-auto text-[0.68rem] font-semibold text-brand hover:underline">
                เข้าโหมดแก้ไข
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Add fiscal year modal */}
      {showAddYearModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-sm p-6">
            <h3 className="card-title mb-1">เพิ่มปีงบประมาณใหม่</h3>
            <p className="mb-4 text-xs text-muted">ระบุปีงบประมาณที่ต้องการสร้างเพิ่ม</p>
            <form onSubmit={handleAddYear}>
              <input
                type="text"
                placeholder=""
                value={newYearInput}
                onChange={(e) => setNewYearInput(e.target.value)}
                autoFocus
                className="mb-4 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddYearModal(false)} className="btn-ghost flex-1">
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary flex-1">
                  <Plus className="h-3.5 w-3.5" />
                  บันทึกปีงบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </>
  );
}
