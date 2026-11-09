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
  FileCheck2 
} from 'lucide-react';

function ReportsContent() {
  const searchParams = useSearchParams();
  const actIdParam = searchParams.get('actId');

  const { 
    currentYear, 
    filteredActivities, 
    filteredProjects, 
    filteredReports, 
    saveReport 
  } = useApp();

  // Mode: 'form' | 'preview'
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');

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

  if (viewMode === 'preview') {
    return (
      <ReportPrintView
        report={reportData}
        onBack={() => setViewMode('form')}
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
            <span>แบบรายงานโครงการ/กิจกรรม ปีงบ {currentYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            รายงานผลการดำเนินงานโครงการ / กิจกรรม
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            กรอกรายละเอียดผลการจัดกิจกรรม แล้วส่งออกเป็นเอกสารราชการ Word (.docx) และ PDF ได้ทันที
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center space-x-2">
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

      {/* Previously Saved Reports Selector (if any) */}
      {filteredReports.length > 0 && (
        <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-sky-900 font-semibold">
            <FileCheck2 className="w-4 h-4 text-sky-600" />
            <span>มีรายงานที่เคยบันทึกไว้ในระบบ {filteredReports.length} รายการ</span>
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
                ๑
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
                ๒
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
                  <span>+ เพิ่มข้อวัตถุประสงค์</span>
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
                ๓
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
                ๔
              </span>
              <h2 className="text-base font-bold text-slate-900">
                ภาพถ่ายกิจกรรม ๓ ภาพ (อัปโหลดจากเครื่อง หรือใช้รูปที่จัดเตรียม)
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
                ๕
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
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 text-sm">กำลังโหลดแบบรายงาน...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
