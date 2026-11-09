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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartProps {
  deptChartData: Array<{
    name: string;
    allocated: number;
    used: number;
    remaining: number;
  }>;
  typeChartData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const formatBaht = (val: number) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
  return val.toLocaleString();
};

export default function DashboardCharts({ deptChartData, typeChartData }: ChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Bar Chart: Budget Comparison by Department */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              เปรียบเทียบงบประมาณที่จัดสรร vs เบิกจ่ายจริง รายฝ่าย
            </h3>
            <p className="text-xs text-slate-500">
              แสดงงบประมาณจัดสรรและยอดเบิกจ่ายสะสมของทั้ง 4 ฝ่าย
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={deptChartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tickFormatter={formatBaht} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val: number) => [`${val.toLocaleString()} บาท`, '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="allocated" name="งบจัดสรร (บาท)" fill="#0284c7" radius={[6, 6, 0, 0]} />
              <Bar dataKey="used" name="เบิกจ่ายแล้ว (บาท)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="remaining" name="คงเหลือ (บาท)" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart: Budget Breakdown by Type */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            สัดส่วนการจัดสรรตามประเภทเงิน
          </h3>
          <p className="text-xs text-slate-500 mb-2">
            งบอุดหนุน, งบพัฒนาผู้เรียน และงบรายได้
          </p>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val.toLocaleString()} บาท`, '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend list */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          {typeChartData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 font-medium">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-800">
                {item.value.toLocaleString()} ฿
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
