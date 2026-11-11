'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import DashboardCharts, { ProgressChartItem } from '@/components/DashboardCharts';
import AnimatedCounter from '@/components/AnimatedCounter';
import { 
  Wallet, 
  TrendingDown, 
  Coins, 
  ArrowUpRight, 
  GraduationCap, 
  Building2, 
  Users, 
  Sparkles,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { currentYear, filteredActivities, filteredReports, db } = useApp();
  const [barsAnimated, setBarsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBarsAnimated(true), 120);
    return () => clearTimeout(timer);
  }, []);

  // Aggregate Total School Budget
  const totalAllocated = filteredActivities.reduce((sum, a) => sum + (a.allocatedAmount || 0), 0);
  const totalUsed = filteredActivities.reduce((sum, a) => sum + (a.usedAmount || 0), 0);
  const totalRemaining = totalAllocated - totalUsed;
  const usedPercentage = totalAllocated > 0 ? ((totalUsed / totalAllocated) * 100).toFixed(1) : '0';

  // Budget Breakdown Calculations
  const innovAllocated = filteredActivities
    .filter(a => a.budgetType === 'งบพื้นที่นวัตกรรม')
    .reduce((sum, a) => sum + (a.allocatedAmount || 0), 0);
  const innovUsed = filteredActivities
    .filter(a => a.budgetType === 'งบพื้นที่นวัตกรรม')
    .reduce((sum, a) => sum + (a.usedAmount || 0), 0);
  const innovRemaining = innovAllocated - innovUsed;

  const subsidyAllocated = filteredActivities
    .filter(a => a.budgetType === 'งบอุดหนุน')
    .reduce((sum, a) => sum + (a.allocatedAmount || 0), 0);
  const subsidyUsed = filteredActivities
    .filter(a => a.budgetType === 'งบอุดหนุน')
    .reduce((sum, a) => sum + (a.usedAmount || 0), 0);
  const subsidyRemaining = subsidyAllocated - subsidyUsed;

  const devAllocated = filteredActivities
    .filter(a => a.budgetType === 'งบพัฒนาผู้เรียน')
    .reduce((sum, a) => sum + (a.allocatedAmount || 0), 0);
  const devUsed = filteredActivities
    .filter(a => a.budgetType === 'งบพัฒนาผู้เรียน')
    .reduce((sum, a) => sum + (a.usedAmount || 0), 0);
  const devRemaining = devAllocated - devUsed;

  const otherAllocated = filteredActivities
    .filter(a => a.budgetType !== 'งบพื้นที่นวัตกรรม' && a.budgetType !== 'งบอุดหนุน' && a.budgetType !== 'งบพัฒนาผู้เรียน')
    .reduce((sum, a) => sum + (a.allocatedAmount || 0), 0);
  const otherUsed = filteredActivities
    .filter(a => a.budgetType !== 'งบพื้นที่นวัตกรรม' && a.budgetType !== 'งบอุดหนุน' && a.budgetType !== 'งบพัฒนาผู้เรียน')
    .reduce((sum, a) => sum + (a.usedAmount || 0), 0);
  const otherRemaining = otherAllocated - otherUsed;

  // Breakdown by 4 Departments
  const departmentConfigs = [
    { id: 'academic', name: 'ฝ่ายบริหารวิชาการ', icon: GraduationCap, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
    { id: 'general', name: 'ฝ่ายบริหารทั่วไป', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { id: 'personnel', name: 'ฝ่ายบริหารงานบุคคล', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { id: 'budget', name: 'ฝ่ายบริหารงบประมาณ', icon: Coins, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  ];

  const departmentData = departmentConfigs.map(dept => {
    const deptActs = filteredActivities.filter(a => a.departmentId === dept.id);
    const allocated = deptActs.reduce((sum, a) => sum + (a.allocatedAmount || 0), 0);
    const used = deptActs.reduce((sum, a) => sum + (a.usedAmount || 0), 0);
    const remaining = allocated - used;

    // Sub-types inside department
    const subAlloc = deptActs.filter(a => a.budgetType === 'งบอุดหนุน').reduce((s, a) => s + (a.allocatedAmount || 0), 0);
    const subUsed = deptActs.filter(a => a.budgetType === 'งบอุดหนุน').reduce((s, a) => s + (a.usedAmount || 0), 0);
    const subRem = subAlloc - subUsed;

    const devAlloc = deptActs.filter(a => a.budgetType === 'งบพัฒนาผู้เรียน').reduce((s, a) => s + (a.allocatedAmount || 0), 0);
    const devUsed_ = deptActs.filter(a => a.budgetType === 'งบพัฒนาผู้เรียน').reduce((s, a) => s + (a.usedAmount || 0), 0);
    const devRem = devAlloc - devUsed_;

    const otherAlloc = deptActs.filter(a => a.budgetType !== 'งบอุดหนุน' && a.budgetType !== 'งบพัฒนาผู้เรียน').reduce((s, a) => s + (a.allocatedAmount || 0), 0);
    const otherUsed_ = deptActs.filter(a => a.budgetType !== 'งบอุดหนุน' && a.budgetType !== 'งบพัฒนาผู้เรียน').reduce((s, a) => s + (a.usedAmount || 0), 0);
    const otherRem = otherAlloc - otherUsed_;

    return {
      ...dept,
      count: deptActs.length,
      allocated,
      used,
      remaining,
      subsidy: { allocated: subAlloc, used: subUsed, remaining: subRem },
      development: { allocated: devAlloc, used: devUsed_, remaining: devRem },
      other: { allocated: otherAlloc, used: otherUsed_, remaining: otherRem }
    };
  });

  // Activity Progress Data for DashboardCharts (Completed = Reported Activity)
  const reportedActivityIds = new Set((filteredReports || []).map(r => r.activityId));
  const reportedActivityNames = new Set(
    (filteredReports || []).map(r => (r.activityName || '').trim()).filter(Boolean)
  );
  const isActivityReported = (a: { id: string; name?: string }) =>
    reportedActivityIds.has(a.id) || (!!a.name && reportedActivityNames.has(a.name.trim()));

  const progressData: ProgressChartItem[] = departmentConfigs.map(dept => {
    const deptActs = filteredActivities.filter(a => a.departmentId === dept.id);
    const total = deptActs.length;
    const completed = deptActs.filter(a => isActivityReported(a)).length;
    const inProgress = deptActs.filter(a => !isActivityReported(a) && ((a.usedAmount || 0) > 0 || (a.expenses && a.expenses.length > 0))).length;
    const pending = Math.max(0, total - completed - inProgress);
    const percent = total > 0 ? Math.round(((completed + inProgress * 0.5) / total) * 100) : 0;

    return {
      name: dept.name.replace('ฝ่ายบริหาร', ''),
      fullName: dept.name,
      total,
      completed,
      inProgress,
      pending,
      percent
    };
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-xs font-semibold rounded-full border border-sky-100 dark:border-sky-900 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ภาพรวมการติดตามงบประมาณ ปีงบ {currentYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            แดชบอร์ดงบประมาณตามแผนปฏิบัติการ
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            สรุปภาพรวมการจัดสรรและการเบิกจ่ายงบประมาณประจำปี
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/projects"
            className="active-press inline-flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <span>ดูรายละเอียดโครงการ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/reports"
            className="active-press inline-flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
          >
            <span>กรอกรายงานกิจกรรม</span>
          </Link>
        </div>
      </div>

      {/* Main KPI Cards: Total School Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Total Allocated Card */}
        <div className="bg-gradient-to-br from-sky-600 to-sky-700 text-white rounded-2xl p-5 sm:p-6 shadow-md shadow-sky-600/10 relative overflow-hidden hover-card">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-100">
              งบรวมที่ได้รับจัดสรร
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <AnimatedCounter value={totalAllocated} /> <span className="text-base sm:text-lg font-normal text-sky-200">บาท</span>
          </div>
          <div className="mt-4 pt-3 border-t border-sky-500/40 flex items-center justify-between text-xs text-sky-100">
            <span>จำนวนกิจกรรมทั้งหมด</span>
            <span className="font-bold">{filteredActivities.length} กิจกรรม</span>
          </div>
        </div>

        {/* Total Used Card */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-5 sm:p-6 shadow-md shadow-amber-500/10 relative overflow-hidden hover-card">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-100">
              ยอดเบิกจ่ายแล้ว
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <AnimatedCounter value={totalUsed} /> <span className="text-base sm:text-lg font-normal text-amber-200">บาท</span>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-400/40 flex items-center justify-between text-xs text-amber-100">
            <span>สัดส่วนการเบิกจ่าย</span>
            <span className="font-bold">{usedPercentage}% ของงบรวม</span>
          </div>
        </div>

        {/* Total Remaining Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl p-5 sm:p-6 shadow-md shadow-emerald-600/10 relative overflow-hidden hover-card sm:col-span-2 lg:col-span-1">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              ยอดงบประมาณคงเหลือ
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <AnimatedCounter value={totalRemaining} /> <span className="text-base sm:text-lg font-normal text-emerald-200">บาท</span>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-500/40 flex items-center justify-between text-xs text-emerald-100">
            <span>คงเหลือพร้อมดำเนินงาน</span>
            <span className="font-bold">{(100 - Number(usedPercentage)).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Breakdown by Type: 4 Main Budget Types */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              แยกตามประเภทงบประมาณหลัก
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              งบอุดหนุนดำเนินงานและงบพัฒนาผู้เรียน
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
            ปีงบ {currentYear}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* 1. งบพื้นที่นวัตกรรม */}
          <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/30 dark:from-purple-950/25 dark:to-indigo-950/25 rounded-2xl p-5 sm:p-6 border border-purple-200/80 dark:border-purple-800/40 shadow-xs hover-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      งบพื้นที่นวัตกรรม
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      งบประมาณส่งเสริมและพัฒนานวัตกรรมการศึกษา
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800/60">
                  {innovAllocated > 0 ? ((innovUsed / innovAllocated) * 100).toFixed(1) : 0}% เบิกแล้ว
                </span>
              </div>

              {/* 3-Col Stats Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3.5 bg-white/90 dark:bg-slate-900/60 rounded-xl border border-purple-100/80 dark:border-purple-900/40 my-3 text-center">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">งบจัดสรร</div>
                  <div className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    <AnimatedCounter value={innovAllocated} />
                  </div>
                  <div className="text-[10px] text-slate-400">บาท</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">ใช้ไปแล้ว</div>
                  <div className="text-base sm:text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                    <AnimatedCounter value={innovUsed} />
                  </div>
                  <div className="text-[10px] text-slate-400">บาท</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">คงเหลือ</div>
                  <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                    <AnimatedCounter value={innovRemaining} />
                  </div>
                  <div className="text-[10px] text-slate-400">บาท</div>
                </div>
              </div>
            </div>

            {/* Progress Bar with Shimmer */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-600 h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] animate-shimmer"
                  style={{ width: `${barsAnimated ? (innovAllocated > 0 ? (innovUsed / innovAllocated) * 100 : 0) : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>ความคืบหน้าการเบิกจ่าย</span>
                <span>{innovAllocated > 0 ? ((innovUsed / innovAllocated) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </div>

          {/* 2. งบอุดหนุน */}
          <div className="bg-gradient-to-br from-sky-50/70 to-blue-50/30 dark:from-sky-950/25 dark:to-blue-950/25 rounded-2xl p-5 sm:p-6 border border-sky-200/80 dark:border-sky-800/40 shadow-xs hover-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      งบอุดหนุน (Subsidy)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      เงินอุดหนุนรายหัวและค่าใช้จ่ายดำเนินงานพื้นฐาน
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 rounded-full border border-sky-200 dark:border-sky-800/60">
                  {subsidyAllocated > 0 ? ((subsidyUsed / subsidyAllocated) * 100).toFixed(1) : 0}% เบิกแล้ว
                </span>
              </div>

              {/* 3-Col Stats Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3.5 bg-white/90 dark:bg-slate-900/60 rounded-xl border border-sky-100/80 dark:border-sky-900/40 my-3 text-center">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">งบจัดสรร</div>
                  <div className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    <AnimatedCounter value={subsidyAllocated} />
                  </div>
                  <div className="text-[10px] text-slate-400">บาท</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">ใช้ไปแล้ว</div>
                  <div className="text-base sm:text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                    <AnimatedCounter value={subsidyUsed} />
                  </div>
                  <div className="text-[10px] text-slate-400">บาท</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">คงเหลือ</div>
                  <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                    <AnimatedCounter value={subsidyRemaining} />
                  </div>
                  <div className="text-[10px] text-slate-400">บาท</div>
                </div>
              </div>
            </div>

            {/* Progress Bar with Shimmer */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-sky-600 h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] animate-shimmer"
                  style={{ width: `${barsAnimated ? (subsidyAllocated > 0 ? (subsidyUsed / subsidyAllocated) * 100 : 0) : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>ความคืบหน้าการเบิกจ่าย</span>
                <span>{subsidyAllocated > 0 ? ((subsidyUsed / subsidyAllocated) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </div>

          {/* 3. งบพัฒนาผู้เรียน */}
          <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/30 dark:from-emerald-950/25 dark:to-teal-950/25 rounded-2xl p-5 sm:p-6 border border-emerald-200/80 dark:border-emerald-800/40 shadow-xs hover-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      งบพัฒนาผู้เรียน (Student Dev)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      กิจกรรมพัฒนาคุณภาพผู้เรียนและทักษะชีวิต
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  {devAllocated > 0 ? ((devUsed / devAllocated) * 100).toFixed(1) : 0}% เบิกแล้ว
                </span>
              </div>

              {/* 3-Col Stats Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3.5 bg-white/90 dark:bg-slate-900/60 rounded-xl border border-emerald-100/80 dark:border-emerald-900/40 my-3 text-center">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">งบจัดสรร</div>
                  <div className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    <AnimatedCounter value={devAllocated} />
                  </div>
                  <div className="text-[10px] text-slate-400">บาท</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">ใช้ไปแล้ว</div>
                  <div className="text-base sm:text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                    <AnimatedCounter value={devUsed} />
                  </div>
                  <div className="text-[10px] text-slate-400">บาท</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">คงเหลือ</div>
                  <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                    <AnimatedCounter value={devRemaining} />
                  </div>
                  <div className="text-[10px] text-slate-400">บาท</div>
                </div>
              </div>
            </div>

            {/* Progress Bar with Shimmer */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] animate-shimmer"
                  style={{ width: `${barsAnimated ? (devAllocated > 0 ? (devUsed / devAllocated) * 100 : 0) : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>ความคืบหน้าการเบิกจ่าย</span>
                <span>{devAllocated > 0 ? ((devUsed / devAllocated) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </div>

          {/* 4. งบรายได้สถานศึกษาและอื่นๆ */}
          <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/30 dark:from-amber-950/25 dark:to-orange-950/25 rounded-2xl p-5 sm:p-6 border border-amber-200/80 dark:border-amber-800/40 shadow-xs hover-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      งบรายได้สถานศึกษา / อื่นๆ
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      รายได้จากการระดมทรัพยากร เงินบริจาค และงบอื่นๆ
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800/60">
                  {otherAllocated > 0 ? ((otherUsed / otherAllocated) * 100).toFixed(1) : 0}% เบิกแล้ว
                </span>
              </div>

              {/* 3-Col Stats Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3.5 bg-white/90 dark:bg-slate-900/60 rounded-xl border border-amber-100/80 dark:border-amber-900/40 my-3 text-center">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">งบจัดสรร</div>
                  <div className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    <AnimatedCounter value={otherAllocated} />
                  </div>
                  <div className="text-[10px] text-slate-400">บาท</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">ใช้ไปแล้ว</div>
                  <div className="text-base sm:text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                    <AnimatedCounter value={otherUsed} />
                  </div>
                  <div className="text-[10px] text-slate-400">บาท</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">คงเหลือ</div>
                  <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                    <AnimatedCounter value={otherRemaining} />
                  </div>
                  <div className="text-[10px] text-slate-400">บาท</div>
                </div>
              </div>
            </div>

            {/* Progress Bar with Shimmer */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-600 h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] animate-shimmer"
                  style={{ width: `${barsAnimated ? (otherAllocated > 0 ? (otherUsed / otherAllocated) * 100 : 0) : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>ความคืบหน้าการเบิกจ่าย</span>
                <span>{otherAllocated > 0 ? ((otherUsed / otherAllocated) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Component: Activity Progress Chart (Task 5 & 6) */}
      <DashboardCharts progressData={progressData} />

      {/* 4 Departments Summary Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              สถานะงบประมาณแยกตาม 4 ฝ่ายบริหาร
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              สรุปข้อมูลตามโครงสร้าง 4 กลุ่มบริหารงาน
            </p>
          </div>
          <Link
            href="/projects"
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center space-x-1"
          >
            <span>ดูรายการกิจกรรมทั้งหมด</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departmentData.map((dept) => {
            const Icon = dept.icon;
            const pct = dept.allocated > 0 ? ((dept.used / dept.allocated) * 100).toFixed(1) : '0';

            return (
              <div 
                key={dept.id} 
                className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm hover-card relative flex flex-col justify-between"
              >
                <div>
                  {/* Header of Dept Card */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-11 h-11 rounded-xl ${dept.bg} dark:bg-slate-800 ${dept.color} flex items-center justify-center border ${dept.border} dark:border-slate-700`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{dept.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{dept.count} กิจกรรมตามแผน</p>
                      </div>
                    </div>
                    <Link
                      href={`/projects?dept=${dept.id}`}
                      className="active-press text-xs px-2.5 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 font-medium transition-colors"
                    >
                      เปิดดูฝ่ายนี้ →
                    </Link>
                  </div>

                  {/* Main Totals of Dept */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-center mb-4 border border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">ได้รับจัดสรร</div>
                      <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                        {dept.allocated.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">เบิกจ่ายแล้ว</div>
                      <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                        {dept.used.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">คงเหลือ</div>
                      <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {dept.remaining.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Sub breakdown: Subsidy vs Dev vs Other */}
                  <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      แจกแจงตามประเภทงบประมาณ
                    </div>

                    {/* งบอุดหนุน */}
                    <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100/50 dark:border-sky-900/40">
                      <span className="text-sky-900 dark:text-sky-200 font-medium">งบอุดหนุน:</span>
                      <div className="space-x-3 text-right">
                        <span className="text-slate-500 dark:text-slate-400">จัดสรร: <b className="text-slate-700 dark:text-slate-200">{dept.subsidy.allocated.toLocaleString()}</b></span>
                        <span className="text-slate-500 dark:text-slate-400">ใช้: <b className="text-amber-600 dark:text-amber-400">{dept.subsidy.used.toLocaleString()}</b></span>
                        <span className="text-slate-500 dark:text-slate-400">เหลือ: <b className="text-emerald-600 dark:text-emerald-400">{dept.subsidy.remaining.toLocaleString()}</b></span>
                      </div>
                    </div>

                    {/* งบพัฒนาผู้เรียน */}
                    <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100/50 dark:border-emerald-900/40">
                      <span className="text-emerald-900 dark:text-emerald-200 font-medium">งบพัฒนาผู้เรียน:</span>
                      <div className="space-x-3 text-right">
                        <span className="text-slate-500 dark:text-slate-400">จัดสรร: <b className="text-slate-700 dark:text-slate-200">{dept.development.allocated.toLocaleString()}</b></span>
                        <span className="text-slate-500 dark:text-slate-400">ใช้: <b className="text-amber-600 dark:text-amber-400">{dept.development.used.toLocaleString()}</b></span>
                        <span className="text-slate-500 dark:text-slate-400">เหลือ: <b className="text-emerald-600 dark:text-emerald-400">{dept.development.remaining.toLocaleString()}</b></span>
                      </div>
                    </div>

                    {/* งบรายได้/อื่นๆ หากมี */}
                    {dept.other.allocated > 0 && (
                      <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100/50 dark:border-amber-900/40">
                        <span className="text-amber-900 dark:text-amber-200 font-medium">งบรายได้/อื่นๆ:</span>
                        <div className="space-x-3 text-right">
                          <span className="text-slate-500 dark:text-slate-400">จัดสรร: <b className="text-slate-700 dark:text-slate-200">{dept.other.allocated.toLocaleString()}</b></span>
                          <span className="text-slate-500 dark:text-slate-400">ใช้: <b className="text-amber-600 dark:text-amber-400">{dept.other.used.toLocaleString()}</b></span>
                          <span className="text-slate-500 dark:text-slate-400">เหลือ: <b className="text-emerald-600 dark:text-emerald-400">{dept.other.remaining.toLocaleString()}</b></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar at bottom */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex-1 mr-3">
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-sky-600 h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] animate-shimmer"
                        style={{ width: `${barsAnimated ? Math.min(100, Number(pct)) : 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                    เบิกจ่ายแล้ว {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
