'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import DashboardCharts, { ProgressChartItem } from '@/components/DashboardCharts';
import AnimatedCounter from '@/components/AnimatedCounter';
import { normalizeBudgetType } from '@/lib/budget';
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

  // Budget Breakdown Calculations (values are normalised so imported variants
  // such as "พื้นที่นวัตกรรม 69" still land in the right bucket)
  const budgetOf = (a: { budgetType?: string | null }) => normalizeBudgetType(a.budgetType);

  const innovAllocated = filteredActivities
    .filter(a => budgetOf(a) === 'งบพื้นที่นวัตกรรม')
    .reduce((sum, a) => sum + (a.allocatedAmount || 0), 0);
  const innovUsed = filteredActivities
    .filter(a => budgetOf(a) === 'งบพื้นที่นวัตกรรม')
    .reduce((sum, a) => sum + (a.usedAmount || 0), 0);
  const innovRemaining = innovAllocated - innovUsed;

  const subsidyAllocated = filteredActivities
    .filter(a => budgetOf(a) === 'งบอุดหนุน')
    .reduce((sum, a) => sum + (a.allocatedAmount || 0), 0);
  const subsidyUsed = filteredActivities
    .filter(a => budgetOf(a) === 'งบอุดหนุน')
    .reduce((sum, a) => sum + (a.usedAmount || 0), 0);
  const subsidyRemaining = subsidyAllocated - subsidyUsed;

  const devAllocated = filteredActivities
    .filter(a => budgetOf(a) === 'งบพัฒนาผู้เรียน')
    .reduce((sum, a) => sum + (a.allocatedAmount || 0), 0);
  const devUsed = filteredActivities
    .filter(a => budgetOf(a) === 'งบพัฒนาผู้เรียน')
    .reduce((sum, a) => sum + (a.usedAmount || 0), 0);
  const devRemaining = devAllocated - devUsed;

  const otherAllocated = filteredActivities
    .filter(a => !['งบพื้นที่นวัตกรรม', 'งบอุดหนุน', 'งบพัฒนาผู้เรียน'].includes(budgetOf(a)))
    .reduce((sum, a) => sum + (a.allocatedAmount || 0), 0);
  const otherUsed = filteredActivities
    .filter(a => !['งบพื้นที่นวัตกรรม', 'งบอุดหนุน', 'งบพัฒนาผู้เรียน'].includes(budgetOf(a)))
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
    <div className="space-y-6 stagger">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted">
            ภาพรวมการติดตามงบประมาณ ปีงบ {currentYear}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-ink">แดชบอร์ดงบประมาณตามแผนปฏิบัติการ</h1>
          <p className="mt-1 text-sm text-muted">สรุปภาพรวมการจัดสรรและการเบิกจ่ายงบประมาณประจำปี</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/projects" className="btn-primary">
            ดูรายละเอียดโครงการ
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/reports" className="btn-ghost">
            กรอกรายงานกิจกรรม
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="stat-label">งบรวมที่ได้รับจัดสรร</span>
            <Wallet className="h-4 w-4 text-muted" />
          </div>
          <p className="stat-value mt-3">
            <AnimatedCounter value={totalAllocated} /> <span className="text-sm font-medium text-muted">บาท</span>
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs text-muted">
            <span>จำนวนกิจกรรมทั้งหมด</span>
            <span className="font-semibold text-ink">{filteredActivities.length} กิจกรรม</span>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="stat-label">ยอดเบิกจ่ายแล้ว</span>
            <TrendingDown className="h-4 w-4 text-muted" />
          </div>
          <p className="stat-value mt-3">
            <AnimatedCounter value={totalUsed} /> <span className="text-sm font-medium text-muted">บาท</span>
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs text-muted">
            <span>สัดส่วนการเบิกจ่าย</span>
            <span className="font-semibold text-ink">{usedPercentage}% ของงบรวม</span>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="stat-label">ยอดงบประมาณคงเหลือ</span>
            <Coins className="h-4 w-4 text-muted" />
          </div>
          <p className="stat-value mt-3">
            <AnimatedCounter value={totalRemaining} /> <span className="text-sm font-medium text-muted">บาท</span>
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs text-muted">
            <span>พร้อมดำเนินงาน</span>
            <span className="font-semibold text-ink">{(100 - Number(usedPercentage)).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Budget type breakdown */}
      <section className="card">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div>
            <h2 className="card-title">แยกตามประเภทงบประมาณหลัก</h2>
            <p className="text-xs text-muted">งบอุดหนุนดำเนินงานและงบพัฒนาผู้เรียน</p>
          </div>
          <span className="chip bg-canvas text-muted">ปีงบ {currentYear}</span>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {[
            {
              key: 'innovation',
              title: 'งบพื้นที่นวัตกรรม',
              desc: 'งบประมาณส่งเสริมและพัฒนานวัตกรรมการศึกษา',
              color: 'var(--budget-innovation)',
              allocated: innovAllocated,
              used: innovUsed,
              remaining: innovRemaining
            },
            {
              key: 'subsidy',
              title: 'งบอุดหนุน',
              desc: 'เงินอุดหนุนรายหัวและค่าใช้จ่ายดำเนินงานพื้นฐาน',
              color: 'var(--budget-subsidy)',
              allocated: subsidyAllocated,
              used: subsidyUsed,
              remaining: subsidyRemaining
            },
            {
              key: 'dev',
              title: 'งบพัฒนาผู้เรียน',
              desc: 'กิจกรรมพัฒนาคุณภาพผู้เรียนและทักษะชีวิต',
              color: 'var(--budget-dev)',
              allocated: devAllocated,
              used: devUsed,
              remaining: devRemaining
            },
            {
              key: 'other',
              title: 'งบรายได้สถานศึกษา / อื่นๆ',
              desc: 'รายได้จากการระดมทรัพยากร เงินบริจาค และงบอื่นๆ',
              color: 'var(--budget-other)',
              allocated: otherAllocated,
              used: otherUsed,
              remaining: otherRemaining
            }
          ].map((type) => {
            const pct = type.allocated > 0 ? (type.used / type.allocated) * 100 : 0;
            return (
              <div
                key={type.key}
                className="rounded-md border border-line p-4 pl-5"
                style={{ borderLeft: `6px solid ${type.color}` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-ink">{type.title}</h3>
                    <p className="text-[0.7rem] leading-snug text-muted">{type.desc}</p>
                  </div>
                  <span className="chip bg-canvas" style={{ color: type.color }}>
                    {pct.toFixed(1)}% เบิกแล้ว
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="stat-label">งบจัดสรร</div>
                    <div className="mt-0.5 text-sm font-semibold text-ink">
                      <AnimatedCounter value={type.allocated} />
                    </div>
                  </div>
                  <div>
                    <div className="stat-label">ใช้ไปแล้ว</div>
                    <div className="mt-0.5 text-sm font-semibold" style={{ color: 'var(--budget-other)' }}>
                      <AnimatedCounter value={type.used} />
                    </div>
                  </div>
                  <div>
                    <div className="stat-label">คงเหลือ</div>
                    <div className="mt-0.5 text-sm font-semibold" style={{ color: 'var(--budget-dev)' }}>
                      <AnimatedCounter value={type.remaining} />
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${barsAnimated ? Math.min(100, pct) : 0}%`,
                        backgroundColor: type.color
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Charts */}
      <DashboardCharts progressData={progressData} />

      {/* Departments */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-ink">สถานะงบประมาณแยกตาม 4 ฝ่ายบริหาร</h2>
            <p className="text-xs text-muted">สรุปข้อมูลตามโครงสร้าง 4 กลุ่มบริหารงาน</p>
          </div>
          <Link href="/projects" className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
            <span>ดูรายการกิจกรรมทั้งหมด</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {departmentData.map((dept) => {
            const Icon = dept.icon;
            const pct = dept.allocated > 0 ? (dept.used / dept.allocated) * 100 : 0;
            return (
              <div key={dept.id} className="card flex flex-col justify-between p-5">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-brand">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-ink">{dept.name}</h3>
                        <p className="text-[0.7rem] text-muted">{dept.count} กิจกรรมตามแผน</p>
                      </div>
                    </div>
                    <Link
                      href={`/projects?dept=${dept.id}`}
                      className="btn-ghost px-2 py-1 text-[0.68rem]"
                    >
                      เปิดดูฝ่ายนี้
                    </Link>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-md bg-canvas py-2.5 text-center">
                    <div>
                      <div className="stat-label">ได้รับจัดสรร</div>
                      <div className="num text-sm font-semibold text-ink">{dept.allocated.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="stat-label">เบิกจ่ายแล้ว</div>
                      <div className="num text-sm font-semibold" style={{ color: 'var(--budget-other)' }}>
                        {dept.used.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="stat-label">คงเหลือ</div>
                      <div className="num text-sm font-semibold" style={{ color: 'var(--budget-dev)' }}>
                        {dept.remaining.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-line pt-2.5 text-[0.68rem] sm:text-[0.72rem]">
                    <div className="grid grid-cols-[1.7fr_0.9fr_0.9fr_1fr] items-baseline gap-x-2 pb-1 text-muted sm:grid-cols-[1.2fr_1fr_1fr_1fr]">
                      <span>ประเภทงบ</span>
                      <span className="num">จัดสรร</span>
                      <span className="num">ใช้ไป</span>
                      <span className="num">คงเหลือ</span>
                    </div>
                    {[
                      { label: 'งบอุดหนุน', data: dept.subsidy },
                      { label: 'งบพัฒนาผู้เรียน', data: dept.development },
                      ...(dept.other.allocated > 0 ? [{ label: 'งบรายได้/อื่นๆ', data: dept.other }] : [])
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="grid grid-cols-[1.7fr_0.9fr_0.9fr_1fr] items-baseline gap-x-2 border-t border-line/70 py-1 text-body sm:grid-cols-[1.2fr_1fr_1fr_1fr]"
                      >
                        <span>{row.label}</span>
                        <span className="num">{row.data.allocated.toLocaleString()}</span>
                        <span className="num">{row.data.used.toLocaleString()}</span>
                        <span className="num text-ink">{row.data.remaining.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
                  <div className="progress-track flex-1">
                    <div className="progress-fill" style={{ width: `${barsAnimated ? Math.min(100, pct) : 0}%` }} />
                  </div>
                  <span className="num text-xs font-medium text-muted">เบิกจ่าย {pct.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
