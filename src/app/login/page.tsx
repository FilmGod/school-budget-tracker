'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Shield, Lock, User, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('from') || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('กรุณากรอกทั้งชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('school_budget_is_admin', data.isAdmin ? 'true' : 'false');
        }
        const targetUrl = (returnUrl && returnUrl !== '/login') ? returnUrl : '/';
        // เด้งเข้าหน้าแดชบอร์ดเองทันที ไม่ต้องรอนับเวลา
        window.location.href = targetUrl;
      } else {
        setErrorMessage(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      setErrorMessage('เชื่อมต่อระบบตรวจสอบสิทธิ์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] p-7 sm:p-9 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      {/* School Emblem Logo & Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        {/* School Emblem Logo: Circular & fills the circle completely */}
        <div className="relative mb-3.5 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full shadow-lg bg-[#24588d] overflow-hidden ring-4 ring-sky-100 dark:ring-sky-950/60 flex-shrink-0">
          <img
            src="/school-logo.png"
            alt="ตราโรงเรียนบางกล่ำวิทยา รัชมังคลาภิเษก"
            className="w-full h-full object-cover object-center scale-115"
          />
        </div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-[11px] font-bold border border-sky-100 dark:border-sky-800 mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>งานแผนงานและงบประมาณ</span>
        </div>
        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
          ระบบติดตามการใช้งบประมาณตามแผนปฏิบัติการประจำปี
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          โรงเรียนบางกล่ำวิทยา รัชมังคลาภิเษก
        </p>
      </div>

      {isSuccess ? (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-center space-y-2 animate-in fade-in">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <div className="text-sm font-bold">เข้าสู่ระบบสำเร็จ!</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400">กำลังนำท่านเข้าสู่ระบบงาน...</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              ชื่อผู้ใช้ (Username) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้"
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-xs sm:text-sm"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              รหัสผ่าน (Password) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                autoComplete="current-password"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-xs sm:text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 active-press text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-sky-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>กำลังเข้าสู่ระบบ...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </span>
            )}
          </button>
        </form>
      )}

      {/* Footer Info */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          สำหรับครูและบุคลากร โรงเรียนบางกล่ำวิทยา รัชมังคลาภิเษก เท่านั้น
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center py-6 sm:py-10 my-auto">
      <Suspense fallback={<div className="text-xs text-slate-500">กำลังโหลด...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
