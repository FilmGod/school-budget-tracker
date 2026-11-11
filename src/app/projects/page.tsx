'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { createPortal } from 'react-dom';
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
  FolderPlus,
  RefreshCw
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
    deleteActivity,
    deleteProject,
    syncGoogleSheets 
  } = useApp();

  const [viewMode, setViewMode] = useState<'activities' | 'projects'>('activities');
  const [selectedDept, setSelectedDept] = useState<string>(initialDept);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [barsAnimated, setBarsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBarsAnimated(true), 120);
    return () => clearTimeout(timer);
  }, []);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<{ message: string; isError?: boolean } | null>(null);

  // Modals state
  const [expenseActivity, setExpenseActivity] = useState<Activity | null>(null);
  const [expenseInitialMode, setExpenseInitialMode] = useState<'add' | 'edit'>('add');
  const [expenseInitialIndex, setExpenseInitialIndex] = useState<number>(0);
  const [confirmEditActivity, setConfirmEditActivity] = useState<Activity | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showAddActivityModal, setShowAddActivityModal] = useState<boolean>(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState<boolean>(false);
  const [quickAddProjectId, setQuickAddProjectId] = useState<string | null>(null);
  const [quickAddDeptId, setQuickAddDeptId] = useState<string | null>(null);

  const handleExpenseButtonClick = (act: Activity) => {
    const isDisbursed = (act.expenses && act.expenses.length > 0) || (act.usedAmount || 0) > 0;
    if (isDisbursed) {
      setConfirmEditActivity(act);
    } else {
      setExpenseInitialMode('add');
      setExpenseInitialIndex(0);
      setExpenseActivity(act);
    }
  };

  const handleSyncFromSheet = async () => {
    setIsSyncing(true);
    const result = await syncGoogleSheets();
    setIsSyncing(false);
    setSyncToast({ message: result.message, isError: !result.success });
    setTimeout(() => {
      setSyncToast(null);
    }, 5000);
  };

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
        if (selectedType === 'innovation' && a.budgetType !== 'งบพื้นที่นวัตกรรม') return false;
        if (selectedType === 'subsidy' && a.budgetType !== 'งบอุดหนุน') return false;
        if (selectedType === 'dev' && a.budgetType !== 'งบพัฒนาผู้เรียน') return false;
        if (selectedType === 'other' && (a.budgetType === 'งบอุดหนุน' || a.budgetType === 'งบพัฒนาผู้เรียน' || a.budgetType === 'งบพื้นที่นวัตกรรม')) return false;
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

  // Filtering projects
  const filteredProjectList = useMemo(() => {
    return filteredProjects.filter(p => {
      if (selectedDept !== 'all' && p.departmentId !== selectedDept) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.departmentName || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [filteredProjects, selectedDept, searchTerm]);

  // Aggregate stats of current filtered list
  const filteredAllocated = filtered.reduce((s, a) => s + (a.allocatedAmount || 0), 0);
  const filteredUsed = filtered.reduce((s, a) => s + (a.usedAmount || 0), 0);
  const filteredRemaining = filteredAllocated - filteredUsed;

  const toggleExpand = (id: string) => {
    setExpandedActivityId(prev => prev === id ? null : id);
  };

  const toggleExpandProject = (id: string) => {
    setExpandedProjectId(prev => prev === id ? null : id);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบกิจกรรม "${name}" ใช่หรือไม่?`)) {
      await deleteActivity(id);
      setSyncToast({ message: `ลบกิจกรรม "${name}" แล้ว`, isError: false });
      setTimeout(() => setSyncToast(null), 4000);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    const acts = filteredActivities.filter(a => a.projectId === id);
    if (acts.length > 0) {
      if (!confirm(`โครงการ "${name}" มีกิจกรรมผูกอยู่ ${acts.length} กิจกรรม คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้?`)) {
        return;
      }
    } else {
      if (!confirm(`คุณต้องการลบโครงการ "${name}" ใช่หรือไม่?`)) {
        return;
      }
    }
    await deleteProject(id);
    setSyncToast({ message: `ลบโครงการ "${name}" เรียบร้อยแล้ว`, isError: false });
    setTimeout(() => setSyncToast(null), 4000);
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            โครงการและกิจกรรมตามแผนปฏิบัติการ
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            รายการโครงการและกิจกรรมตามแผนปฏิบัติการประจำปี
          </p>
        </div>

        {/* Admin Action Buttons */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncFromSheet}
              disabled={isSyncing}
              title="ดึงข้อมูลกิจกรรมและงบประมาณล่าสุดจาก Google Sheets"
              className="active-press inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-800 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <span>{isSyncing ? 'กำลังซิงค์ Sheet...' : 'ซิงค์กับ Google Sheet'}</span>
            </button>
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="active-press inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
            >
              <FolderPlus className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>เพิ่มโครงการ</span>
            </button>
            <button
              onClick={() => setShowAddActivityModal(true)}
              className="active-press inline-flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มกิจกรรม</span>
            </button>
          </div>
        )}
      </div>

      {/* Toast Alert for Google Sheets Sync */}
      {syncToast && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md animate-fadeIn ${
          syncToast.isError
            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        }`}>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{syncToast.message}</span>
          </div>
          <button 
            onClick={() => setSyncToast(null)} 
            className="text-xs font-bold underline ml-3 opacity-70 hover:opacity-100 cursor-pointer"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Summary Mini Cards for Current Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">งบจัดสรร</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {filteredAllocated.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">บาท</span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">เบิกจ่ายแล้ว</div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {filteredUsed.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">บาท</span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">งบคงเหลือ</div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {filteredRemaining.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">บาท</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Department Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800">
          {departments.map((d) => {
            const count = d.id === 'all' 
              ? filteredActivities.length 
              : filteredActivities.filter(a => a.departmentId === d.id).length;
            const isSel = selectedDept === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDept(d.id)}
                className={`active-press px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  isSel
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{d.name}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSel ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Second Row: Budget Type Filter + Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">ประเภทเงิน:</span>
            <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setSelectedType('all')}
                className={`active-press px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedType === 'all' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setSelectedType('innovation')}
                className={`active-press px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedType === 'innovation' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                งบพื้นที่นวัตกรรม
              </button>
              <button
                onClick={() => setSelectedType('subsidy')}
                className={`active-press px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedType === 'subsidy' ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                งบอุดหนุน
              </button>
              <button
                onClick={() => setSelectedType('dev')}
                className={`active-press px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedType === 'dev' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                งบพัฒนาผู้เรียน
              </button>
              <button
                onClick={() => setSelectedType('other')}
                className={`active-press px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedType === 'other' ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                งบรายได้/อื่นๆ
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหากิจกรรม, โครงการ, ครู..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* View Mode Toggle: รายการกิจกรรม vs กลุ่มโครงการ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setViewMode('activities')}
            className={`active-press px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              viewMode === 'activities'
                ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>มุมมองตามกิจกรรม</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-mono">
              {filtered.length}
            </span>
          </button>
          <button
            onClick={() => setViewMode('projects')}
            className={`active-press px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              viewMode === 'projects'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>มุมมองแยกตามโครงการ</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono">
              {filteredProjectList.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          {viewMode === 'activities' 
            ? `แสดงทั้งหมด ${filtered.length} กิจกรรม`
            : `แสดงทั้งหมด ${filteredProjectList.length} โครงการ (${filteredActivities.length} กิจกรรมย่อย)`}
        </div>
      </div>

      {viewMode === 'projects' ? (
        <div className="space-y-4">
          {filteredProjectList.length === 0 ? (
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <FolderPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">ไม่พบโครงการตามเงื่อนไขที่เลือก</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">กดปุ่ม &quot;+ เพิ่มโครงการ&quot; ด้านบนเพื่อสร้างโครงการใหม่</p>
            </div>
          ) : (
            filteredProjectList.map((project) => {
              const projectActs = filteredActivities.filter(a => a.projectId === project.id);
              const projAllocated = projectActs.reduce((s, a) => s + (a.allocatedAmount || 0), 0);
              const projUsed = projectActs.reduce((s, a) => s + (a.usedAmount || 0), 0);
              const projRemaining = projAllocated - projUsed;
              const percentUsed = projAllocated > 0 ? (projUsed / projAllocated) * 100 : 0;
              const isExpanded = expandedProjectId === project.id;

              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover-card transition-all overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Project info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            โครงการ
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {project.departmentName}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                            {projectActs.length} กิจกรรม
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {project.name}
                        </h3>

                        {/* Progress bar */}
                        <div className="max-w-md pt-1">
                          <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                            <span>เบิกจ่ายแล้ว {percentUsed.toFixed(1)}%</span>
                            <span>คงเหลือ {projRemaining.toLocaleString()} บาท</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-sky-500 h-2 rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                              style={{ width: `${barsAnimated ? Math.min(100, Math.max(0, percentUsed)) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Amounts & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:text-right">
                        <div className="grid grid-cols-3 sm:flex sm:items-center gap-3 sm:gap-6 text-left sm:text-right">
                          <div>
                            <div className="text-[10px] text-slate-400 font-medium">งบจัดสรรรวม</div>
                            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                              {projAllocated.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 font-medium">เบิกจ่ายแล้ว</div>
                            <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                              {projUsed.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 font-medium">คงเหลือ</div>
                            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                              {projRemaining.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => {
                                  setQuickAddProjectId(project.id);
                                  setQuickAddDeptId(project.departmentId);
                                }}
                                title="เพิ่มกิจกรรมใหม่ในโครงการนี้"
                                className="active-press inline-flex items-center space-x-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-xl text-xs font-semibold border border-sky-200 dark:border-sky-800 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>เพิ่มกิจกรรม</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id, project.name)}
                                title="ลบโครงการ"
                                className="active-press p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => toggleExpandProject(project.id)}
                            className="active-press inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                          >
                            <span>{isExpanded ? 'ย่อกิจกรรม' : `ดูกิจกรรม (${projectActs.length})`}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Activities List for this project (Smooth Accordion) */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-4 sm:p-5 space-y-2.5">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                          <span>กิจกรรมในโครงการ ({projectActs.length} กิจกรรม)</span>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setQuickAddProjectId(project.id);
                                setQuickAddDeptId(project.departmentId);
                              }}
                              className="active-press text-sky-600 hover:text-sky-700 dark:text-sky-400 font-semibold text-xs flex items-center space-x-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>เพิ่มกิจกรรมในโครงการนี้</span>
                            </button>
                          )}
                        </div>

                        {projectActs.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                            ยังไม่มีกิจกรรมภายใต้โครงการนี้ กดปุ่ม &quot;+ เพิ่มกิจกรรม&quot; เพื่อเริ่มต้น
                          </div>
                        ) : (
                          projectActs.map((act) => (
                            <div
                              key={act.id}
                              className="bg-white dark:bg-[#1e293b] rounded-xl p-3 sm:p-4 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  {act.seq && (
                                    <span className="text-[10px] font-bold text-slate-400">
                                      ลำดับ {act.seq}
                                    </span>
                                  )}
                                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {act.budgetType}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {act.responsiblePerson ? `ผู้รับผิดชอบ: ${act.responsiblePerson}` : ''}
                                  </span>
                                </div>
                                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                  {act.name}
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                                <div>
                                  <span className="text-slate-400 text-[10px] block">จัดสรร</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{act.allocatedAmount.toLocaleString()} บ.</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] block">เบิกแล้ว</span>
                                  <span className="font-bold text-amber-600 dark:text-amber-400">{act.usedAmount.toLocaleString()} บ.</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] block">คงเหลือ</span>
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{act.remainingAmount.toLocaleString()} บ.</span>
                                </div>

                                <div className="flex items-center space-x-1.5 ml-2">
                                  {(() => {
                                    const actDisbursed = (act.expenses && act.expenses.length > 0) || (act.usedAmount || 0) > 0;
                                    return (
                                      <button
                                        onClick={() => handleExpenseButtonClick(act)}
                                        className={`active-press px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center space-x-1 border transition-colors ${
                                          actDisbursed
                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                            : 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                        }`}
                                        title={actDisbursed ? 'เบิกจ่ายแล้ว (คลิกเพื่อแก้ไขข้อมูลการเบิกจ่าย)' : 'บันทึกการเบิกจ่ายเงิน'}
                                      >
                                        {actDisbursed ? (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        ) : (
                                          <Receipt className="w-3.5 h-3.5" />
                                        )}
                                        <span>{actDisbursed ? 'เบิกจ่ายแล้ว' : 'เบิกจ่าย'}</span>
                                      </button>
                                    );
                                  })()}
                                  {isAdmin && (
                                    <>
                                      <button
                                        onClick={() => setEditingActivity(act)}
                                        className="active-press p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(act.id, act.name)}
                                        className="active-press p-1.5 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
      /* Activities List */
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
                className={`bg-white dark:bg-[#1e293b] rounded-2xl border transition-all ${
                  isExpanded ? 'border-sky-300 dark:border-sky-600 shadow-md ring-1 ring-sky-200 dark:ring-sky-900/50' : 'border-slate-200/90 dark:border-slate-800 shadow-xs hover-card'
                }`}
              >
                {/* Main Activity Card Header */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Sequence, Name, Project, Dept, Responsible */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {activity.sheetCode && (
                          <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-bold">
                            ชีท {activity.sheetCode}
                          </span>
                        )}
                        {activity.seq && (
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            ลำดับ {activity.seq}
                          </span>
                        )}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${typeBadgeColor}`}>
                          {activity.budgetType}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          {activity.departmentName}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                        {activity.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
                        {activity.projectName && (
                          <span className="flex items-center space-x-1">
                            <span className="text-slate-400 dark:text-slate-500">โครงการ:</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{activity.projectName}</span>
                          </span>
                        )}
                        {activity.responsiblePerson && (
                          <span className="flex items-center space-x-1">
                            <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                            <span>ผู้รับผิดชอบ: <b className="text-slate-700 dark:text-slate-200">{activity.responsiblePerson}</b></span>
                          </span>
                        )}
                        {activity.approvedDate && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                            <span>อนุมัติเมื่อ: <b className="text-slate-700 dark:text-slate-200">{activity.approvedDate}</b></span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Numbers and Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      {/* Financial Figures */}
                      <div className="grid grid-cols-3 gap-3 text-center sm:text-right pr-2">
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">จัดสรร</div>
                          <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                            {activity.allocatedAmount.toLocaleString()} ฿
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">เบิกจ่าย</div>
                          <div className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
                            {activity.usedAmount.toLocaleString()} ฿
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">คงเหลือ</div>
                          <div className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                            {activity.remainingAmount.toLocaleString()} ฿
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-1.5">
                        {/* Record / Edit Expense Button */}
                        <button
                          onClick={() => handleExpenseButtonClick(activity)}
                          className={`active-press px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-colors ${
                            hasExpenses || isDisbursed
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                              : 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                          title={hasExpenses || isDisbursed ? 'เบิกจ่ายแล้ว (คลิกเพื่อแก้ไขข้อมูลการเบิกจ่าย)' : 'บันทึกการเบิกจ่ายเงิน'}
                        >
                          {hasExpenses || isDisbursed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Receipt className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {hasExpenses || isDisbursed ? 'เบิกจ่ายแล้ว' : 'เบิกจ่าย'}
                          </span>
                        </button>

                        {/* Edit & Delete (Admin only) */}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setEditingActivity(activity)}
                              className="active-press p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="แก้ไขกิจกรรม"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(activity.id, activity.name)}
                              className="active-press p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="ลบกิจกรรม"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Expand Details Button */}
                        <button
                          onClick={() => toggleExpand(activity.id)}
                          className={`active-press p-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1 transition-colors ${
                            isExpanded
                              ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                          }`}
                          title="ดูรายละเอียดการจ่ายเงิน"
                        >
                          <span className="text-[11px] hidden sm:inline">
                            {hasExpenses ? `รายการจ่าย (${activity.expenses.length})` : 'รายละเอียด'}
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Section: Expense Details & Ledger (Smooth Accordion) */}
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-3 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
                          <Receipt className="w-4 h-4 text-sky-600" />
                          <span>ประวัติรายการขออนุมัติและเบิกจ่ายงบประมาณ</span>
                        </span>
                        <button
                          onClick={() => {
                            setExpenseInitialMode('add');
                            setExpenseInitialIndex(0);
                            setExpenseActivity(activity);
                          }}
                          className="active-press text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>เพิ่มรายการเบิกจ่าย</span>
                        </button>
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
                                <th className="py-2.5 px-3 w-32">หมายเหตุ</th>
                                <th className="py-2.5 px-3 w-16 text-center">จัดการ</th>
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
                                  <td className="py-2 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setExpenseInitialMode('edit');
                                        setExpenseInitialIndex(idx);
                                        setExpenseActivity(activity);
                                      }}
                                      className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                      title="แก้ไขรายการเบิกจ่ายนี้"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
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
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      )}

      {/* Confirmation Modal for Editing Existing Expense */}
      {confirmEditActivity && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmEditActivity(null);
          }}
        >
          <div
            className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ต้องการแก้ไขข้อมูลการเบิกจ่ายใช่หรือไม่?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                กิจกรรม: <span className="font-semibold text-slate-700 dark:text-slate-200">{confirmEditActivity.name}</span>
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                ยอดเบิกจ่ายปัจจุบัน: {confirmEditActivity.usedAmount.toLocaleString()} บาท
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmEditActivity(null)}
                className="active-press flex-1 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                ไม่ใช่
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetAct = confirmEditActivity;
                  setConfirmEditActivity(null);
                  setExpenseInitialMode('edit');
                  setExpenseInitialIndex(0);
                  setExpenseActivity(targetAct);
                }}
                className="active-press flex-1 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
              >
                ใช่
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modals */}
      {expenseActivity && (
        <ExpenseModal
          activity={expenseActivity}
          initialMode={expenseInitialMode}
          initialExpenseIndex={expenseInitialIndex}
          onClose={() => setExpenseActivity(null)}
        />
      )}

      {(showAddActivityModal || editingActivity || quickAddProjectId) && (
        <ActivityModal
          activity={editingActivity}
          defaultProjectId={quickAddProjectId || undefined}
          defaultDepartmentId={quickAddDeptId || undefined}
          onClose={() => {
            setShowAddActivityModal(false);
            setEditingActivity(null);
            setQuickAddProjectId(null);
            setQuickAddDeptId(null);
          }}
          onSuccess={(act) => {
            setViewMode('activities');
            if (selectedDept !== 'all' && selectedDept !== act.departmentId) {
              setSelectedDept(act.departmentId);
            }
            setSyncToast({ message: `บันทึกกิจกรรม "${act.name}" เรียบร้อยแล้ว`, isError: false });
            setTimeout(() => setSyncToast(null), 5000);
          }}
        />
      )}

      {showAddProjectModal && (
        <ProjectModal
          onClose={() => setShowAddProjectModal(false)}
          onSuccess={(proj) => {
            setViewMode('projects');
            if (selectedDept !== 'all' && selectedDept !== proj.departmentId) {
              setSelectedDept(proj.departmentId);
            }
            setSyncToast({ message: `บันทึกโครงการ "${proj.name}" สำเร็จแล้ว`, isError: false });
            setTimeout(() => setSyncToast(null), 5000);
          }}
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
