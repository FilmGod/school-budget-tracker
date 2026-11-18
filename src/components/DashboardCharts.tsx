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
import { BarChart3 } from 'lucide-react';

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

const COLORS = {
  completed: '#2f7d6a',
  inProgress: '#b5822f',
  pending: '#2c6ca8'
};

export default function DashboardCharts({ progressData }: DashboardChartsProps) {
  const totalActivities = progressData.reduce((sum, d) => sum + d.total, 0);
  const totalCompleted = progressData.reduce((sum, d) => sum + d.completed, 0);
  const totalInProgress = progressData.reduce((sum, d) => sum + d.inProgress, 0);
  const totalPending = progressData.reduce((sum, d) => sum + d.pending, 0);

  return (
    <section className="card">
      <div className="flex flex-col gap-3 border-b border-line px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-brand">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="card-title">แผนภูมิความคืบหน้าของกิจกรรม</h3>
            <p className="text-xs text-muted">
              สถานะกิจกรรมรวม {totalActivities} กิจกรรม (จำแนกตาม 4 ฝ่ายบริหาร)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="chip bg-canvas text-muted">ทั้งหมด {totalActivities}</span>
          <span className="chip bg-canvas" style={{ color: COLORS.completed }}>
            เสร็จสิ้น {totalCompleted}
          </span>
          <span className="chip bg-canvas" style={{ color: COLORS.inProgress }}>
            กำลังทำ {totalInProgress}
          </span>
          <span className="chip bg-canvas" style={{ color: COLORS.pending }}>
            รอเริ่ม {totalPending}
          </span>
        </div>
      </div>

      <div className="h-64 w-full px-2 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={progressData} margin={{ top: 12, right: 25, left: -5, bottom: 5 }} barSize={26}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.35} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#7a8699' }}
              axisLine={{ stroke: '#e3e8ef' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#7a8699' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(val: number) => [`${val} กิจกรรม`, '']}
              contentStyle={{
                borderRadius: 6,
                border: '1px solid #e3e8ef',
                backgroundColor: '#ffffff',
                color: '#0f1b2d',
                boxShadow: '0 2px 8px rgba(15,27,45,0.08)',
                fontSize: 13
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="completed" name="กิจกรรมที่เสร็จสิ้น" fill={COLORS.completed} radius={[2, 2, 0, 0]} animationDuration={650} animationEasing="ease-out" />
            <Bar dataKey="inProgress" name="กำลังดำเนินการ" fill={COLORS.inProgress} radius={[2, 2, 0, 0]} animationDuration={650} animationEasing="ease-out" />
            <Bar dataKey="pending" name="รอเริ่มดำเนินงาน" fill={COLORS.pending} radius={[2, 2, 0, 0]} animationDuration={650} animationEasing="ease-out" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-line px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
        {progressData.map((dept, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-xs font-medium text-body">{dept.fullName}</span>
              <span className="num text-xs font-semibold text-brand">{dept.percent}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${dept.percent}%` }} />
            </div>
            <div className="flex items-center justify-between text-[0.68rem] text-muted">
              <span>เสร็จ {dept.completed}/{dept.total}</span>
              <span>กำลังทำ {dept.inProgress}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
