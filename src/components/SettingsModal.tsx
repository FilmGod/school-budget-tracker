'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePreferences, ThemeMode, FontSizeMode, MotionMode } from '@/context/PreferencesContext';
import { 
  X, 
  Sun, 
  Moon, 
  Laptop, 
  Type, 
  Sparkles, 
  EyeOff, 
  Check, 
  Settings as SettingsIcon,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { preferences, setTheme, setFontSize, setMotion, isDark } = usePreferences();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const fontOptions: { id: FontSizeMode; label: string; desc: string; sizePx: string }[] = [
    { id: 'compact', label: 'กะทัดรัด (16px)', desc: 'ขนาดกะทัดรัด พอดีจอเล็ก', sizePx: '16px' },
    { id: 'standard', label: 'ปานกลาง (18px)', desc: 'ขนาดกำลังดี ชัดเจน', sizePx: '18px' },
    { id: 'comfortable', label: 'สบายตา (19.2px)', desc: 'ขนาดแนะนำ อ่านง่ายสบายตาสูงสุด', sizePx: '19.2px' },
    { id: 'large', label: 'ใหญ่พิเศษ (21px)', desc: 'ตัวหนังสือใหญ่พิเศษ ชัดเจนเต็มตา', sizePx: '21px' },
  ];

  const themeOptions: { id: ThemeMode; label: string; desc: string; icon: typeof Sun }[] = [
    { id: 'light', label: 'โหมดสว่าง (ดั้งเดิม)', desc: 'พื้นหลังสีนุ่มตา Slate-100 สบายตา ไม่จ้าเกิน', icon: Sun },
    { id: 'dark', label: 'โหมดมืด (ถนอมสายตา)', desc: 'เฉดสีกรมท่าเข้ม (#0f172a) สบายตา ไม่ดำสนิท', icon: Moon },
    { id: 'system', label: 'ตามระบบอุปกรณ์', desc: 'ปรับสว่าง/มืดตามการตั้งค่าของเครื่อง', icon: Laptop },
  ];

  const modalContent = (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden flex flex-col max-h-[85vh] my-auto animate-scaleUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 sm:px-7 pt-7 pb-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#1e293b]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0 shadow-xs">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                การตั้งค่าการใช้งาน (Preferences)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Section 1: Theme Mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>ธีมและโทนสีของระบบ</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = preferences.theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`active-press p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 shadow-xs ring-2 ring-sky-500/20'
                        : 'border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected 
                          ? 'bg-sky-500 text-white' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {opt.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Font Size Adjustment */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Type className="w-4 h-4 text-sky-500" />
                <span>ขนาดตัวหนังสือทั้งเว็บ</span>
              </label>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                เอกสารพิมพ์ A4 ล็อก 16px เสมอ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {fontOptions.map((opt) => {
                const isSelected = preferences.fontSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setFontSize(opt.id)}
                    className={`active-press p-3 rounded-2xl border text-left flex items-start justify-between transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 shadow-xs ring-2 ring-sky-500/20'
                        : 'border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {opt.label}
                        </span>
                        {opt.id === 'comfortable' && (
                          <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 px-1.5 py-0.2 rounded-md">
                            แนะนำ
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {opt.desc}
                      </p>
                    </div>

                    <div className="mt-0.5 ml-2 flex-shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Motion & Animation Level */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>การเคลื่อนไหวหน้าจอ (Motion & Animation)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => setMotion('full')}
                className={`active-press p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  preferences.motion === 'full'
                    ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 shadow-xs ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span>มีชีวิตชีวา (Slide & Motion)</span>
                  </div>
                </div>
                {preferences.motion === 'full' && (
                  <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 ml-2">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>

              <button
                onClick={() => setMotion('reduced')}
                className={`active-press p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  preferences.motion === 'reduced'
                    ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 shadow-xs ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span>เรียบง่าย (Reduced Motion)</span>
                  </div>
                </div>
                {preferences.motion === 'reduced' && (
                  <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 ml-2">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="active-press px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            เสร็จสิ้น (เรียบร้อย)
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
