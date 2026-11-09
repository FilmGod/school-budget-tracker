'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import DashboardCharts from '@/components/DashboardCharts';
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
  const { currentYear, filteredActivities, db } = useApp();

  // Aggregate Total School Budget
  const totalAllocated = filteredActivities.reduce((sum, a) => sum + (a.allocatedAmount || 0), 0);
  const totalUsed = filteredActivities.reduce((sum, a) => sum + (a.usedAmount || 0), 0);
  const totalRemaining = totalAllocated - totalUsed;
  const usedPercentage = totalAllocated > 0 ? ((totalUsed / totalAllocated) * 100).toFixed(1) : '0';

  // Budget Breakdown by Type across the School
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
    .filter(a => a.budgetType !== 'งบอุดหนุน' && a.budgetType !== 'งบพัฒนาผู้เรียน')
    .reduce((sum, a) => sum + (a.allocatedAmount || 0), 0);
  const otherUsed = filteredActivities
    .filter(a => a.budgetType !== 'งบอุดหนุน' && a.budgetType !== 'งบพัฒนาผู้เรียน')
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

  // Chart data
  const deptChartData = departmentData.map(d => ({
    name: d.name.replace('ฝ่ายบริหาร', ''),
    allocated: d.allocated,
    used: d.used,
    remaining: d.remaining
  }));

  const typeChartData = [
    { name: 'งบอุดหนุน', value: subsidyAllocated, color: '#0284c7' },
    { name: 'งบพัฒนาผู้เรียน', value: devAllocated, color: '#10b981' },
    { name: 'งบรายได้/อื่นๆ', value: otherAllocated, color: '#f59e0b' },
  ].filter(t => t.value > 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ภาพรวมการติดตามงบประมาณ ปีงบ {currentYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            แดชบอร์ดงบประมาณตามแผนปฏิบัติการ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            สรุปสถานะการจัดสรรและเบิกจ่ายงบประมาณโรงเรียนแบบเรียลไทม์
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/projects"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <span>ดูรายละเอียดโครงการ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/reports"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200 shadow-sm transition-all"
          >
            <span>กรอกรายงานกิจกรรม</span>
          </Link>
        </div>
      </div>

      {/* Main KPI Cards: Total School Budget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Allocated Card */}
        <div className="bg-gradient-to-br from-sky-600 to-sky-700 text-white rounded-2xl p-6 shadow-md shadow-sky-600/10 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-100">
              งบรวมที่ได้รับจัดสรร
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">
            {totalAllocated.toLocaleString()} <span className="text-lg font-normal text-sky-200">บาท</span>
          </div>
          <div className="mt-4 pt-3 border-t border-sky-500/40 flex items-center justify-between text-xs text-sky-100">
            <span>จำนวนกิจกรรมทั้งหมด</span>
            <span className="font-bold">{filteredActivities.length} กิจกรรม</span>
          </div>
        </div>

        {/* Total Used Card */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-6 shadow-md shadow-amber-500/10 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-100">
              ยอดเบิกจ่ายแล้ว
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">
            {totalUsed.toLocaleString()} <span className="text-lg font-normal text-amber-200">บาท</span>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-400/40 flex items-center justify-between text-xs text-amber-100">
            <span>สัดส่วนการเบิกจ่าย</span>
            <span className="font-bold">{usedPercentage}% ของงบรวม</span>
          </div>
        </div>

        {/* Total Remaining Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl p-6 shadow-md shadow-emerald-600/10 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              ยอดงบประมาณคงเหลือ
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">
            {totalRemaining.toLocaleString()} <span className="text-lg font-normal text-emerald-200">บาท</span>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-500/40 flex items-center justify-between text-xs text-emerald-100">
            <span>คงเหลือพร้อมดำเนินงาน</span>
            <span className="font-bold">{(100 - Number(usedPercentage)).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Breakdown by Type: Subsidy vs Student Development */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              แยกตามประเภทงบประมาณหลัก (งบอุดหนุน และ งบพัฒนาผู้เรียน)
            </h2>
            <p className="text-xs text-slate-500">
              เปรียบเทียบการจัดสรรและการเบิกจ่ายของแต่ละประเภทเงินงบประมาณ
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
            ปีงบ {currentYear}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. งบอุดหนุน */}
          <div className="bg-sky-50/50 rounded-xl p-5 border border-sky-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-sky-900">๑. งบอุดหนุน (Subsidy)</span>
              <span className="text-xs px-2 py-0.5 bg-sky-200 text-sky-800 rounded-md font-medium">
                {subsidyAllocated > 0 ? ((subsidyUsed / subsidyAllocated) * 100).toFixed(1) : 0}% เบิกแล้ว
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">จัดสรร:</span>
                <span className="font-bold text-slate-800">{subsidyAllocated.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ใช้ไป:</span>
                <span className="font-bold text-amber-600">{subsidyUsed.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-sky-100">
                <span className="text-slate-700 font-semibold">คงเหลือ:</span>
                <span className="font-extrabold text-emerald-600 text-sm">{subsidyRemaining.toLocaleString()} บาท</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
              <div 
                className="bg-sky-600 h-full rounded-full transition-all"
                style={{ width: `${subsidyAllocated > 0 ? (subsidyUsed / subsidyAllocated) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* 2. งบพัฒนาผู้เรียน */}
          <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-emerald-900">๒. งบพัฒนาผู้เรียน (Student Dev)</span>
              <span className="text-xs px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-md font-medium">
                {devAllocated > 0 ? ((devUsed / devAllocated) * 100).toFixed(1) : 0}% เบิกแล้ว
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">จัดสรร:</span>
                <span className="font-bold text-slate-800">{devAllocated.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ใช้ไป:</span>
                <span className="font-bold text-amber-600">{devUsed.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-emerald-100">
                <span className="text-slate-700 font-semibold">คงเหลือ:</span>
                <span className="font-extrabold text-emerald-600 text-sm">{devRemaining.toLocaleString()} บาท</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${devAllocated > 0 ? (devUsed / devAllocated) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* 3. งบรายได้สถานศึกษาและอื่นๆ */}
          <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-amber-900">๓. งบรายได้สถานศึกษา / อื่นๆ</span>
              <span className="text-xs px-2 py-0.5 bg-amber-200 text-amber-800 rounded-md font-medium">
                {otherAllocated > 0 ? ((otherUsed / otherAllocated) * 100).toFixed(1) : 0}% เบิกแล้ว
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">จัดสรร:</span>
                <span className="font-bold text-slate-800">{otherAllocated.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ใช้ไป:</span>
                <span className="font-bold text-amber-600">{otherUsed.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-amber-100">
                <span className="text-slate-700 font-semibold">คงเหลือ:</span>
                <span className="font-extrabold text-emerald-600 text-sm">{otherRemaining.toLocaleString()} บาท</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
              <div 
                className="bg-amber-600 h-full rounded-full transition-all"
                style={{ width: `${otherAllocated > 0 ? (otherUsed / otherAllocated) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Component */}
      <DashboardCharts deptChartData={deptChartData} typeChartData={typeChartData} />

      {/* 4 Departments Summary Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              สถานะงบประมาณแยกตาม ๔ ฝ่ายบริหาร
            </h2>
            <p className="text-xs text-slate-500">
              แสดงยอดจัดสรร เบิกจ่าย และคงเหลือ พร้อมจำแนกย่อยเป็นงบอุดหนุนและงบพัฒนาผู้เรียน
            </p>
          </div>
          <Link
            href="/projects"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
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
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  {/* Header of Dept Card */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-11 h-11 rounded-xl ${dept.bg} ${dept.color} flex items-center justify-center border ${dept.border}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                        <p className="text-xs text-slate-500">{dept.count} กิจกรรมตามแผน</p>
                      </div>
                    </div>
                    <Link
                      href={`/projects?dept=${dept.id}`}
                      className="text-xs px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 font-medium transition-colors"
                    >
                      เปิดดูฝ่ายนี้ →
                    </Link>
                  </div>

                  {/* Main Totals of Dept */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center mb-4 border border-slate-100">
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">ได้รับจัดสรร</div>
                      <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                        {dept.allocated.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">เบิกจ่ายแล้ว</div>
                      <div className="text-sm font-extrabold text-amber-600 mt-0.5">
                        {dept.used.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">คงเหลือ</div>
                      <div className="text-sm font-extrabold text-emerald-600 mt-0.5">
                        {dept.remaining.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Sub breakdown: Subsidy vs Dev vs Other */}
                  <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      แจกแจงตามประเภทงบประมาณ
                    </div>

                    {/* งบอุดหนุน */}
                    <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-sky-50/60 border border-sky-100/50">
                      <span className="text-sky-900 font-medium">งบอุดหนุน:</span>
                      <div className="space-x-3 text-right">
                        <span className="text-slate-500">จัดสรร: <b className="text-slate-700">{dept.subsidy.allocated.toLocaleString()}</b></span>
                        <span className="text-slate-500">ใช้: <b className="text-amber-600">{dept.subsidy.used.toLocaleString()}</b></span>
                        <span className="text-slate-500">เหลือ: <b className="text-emerald-600">{dept.subsidy.remaining.toLocaleString()}</b></span>
                      </div>
                    </div>

                    {/* งบพัฒนาผู้เรียน */}
                    <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-emerald-50/60 border border-emerald-100/50">
                      <span className="text-emerald-900 font-medium">งบพัฒนาผู้เรียน:</span>
                      <div className="space-x-3 text-right">
                        <span className="text-slate-500">จัดสรร: <b className="text-slate-700">{dept.development.allocated.toLocaleString()}</b></span>
                        <span className="text-slate-500">ใช้: <b className="text-amber-600">{dept.development.used.toLocaleString()}</b></span>
                        <span className="text-slate-500">เหลือ: <b className="text-emerald-600">{dept.development.remaining.toLocaleString()}</b></span>
                      </div>
                    </div>

                    {/* งบรายได้/อื่นๆ หากมี */}
                    {dept.other.allocated > 0 && (
                      <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-amber-50/60 border border-amber-100/50">
                        <span className="text-amber-900 font-medium">งบรายได้/อื่นๆ:</span>
                        <div className="space-x-3 text-right">
                          <span className="text-slate-500">จัดสรร: <b className="text-slate-700">{dept.other.allocated.toLocaleString()}</b></span>
                          <span className="text-slate-500">ใช้: <b className="text-amber-600">{dept.other.used.toLocaleString()}</b></span>
                          <span className="text-slate-500">เหลือ: <b className="text-emerald-600">{dept.other.remaining.toLocaleString()}</b></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar at bottom */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex-1 mr-3">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-sky-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, Number(pct))}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-slate-500 font-medium whitespace-nowrap">
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
