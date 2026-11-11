'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CheckCircle2, Clock, PlayCircle, BarChart3 } from 'lucide-react';

export interface ProgressChartItem {
  name: string;
  fullName: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  percent: number;
}

interface DashboardChartsProps {
  progressData: ProgressChartItem[];
}

export default function DashboardCharts({ progressData }: DashboardChartsProps) {
  const totalActivities = progressData.reduce((sum, d) => sum + d.total, 0);
  const totalCompleted = progressData.reduce((sum, d) => sum + d.completed, 0);
  const totalInProgress = progressData.reduce((sum, d) => sum + d.inProgress, 0);
  const totalPending = progressData.reduce((sum, d) => sum + d.pending, 0);

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs hover-card space-y-5">
      {/* Header with Status Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              แผนภูมิความคืบหน้าของกิจกรรม
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              สถานะกิจกรรมรวม {totalActivities} กิจกรรม (จำแนกตาม 4 ฝ่ายบริหาร)
            </p>
          </div>
        </div>

        {/* Status Chips with Pulsing Dots */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>ทั้งหมด {totalActivities}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center space-x-1.5 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>เสร็จสิ้น {totalCompleted}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 flex items-center space-x-1.5 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>กำลังทำ {totalInProgress}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/60 flex items-center space-x-1.5 text-xs font-semibold">
            <PlayCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>รอเริ่ม {totalPending}</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={progressData}
            margin={{ top: 12, right: 25, left: -5, bottom: 5 }}
            barSize={32}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
            <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#64748b', fontWeight: 600 }} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
            <Tooltip
              formatter={(val: number) => [`${val} กิจกรรม`, '']}
              contentStyle={{ borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f8fafc', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', fontSize: '13px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            <Bar dataKey="completed" name="กิจกรรมที่เสร็จสิ้น" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="inProgress" name="กำลังดำเนินการ" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            <Bar dataKey="pending" name="รอเริ่มดำเนินงาน" fill="#0284c7" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Progress Cards per Department */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {progressData.map((dept, i) => (
          <div key={i} className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 space-y-2 hover-card">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              <span className="truncate">{dept.fullName}</span>
              <span className="text-sky-700 dark:text-sky-400 font-extrabold">{dept.percent}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-700 ease-out animate-shimmer"
                style={{ width: `${dept.percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>เสร็จ {dept.completed}/{dept.total}</span>
              <span>กำลังทำ {dept.inProgress}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
