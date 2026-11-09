'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Activity } from '@/lib/types';
import ExpenseModal from '@/components/ExpenseModal';
import ActivityModal from '@/components/ActivityModal';
import ProjectModal from '@/components/ProjectModal';
import { 
  FolderKanban, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  User, 
  Receipt, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Trash2, 
  Coins, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FolderPlus
} from 'lucide-react';

function ProjectsContent() {
  const searchParams = useSearchParams();
  const initialDept = searchParams.get('dept') || 'all';

  const { 
    currentYear, 
    filteredActivities, 
    filteredProjects, 
    db, 
    isAdmin, 
    deleteActivity 
  } = useApp();

  const [selectedDept, setSelectedDept] = useState<string>(initialDept);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  // Modals state
  const [expenseActivity, setExpenseActivity] = useState<Activity | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showAddActivityModal, setShowAddActivityModal] = useState<boolean>(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState<boolean>(false);

  // Departments list for tabs
  const departments = [
    { id: 'all', name: 'ทั้งหมด' },
    ...db.departments
  ];

  // Filtering activities
  const filtered = useMemo(() => {
    return filteredActivities.filter(a => {
      // Dept filter
      if (selectedDept !== 'all' && a.departmentId !== selectedDept) return false;
      // Budget Type filter
      if (selectedType !== 'all') {
        if (selectedType === 'subsidy' && a.budgetType !== 'งบอุดหนุน') return false;
        if (selectedType === 'dev' && a.budgetType !== 'งบพัฒนาผู้เรียน') return false;
        if (selectedType === 'other' && (a.budgetType === 'งบอุดหนุน' || a.budgetType === 'งบพัฒนาผู้เรียน')) return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = a.name.toLowerCase().includes(q);
        const matchProj = (a.projectName || '').toLowerCase().includes(q);
        const matchResp = (a.responsiblePerson || '').toLowerCase().includes(q);
        const matchSheet = (a.sheetCode || '').toLowerCase().includes(q);
        if (!matchName && !matchProj && !matchResp && !matchSheet) return false;
      }
      return true;
    });
  }, [filteredActivities, selectedDept, selectedType, searchTerm]);

  // Aggregate stats of current filtered list
  const filteredAllocated = filtered.reduce((s, a) => s + (a.allocatedAmount || 0), 0);
  const filteredUsed = filtered.reduce((s, a) => s + (a.usedAmount || 0), 0);
  const filteredRemaining = filteredAllocated - filteredUsed;

  const toggleExpand = (id: string) => {
    setExpandedActivityId(prev => prev === id ? null : id);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบกิจกรรม "${name}" ใช่หรือไม่?`)) {
      await deleteActivity(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100 mb-2">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>รายละเอียดกิจกรรมและโครงการ ปีงบ {currentYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            โครงการและกิจกรรมตามแผนปฏิบัติการ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ติดตามสถานะจัดสรรงบ ชนิดเงิน การเบิกจ่าย และประวัติการจ่ายเงินแต่ละกิจกรรม
          </p>
        </div>

        {/* Admin Action Buttons */}
        {isAdmin && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition-all"
            >
              <FolderPlus className="w-4 h-4 text-sky-600" />
              <span>+ เพิ่มโครงการ</span>
            </button>
            <button
              onClick={() => setShowAddActivityModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มกิจกรรม</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary Mini Cards for Current Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">งบจัดสรรตามตัวกรอง</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {filteredAllocated.toLocaleString()} <span className="text-xs font-normal text-slate-500">บาท</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">เบิกจ่ายแล้ว</div>
          <div className="text-xl font-extrabold text-amber-600 mt-1">
            {filteredUsed.toLocaleString()} <span className="text-xs font-normal text-slate-500">บาท</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">งบคงเหลือพร้อมใช้</div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">
            {filteredRemaining.toLocaleString()} <span className="text-xs font-normal text-slate-500">บาท</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
        {/* Department Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-1 border-b border-slate-100">
          {departments.map((d) => {
            const count = d.id === 'all' 
              ? filteredActivities.length 
              : filteredActivities.filter(a => a.departmentId === d.id).length;
            const isSel = selectedDept === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDept(d.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  isSel
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{d.name}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSel ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Second Row: Budget Type Filter + Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">ประเภทเงิน:</span>
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedType === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setSelectedType('subsidy')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedType === 'subsidy' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                งบอุดหนุน
              </button>
              <button
                onClick={() => setSelectedType('dev')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedType === 'dev' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                งบพัฒนาผู้เรียน
              </button>
              <button
                onClick={() => setSelectedType('other')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedType === 'other' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                งบรายได้/อื่นๆ
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหากิจกรรม, โครงการ, ครู..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">ไม่พบข้อมูลกิจกรรมตามเงื่อนไขที่เลือก</h3>
            <p className="text-xs text-slate-500 mt-1">ลองเปลี่ยนตัวกรอง หรือค้นหาด้วยคำอื่น</p>
          </div>
        ) : (
          filtered.map((activity) => {
            const isExpanded = expandedActivityId === activity.id;
            const hasExpenses = activity.expenses && activity.expenses.length > 0;
            const isDisbursed = activity.usedAmount > 0;

            // Badges
            const typeBadgeColor = activity.budgetType.includes('อุดหนุน')
              ? 'bg-sky-50 text-sky-700 border-sky-200'
              : activity.budgetType.includes('พัฒนาผู้เรียน')
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200';

            return (
              <div
                key={activity.id}
                className={`bg-white rounded-2xl border transition-all ${
                  isExpanded ? 'border-sky-300 shadow-md ring-1 ring-sky-200' : 'border-slate-200/90 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Main Activity Card Header */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Sequence, Name, Project, Dept, Responsible */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {activity.sheetCode && (
                          <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold">
                            ชีท {activity.sheetCode}
                          </span>
                        )}
                        {activity.seq && (
                          <span className="text-[11px] font-bold text-slate-500">
                            ลำดับ {activity.seq}
                          </span>
                        )}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${typeBadgeColor}`}>
                          {activity.budgetType}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {activity.departmentName}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 hover:text-sky-600 transition-colors">
                        {activity.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                        {activity.projectName && (
                          <span className="flex items-center space-x-1">
                            <span className="text-slate-400">โครงการ:</span>
                            <span className="font-medium text-slate-700">{activity.projectName}</span>
                          </span>
                        )}
                        {activity.responsiblePerson && (
                          <span className="flex items-center space-x-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>ผู้รับผิดชอบ: <b className="text-slate-700">{activity.responsiblePerson}</b></span>
                          </span>
                        )}
                        {activity.approvedDate && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>อนุมัติเมื่อ: <b className="text-slate-700">{activity.approvedDate}</b></span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Numbers and Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {/* Financial Figures */}
                      <div className="grid grid-cols-3 gap-3 text-center sm:text-right pr-2">
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">จัดสรร</div>
                          <div className="text-xs sm:text-sm font-bold text-slate-800">
                            {activity.allocatedAmount.toLocaleString()} ฿
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">เบิกจ่าย</div>
                          <div className="text-xs sm:text-sm font-bold text-amber-600">
                            {activity.usedAmount.toLocaleString()} ฿
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">คงเหลือ</div>
                          <div className="text-xs sm:text-sm font-extrabold text-emerald-600">
                            {activity.remainingAmount.toLocaleString()} ฿
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-1.5">
                        {/* Record Expense Button (Admin only) */}
                        {isAdmin && (
                          <button
                            onClick={() => setExpenseActivity(activity)}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                            title="บันทึกการเบิกจ่ายเงิน"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">เบิกจ่าย</span>
                          </button>
                        )}

                        {/* Edit & Delete (Admin only) */}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setEditingActivity(activity)}
                              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="แก้ไขกิจกรรม"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(activity.id, activity.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="ลบกิจกรรม"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Expand Details Button */}
                        <button
                          onClick={() => toggleExpand(activity.id)}
                          className={`p-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1 transition-colors ${
                            isExpanded
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="ดูรายละเอียดการจ่ายเงิน"
                        >
                          <span className="text-[11px] hidden sm:inline">
                            {hasExpenses ? `รายการจ่าย (${activity.expenses.length})` : 'รายละเอียด'}
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Section: Expense Details & Ledger */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                        <Receipt className="w-4 h-4 text-sky-600" />
                        <span>ประวัติรายการขออนุมัติและเบิกจ่ายงบประมาณ</span>
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => setExpenseActivity(activity)}
                          className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ เพิ่มรายการเบิกจ่าย</span>
                        </button>
                      )}
                    </div>

                    {hasExpenses ? (
                      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3 w-14 text-center">ครั้งที่</th>
                              <th className="py-2.5 px-3 w-32">วันที่อนุมัติ</th>
                              <th className="py-2.5 px-3">รายละเอียดการใช้จ่าย</th>
                              <th className="py-2.5 px-3 text-right w-28">งบที่ใช้ (บาท)</th>
                              <th className="py-2.5 px-3 text-right w-24">คืนเงิน (บาท)</th>
                              <th className="py-2.5 px-3 w-36">หมายเหตุ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {activity.expenses.map((exp, idx) => (
                              <tr key={exp.id || idx} className="hover:bg-slate-50/60">
                                <td className="py-2.5 px-3 text-center text-slate-500 font-medium">
                                  {exp.index || idx + 1}
                                </td>
                                <td className="py-2.5 px-3 text-slate-700 font-medium">
                                  {exp.date || '-'}
                                </td>
                                <td className="py-2.5 px-3 text-slate-800">
                                  {exp.description}
                                </td>
                                <td className="py-2.5 px-3 text-right font-bold text-amber-600">
                                  {(exp.amount || 0).toLocaleString()}
                                </td>
                                <td className="py-2.5 px-3 text-right text-slate-500">
                                  {(exp.refund || 0) > 0 ? (exp.refund || 0).toLocaleString() : '-'}
                                </td>
                                <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                                  {exp.note || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                        ยังไม่มีรายการเบิกจ่ายเงินในกิจกรรมนี้ (งบประมาณคงเหลือเต็มจำนวน {activity.allocatedAmount.toLocaleString()} บาท)
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {expenseActivity && (
        <ExpenseModal
          activity={expenseActivity}
          onClose={() => setExpenseActivity(null)}
        />
      )}

      {(showAddActivityModal || editingActivity) && (
        <ActivityModal
          activity={editingActivity}
          onClose={() => {
            setShowAddActivityModal(false);
            setEditingActivity(null);
          }}
        />
      )}

      {showAddProjectModal && (
        <ProjectModal
          onClose={() => setShowAddProjectModal(false)}
        />
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 text-sm">กำลังโหลดข้อมูลโครงการ...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}
