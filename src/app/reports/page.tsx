'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ActivityReport, EvaluationItem } from '@/lib/types';
import ReportPrintView from '@/components/ReportPrintView';
import { exportReportToDocx } from '@/lib/docxExport';
import { 
  FileText, 
  Download, 
  Printer, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  CheckCircle2, 
  Eye, 
  Sparkles, 
  Layers, 
  Calendar, 
  User, 
  UploadCloud, 
  FileCheck2,
  Search,
  Edit3,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle,
  AlertCircle,
  FolderOpen
} from 'lucide-react';

function ReportsContent() {
  const searchParams = useSearchParams();
  const actIdParam = searchParams.get('actId');

  const { 
    currentYear, 
    filteredActivities, 
    filteredProjects, 
    filteredReports, 
    saveReport,
    deleteReport
  } = useApp();

  // Mode: 'form' | 'preview'
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');
  // Tab: 'form' (กรอกรายงาน) | 'reported' (กิจกรรมที่รายงานแล้ว)
  const [activeTab, setActiveTab] = useState<'form' | 'reported'>('form');
  const [previewReport, setPreviewReport] = useState<ActivityReport | null>(null);
  const [searchReportText, setSearchReportText] = useState<string>('');
  const [reportedSubFilter, setReportedSubFilter] = useState<'all' | 'unreported'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedActivityId, setSelectedActivityId] = useState<string>(actIdParam || '');
  const [allocatedBudget, setAllocatedBudget] = useState<number>(0);
  const [budgetSource, setBudgetSource] = useState<string>('งบอุดหนุน');
  const [actualUsedBudget, setActualUsedBudget] = useState<number>(0);
  const [responsiblePerson, setResponsiblePerson] = useState<string>('');
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>('');
  
  // Details
  const [objectives, setObjectives] = useState<string[]>([
    'เพื่อพัฒนาและยกระดับศักยภาพของผู้เรียนตามแผนงานที่กำหนด',
    'เพื่อส่งเสริมการจัดกิจกรรมการเรียนรู้ที่เน้นผู้เรียนเป็นสำคัญ'
  ]);
  const [quantitativeTarget, setQuantitativeTarget] = useState<string>('ผู้เรียนและครูผู้เข้าร่วมกิจกรรมร้อยละ 90 ขึ้นไป');
  const [qualitativeTarget, setQualitativeTarget] = useState<string>('ผู้เรียนมีความรู้ ทักษะ และเจตคติที่ดี และสามารถนำความรู้ไปประยุกต์ใช้ได้');
  const [performanceResult, setPerformanceResult] = useState<string>('');
  const [problemsObstacles, setProblemsObstacles] = useState<string>('ไม่มี หรือกิจกรรมดำเนินไปด้วยความเรียบร้อย');
  
  // Evaluation table: objective -> achieved or not
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([
    { objective: 'เพื่อพัฒนาและยกระดับศักยภาพของผู้เรียนตามแผนงานที่กำหนด', isAchieved: true },
    { objective: 'เพื่อส่งเสริมการจัดกิจกรรมการเรียนรู้ที่เน้นผู้เรียนเป็นสำคัญ', isAchieved: true }
  ]);

  // 3 Images
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=60'
  ]);

  // Signatures
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterPosition, setReporterPosition] = useState<string>('ครู');
  const [directorName, setDirectorName] = useState<string>('นายผู้อำนวยการ เกียรติภูมิสูง');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync objective changes to evaluation list
  const syncObjectivesToEvaluations = (newObjs: string[]) => {
    setObjectives(newObjs);
    setEvaluations(newObjs.map((obj, i) => ({
      objective: obj,
      isAchieved: evaluations[i] ? evaluations[i].isAchieved : true
    })));
  };

  const handleAddObjective = () => {
    const updated = [...objectives, ''];
    syncObjectivesToEvaluations(updated);
  };

  const handleRemoveObjective = (index: number) => {
    const updated = objectives.filter((_, i) => i !== index);
    syncObjectivesToEvaluations(updated);
  };

  const handleObjectiveChange = (index: number, val: string) => {
    const updated = [...objectives];
    updated[index] = val;
    syncObjectivesToEvaluations(updated);
  };

  const handleEvaluationToggle = (index: number, isAchieved: boolean) => {
    const updated = [...evaluations];
    if (updated[index]) {
      updated[index].isAchieved = isAchieved;
      setEvaluations(updated);
    }
  };

  // Image Upload handler
  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const newImages = [...images];
          newImages[index] = reader.result;
          setImages(newImages);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-fill when activity changes
  useEffect(() => {
    if (selectedActivityId) {
      const act = filteredActivities.find(a => a.id === selectedActivityId);
      if (act) {
        setSelectedProjectId(act.projectId);
        setAllocatedBudget(act.allocatedAmount);
        setBudgetSource(act.budgetType);
        setActualUsedBudget(act.usedAmount || act.allocatedAmount);
        setResponsiblePerson(act.responsiblePerson || '');
        if (act.approvedDate) setPeriodStart(act.approvedDate);
      }
    }
  }, [selectedActivityId, filteredActivities]);

  // Current compiled report object
  const currentProject = filteredProjects.find(p => p.id === selectedProjectId);
  const currentActivity = filteredActivities.find(a => a.id === selectedActivityId);

  const reportData: ActivityReport = {
    id: `rep_${selectedActivityId || Date.now()}`,
    fiscalYear: currentYear,
    activityId: selectedActivityId,
    projectName: currentProject?.name || currentActivity?.projectName || 'โครงการพัฒนาการจัดการศึกษา',
    activityName: currentActivity?.name || 'กิจกรรมพัฒนาคุณภาพผู้เรียน',
    allocatedBudget,
    budgetSource,
    actualUsedBudget,
    responsiblePerson,
    periodStart,
    periodEnd,
    objectives: objectives.filter(o => o.trim().length > 0),
    quantitativeTarget,
    qualitativeTarget,
    performanceResult,
    problemsObstacles,
    evaluations,
    images,
    reporterName,
    reporterPosition,
    directorName,
    createdAt: new Date().toISOString()
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveReport(reportData);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDocxExport = async () => {
    await exportReportToDocx(reportData);
  };

  const loadSavedReport = (r: ActivityReport) => {
    setSelectedActivityId(r.activityId);
    setAllocatedBudget(r.allocatedBudget);
    setBudgetSource(r.budgetSource);
    setActualUsedBudget(r.actualUsedBudget);
    setResponsiblePerson(r.responsiblePerson);
    setPeriodStart(r.periodStart);
    setPeriodEnd(r.periodEnd);
    setObjectives(r.objectives);
    setQuantitativeTarget(r.quantitativeTarget);
    setQualitativeTarget(r.qualitativeTarget);
    setPerformanceResult(r.performanceResult);
    setProblemsObstacles(r.problemsObstacles);
    setEvaluations(r.evaluations);
    setImages(r.images);
    setReporterName(r.reporterName);
    setReporterPosition(r.reporterPosition);
    setDirectorName(r.directorName);
  };

  const handleEditReport = (r: ActivityReport) => {
    loadSavedReport(r);
    setActiveTab('form');
  };

  const handleViewReport = (r: ActivityReport) => {
    setPreviewReport(r);
    setViewMode('preview');
  };

  const handleExportWordForReport = async (r: ActivityReport) => {
    await exportReportToDocx(r);
  };

  const handleDeleteReport = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบรายงานของกิจกรรม "${name}" ใช่หรือไม่?`)) {
      setDeletingId(id);
      await deleteReport(id);
      setDeletingId(null);
    }
  };

  const handleStartReportForActivity = (actId: string) => {
    setSelectedActivityId(actId);
    setActiveTab('form');
  };

  // Helper metrics
  const reportedActivityIds = new Set(filteredReports.map(r => r.activityId));
  const unreportedActivities = filteredActivities.filter(a => !reportedActivityIds.has(a.id));
  const totalReportedAllocated = filteredReports.reduce((sum, r) => sum + (r.allocatedBudget || 0), 0);
  const totalReportedUsed = filteredReports.reduce((sum, r) => sum + (r.actualUsedBudget || 0), 0);

  const displayedReports = filteredReports.filter(r => {
    if (!searchReportText.trim()) return true;
    const q = searchReportText.toLowerCase();
    return (
      (r.activityName || '').toLowerCase().includes(q) ||
      (r.projectName || '').toLowerCase().includes(q) ||
      (r.reporterName || '').toLowerCase().includes(q) ||
      (r.responsiblePerson || '').toLowerCase().includes(q)
    );
  });

  if (viewMode === 'preview') {
    return (
      <ReportPrintView
        report={previewReport || reportData}
        onBack={() => {
          setViewMode('form');
          setPreviewReport(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>ระบบรายงานโครงการ/กิจกรรม ปีงบ {currentYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            รายงานผลการดำเนินงานโครงการ / กิจกรรม
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === 'form' 
              ? 'บันทึกสรุปผลการดำเนินงานโครงการ/กิจกรรม และพิมพ์แบบรายงานราชการ (A4)'
              : 'รายการกิจกรรมที่ได้รับการรายงานผลแล้วในระบบ สามารถดูตัวอย่าง สั่งพิมพ์ หรือแก้ไขข้อมูลได้'
            }
          </p>
        </div>

        {/* Tab Navigation: แยก 2 หน้าชัดเจน */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex items-center space-x-2 py-2 px-4 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'form'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>กรอกแบบรายงานกิจกรรม</span>
          </button>

          <button
            onClick={() => setActiveTab('reported')}
            className={`flex items-center space-x-2 py-2 px-4 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'reported'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>กิจกรรมที่รายงานแล้ว</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold ${
              activeTab === 'reported' 
                ? 'bg-sky-600 text-white' 
                : 'bg-slate-200 text-slate-700'
            }`}>
              {filteredReports.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FORM VIEW (กรอกแบบรายงาน)                                         */}
      {/* ========================================================================= */}
      {activeTab === 'form' && (
        <div className="space-y-6">
          {/* Top Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>กรอกข้อมูลเพื่อส่งออกเป็นแบบ Infographic หรือแบบฟอร์มราชการ</span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setViewMode('preview')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition-all"
              >
                <Eye className="w-4 h-4 text-sky-600" />
                <span>ดูตัวอย่าง / พิมพ์ PDF</span>
              </button>
              <button
                onClick={handleDocxExport}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>ส่งออก Word (.docx)</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'กำลังบันทึก...' : saveSuccess ? 'บันทึกแล้ว!' : 'บันทึกรายงาน'}</span>
              </button>
            </div>
          </div>

          {/* Quick Saved Reports Selector */}
          {filteredReports.length > 0 && (
            <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs text-sky-900 font-semibold">
                <FileCheck2 className="w-4 h-4 text-sky-600" />
                <span>โหลดข้อมูลจากรายงานที่เคยบันทึกไว้ ({filteredReports.length} รายการ) หรือ</span>
                <button
                  onClick={() => setActiveTab('reported')}
                  className="text-sky-700 underline font-bold hover:text-sky-900 ml-1"
                >
                  ไปที่หน้ากิจกรรมที่รายงานแล้ว →
                </button>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select
                  onChange={(e) => {
                    const rep = filteredReports.find(r => r.id === e.target.value);
                    if (rep) loadSavedReport(rep);
                  }}
                  className="px-3 py-1.5 text-xs bg-white border border-sky-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
                >
                  <option value="">-- โหลดรายงานที่เคยบันทึกไว้ --</option>
                  {filteredReports.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.activityName} ({r.reporterName || 'ไม่ระบุชื่อ'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

      {/* Main Report Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Form Sections */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* SECTION 1: Header Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-xs">
                1
              </span>
              <h2 className="text-base font-bold text-slate-900">
                ข้อมูลทั่วไปของโครงการและกิจกรรม
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อโครงการ (เลือกจากระบบ) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    // Reset or pick first activity
                    const acts = filteredActivities.filter(a => a.projectId === e.target.value);
                    if (acts.length > 0) setSelectedActivityId(acts[0].id);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="">-- กรุณาเลือกโครงการ --</option>
                  {filteredProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.departmentName})</option>
                  ))}
                </select>
              </div>

              {/* Activity Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อกิจกรรม (เลือกจากระบบ) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedActivityId}
                  onChange={(e) => setSelectedActivityId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium"
                >
                  <option value="">-- กรุณาเลือกกิจกรรม --</option>
                  {(selectedProjectId 
                    ? filteredActivities.filter(a => a.projectId === selectedProjectId)
                    : filteredActivities
                  ).map(a => (
                    <option key={a.id} value={a.id}>
                      {a.seq ? `${a.seq} ` : ''}{a.name} ({a.budgetType} - {a.allocatedAmount.toLocaleString()} ฿)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Budget Source */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  แหล่งงบประมาณ (กดเลือก) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={budgetSource}
                  onChange={(e) => setBudgetSource(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="งบพื้นที่นวัตกรรม">งบพื้นที่นวัตกรรม</option>
                  <option value="งบอุดหนุน">งบอุดหนุน</option>
                  <option value="งบพัฒนาผู้เรียน">งบพัฒนาผู้เรียน</option>
                  <option value="งบรายได้สถานศึกษา">งบรายได้สถานศึกษา</option>
                  <option value="งบอื่นๆ">งบอื่นๆ</option>
                </select>
              </div>

              {/* Allocated Budget */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  งบประมาณที่ได้รับจัดสรร (บาท) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={allocatedBudget}
                  onChange={(e) => setAllocatedBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold text-sky-700"
                />
              </div>

              {/* Actual Used Budget */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  งบประมาณที่ใช้จริง (บาท) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={actualUsedBudget}
                  onChange={(e) => setActualUsedBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold text-amber-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ผู้รับผิดชอบโครงการ/กิจกรรม <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น ครูบุหงา / หัวหน้ากลุ่มสาระ"
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  วันที่เริ่มดำเนินงาน
                </label>
                <input
                  type="text"
                  placeholder="เช่น 1 พ.ย. 2569"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  วันที่สิ้นสุดดำเนินงาน
                </label>
                <input
                  type="text"
                  placeholder="เช่น 15 พ.ย. 2569"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Details & Results */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-xs">
                2
              </span>
              <h2 className="text-base font-bold text-slate-900">
                รายละเอียดการดำเนินงานและผลลัพธ์
              </h2>
            </div>

            {/* Objectives dynamic list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700">
                  วัตถุประสงค์ของโครงการ (เพิ่มได้หลายข้อ) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddObjective}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มข้อวัตถุประสงค์</span>
                </button>
              </div>

              <div className="space-y-2">
                {objectives.map((obj, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500 w-6 text-center">{i + 1}.</span>
                    <input
                      type="text"
                      placeholder={`วัตถุประสงค์ข้อที่ ${i + 1}`}
                      value={obj}
                      onChange={(e) => handleObjectiveChange(i, e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    {objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(i)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Targets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เป้าหมายเชิงปริมาณ (กรอกเอง)
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น นักเรียนชั้นมัธยมศึกษาปีที่ 1-3 เข้าร่วมกิจกรรมจำนวน 250 คน (ร้อยละ 100)"
                  value={quantitativeTarget}
                  onChange={(e) => setQuantitativeTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เป้าหมายเชิงคุณภาพ (กรอกเอง)
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น นักเรียนมีความรู้ความเข้าใจ มีทักษะปฏิบัติ และมีผลการประเมินในระดับดีขึ้นไป"
                  value={qualitativeTarget}
                  onChange={(e) => setQualitativeTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Performance Result */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ผลการดำเนินงาน (กรอกเอง) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="ระบุกิจกรรมที่จัดขึ้น ขั้นตอนการดำเนินงาน และผลลัพธ์ที่เกิดขึ้นจริง..."
                value={performanceResult}
                onChange={(e) => setPerformanceResult(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            {/* Problems and Obstacles */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ปัญหา อุปสรรค และข้อเสนอแนะ (กรอกเอง)
              </label>
              <textarea
                rows={2}
                placeholder="เช่น การจัดกิจกรรมควรเพิ่มเวลาในการฝึกซ้อม หรือ ไม่มีปัญหาอุปสรรคใดๆ"
                value={problemsObstacles}
                onChange={(e) => setProblemsObstacles(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* SECTION 3: Evaluation (Achieved vs Not Achieved) */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-xs">
                3
              </span>
              <h2 className="text-base font-bold text-slate-900">
                สรุปผลการประเมินตามวัตถุประสงค์ (เลือกว่า บรรลุ หรือ ไม่บรรลุ)
              </h2>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-slate-50/50">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">ข้อ</th>
                    <th className="py-2.5 px-3 text-left">วัตถุประสงค์</th>
                    <th className="py-2.5 px-4 text-center w-28">บรรลุ</th>
                    <th className="py-2.5 px-4 text-center w-28">ไม่บรรลุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 bg-white">
                  {evaluations.map((ev, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-3 text-center font-bold text-slate-500">{i + 1}</td>
                      <td className="py-3 px-3 text-slate-800 font-medium">{ev.objective || `วัตถุประสงค์ข้อที่ ${i + 1}`}</td>
                      <td className="py-3 px-4 text-center">
                        <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`eval_${i}`}
                            checked={ev.isAchieved === true}
                            onChange={() => handleEvaluationToggle(i, true)}
                            className="text-sky-600 focus:ring-sky-500 h-4 w-4"
                          />
                          <span className="text-xs font-semibold text-emerald-700">บรรลุ</span>
                        </label>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`eval_${i}`}
                            checked={ev.isAchieved === false}
                            onChange={() => handleEvaluationToggle(i, false)}
                            className="text-rose-600 focus:ring-rose-500 h-4 w-4"
                          />
                          <span className="text-xs font-semibold text-rose-600">ไม่บรรลุ</span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: 3 Activity Images */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-xs">
                4
              </span>
              <h2 className="text-base font-bold text-slate-900">
                ภาพถ่ายกิจกรรม 3 ภาพ (อัปโหลดจากเครื่อง หรือใช้รูปที่จัดเตรียม)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2 text-center">
                  <div className="aspect-[4/3] rounded-lg bg-white border border-slate-200 overflow-hidden relative flex items-center justify-center group">
                    {images[idx] ? (
                      <img
                        src={images[idx]}
                        alt={`ภาพกิจกรรมที่ ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-slate-400 text-xs flex flex-col items-center">
                        <ImageIcon className="w-8 h-8 mb-1 text-slate-300" />
                        <span>ยังไม่มีรูปภาพ</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-700">ภาพกิจกรรมที่ {idx + 1}</div>
                  <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 cursor-pointer shadow-xs transition-colors">
                    <UploadCloud className="w-3.5 h-3.5 text-sky-600" />
                    <span>เลือกรูปภาพ</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(idx, e)}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: Signatures */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-xs">
                5
              </span>
              <h2 className="text-base font-bold text-slate-900">
                การลงชื่อผู้รายงาน และผู้บริหาร
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-สกุล ผู้รายงาน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น นาย/นาง/นางสาว..."
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ตำแหน่งผู้รายงาน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น ครู / ครูชำนาญการพิเศษ"
                  value={reporterPosition}
                  onChange={(e) => setReporterPosition(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-สกุล ผู้อำนวยการโรงเรียน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น นายผู้อำนวยการ เกียรติภูมิสูง"
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4 text-sky-600" />
              <span>ดูตัวอย่างเอกสารราชการ / พิมพ์ PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDocxExport}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออกเป็นไฟล์ Word (.docx)</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'กำลังบันทึก...' : saveSuccess ? 'บันทึกสำเร็จ!' : 'บันทึกรายงานลงระบบ'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  )}

  {/* ========================================================================= */}
  {/* TAB 2: REPORTED ACTIVITIES DASHBOARD (กิจกรรมที่รายงานแล้ว)                */}
  {/* ========================================================================= */}
  {activeTab === 'reported' && (
    <div className="space-y-6">
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">กิจกรรมที่รายงานผลแล้ว</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {filteredReports.length} <span className="text-xs font-normal text-slate-500">/ {filteredActivities.length} กิจกรรม</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">งบประมาณที่รายงาน (ใช้จริง / จัดสรร)</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {totalReportedUsed.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ {totalReportedAllocated.toLocaleString()} บ.</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">รอดำเนินการรายงาน</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {unreportedActivities.length} <span className="text-xs font-normal text-slate-500">กิจกรรม</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => setReportedSubFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              reportedSubFilter === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            รายงานแล้ว ({filteredReports.length})
          </button>
          <button
            onClick={() => setReportedSubFilter('unreported')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              reportedSubFilter === 'unreported'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ยังไม่รายงาน ({unreportedActivities.length})
          </button>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหากิจกรรม, โครงการ, ผู้รายงาน..."
              value={searchReportText}
              onChange={(e) => setSearchReportText(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            onClick={() => setActiveTab('form')}
            className="inline-flex items-center space-x-1 px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-all flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เขียนรายงานใหม่</span>
          </button>
        </div>
      </div>

      {/* Subfilter: ALL REPORTED ACTIVITIES */}
      {reportedSubFilter === 'all' && (
        <div className="space-y-4">
          {displayedReports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <FolderOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {searchReportText ? 'ไม่พบรายงานที่ตรงกับการค้นหา' : `ยังไม่มีรายงานกิจกรรมในปีงบประมาณ ${currentYear}`}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchReportText ? 'ลองค้นหาด้วยคำอื่น หรือกดล้างการค้นหา' : 'ยังไม่มีรายงานสรุปผลกิจกรรม สามารถกดปุ่มเขียนรายงานใหม่เพื่อเริ่มบันทึกข้อมูล'}
              </p>
              {!searchReportText && (
                <button
                  onClick={() => setActiveTab('form')}
                  className="mt-4 inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>เริ่มเขียนรายงานแรก</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedReports.map((r) => {
                const achievedCount = (r.evaluations || []).filter(e => e.isAchieved).length;
                const totalEval = (r.evaluations || []).length;
                return (
                  <div 
                    key={r.id} 
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover-card space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold">
                          ปีงบ {r.fiscalYear || currentYear}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium truncate max-w-xs">
                          {r.projectName}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        บันทึกรายงาน: {r.createdAt ? new Date(r.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                      </div>
                    </div>

                    {/* Title and Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Info Column (col-span-8) */}
                      <div className="lg:col-span-8 space-y-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 leading-snug">
                            {r.activityName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1.5">
                            <div>
                              งบจัดสรร: <b className="text-slate-900 font-bold">{(r.allocatedBudget || 0).toLocaleString()} บาท</b>
                            </div>
                            <div>
                              งบที่ใช้จริง: <b className="text-emerald-700 font-bold">{(r.actualUsedBudget || 0).toLocaleString()} บาท</b>
                            </div>
                            <div>
                              งบคงเหลือ: <b className="text-slate-700 font-bold">{((r.allocatedBudget || 0) - (r.actualUsedBudget || 0)).toLocaleString()} บาท</b>
                            </div>
                          </div>
                        </div>

                        {/* Reporter and timeline */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="font-semibold text-slate-700">ผู้รายงาน: </span>
                            <span>{r.reporterName || r.responsiblePerson || '-'} ({r.reporterPosition || 'ครู'})</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">ระยะเวลา: </span>
                            <span>{r.periodStart || '-'} ถึง {r.periodEnd || '-'}</span>
                          </div>
                        </div>

                        {/* Evaluation summary */}
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="font-semibold text-slate-700">ผลการประเมิน:</span>
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>บรรลุเป้าหมาย {achievedCount}/{totalEval || 1} ข้อ</span>
                          </span>
                        </div>
                      </div>

                      {/* Thumbnails (col-span-4) */}
                      <div className="lg:col-span-4 flex flex-col justify-center">
                        <div className="text-[11px] font-semibold text-slate-500 mb-1.5">ภาพกิจกรรม ({r.images?.length || 0} ภาพ)</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[0, 1, 2].map((idx) => {
                            const img = r.images?.[idx];
                            return (
                              <div key={idx} className="h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                {img ? (
                                  <img src={img} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <ImageIcon className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleViewReport(r)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูตัวอย่าง / พิมพ์เอกสาร</span>
                      </button>

                      <button
                        onClick={() => handleExportWordForReport(r)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ส่งออก Word</span>
                      </button>

                      <button
                        onClick={() => handleEditReport(r)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>แก้ไข</span>
                      </button>

                      <button
                        onClick={() => handleDeleteReport(r.id, r.activityName)}
                        disabled={deletingId === r.id}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Subfilter: UNREPORTED ACTIVITIES */}
      {reportedSubFilter === 'unreported' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>กิจกรรมในแผนปฏิบัติการที่ยังไม่ได้ส่งรายงานผล ({unreportedActivities.length} กิจกรรม)</span>
            </div>
          </div>

          {unreportedActivities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-emerald-700">ยอดเยี่ยม!</span>
              <span>กิจกรรมทั้งหมดในปีงบประมาณ {currentYear} ได้รับการรายงานผลครบถ้วนแล้ว</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {unreportedActivities.map((act) => (
                <div key={act.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {act.sheetCode || act.seq || 'กิจกรรม'}
                      </span>
                      <span className="text-xs font-medium text-slate-500 truncate max-w-xs">
                        {act.projectName}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {act.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-600">
                      <div>งบจัดสรร: <b className="text-slate-900">{(act.allocatedAmount || 0).toLocaleString()} บาท</b></div>
                      <div>ผู้รับผิดชอบ: <b className="text-slate-900">{act.responsiblePerson || '-'}</b></div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartReportForActivity(act.id)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex-shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>+ กรอกรายงานกิจกรรมนี้</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 text-sm">กำลังโหลดแบบรายงาน...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
