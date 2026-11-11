'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Activity, BudgetType } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { X, Layers } from 'lucide-react';

interface ActivityModalProps {
  activity?: Activity | null;
  defaultProjectId?: string;
  defaultDepartmentId?: string;
  onClose: () => void;
  onSuccess?: (activity: Activity) => void;
}

export default function ActivityModal({ 
  activity, 
  defaultProjectId,
  defaultDepartmentId,
  onClose,
  onSuccess 
}: ActivityModalProps) {
  const { db, currentYear, filteredProjects, saveActivity, refreshData } = useApp();

  const [mounted, setMounted] = useState(false);
  const [departmentId, setDepartmentId] = useState(
    activity?.departmentId || defaultDepartmentId || 'academic'
  );
  const [projectId, setProjectId] = useState(
    activity?.projectId || defaultProjectId || (filteredProjects[0]?.id || '')
  );
  const [name, setName] = useState(activity?.name || '');
  const [seq, setSeq] = useState(activity?.seq || '');
  const [responsiblePerson, setResponsiblePerson] = useState(activity?.responsiblePerson || '');
  const [budgetType, setBudgetType] = useState(activity?.budgetType || 'งบพื้นที่นวัตกรรม');
  const [allocatedAmount, setAllocatedAmount] = useState<number | ''>(activity?.allocatedAmount || '');
  const [approvedDate, setApprovedDate] = useState(activity?.approvedDate || '');
  const [gdriveUrl, setGdriveUrl] = useState(activity?.gdriveUrl || '');
  const [note, setNote] = useState(activity?.note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    refreshData();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const deptObj = db.departments.find(d => d.id === departmentId);
  const currentDeptProjects = filteredProjects.filter(p => p.departmentId === departmentId);
  const otherDeptProjects = filteredProjects.filter(p => p.departmentId !== departmentId);
  const projObj = filteredProjects.find(p => p.id === projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || allocatedAmount === '') return;

    setIsSubmitting(true);
    const updated: Activity = {
      id: activity?.id || `act_${Date.now()}`,
      fiscalYear: currentYear,
      departmentId,
      departmentName: deptObj?.name || 'ฝ่ายบริหารวิชาการ',
      projectId: projectId || '',
      projectName: projObj?.name || 'โครงการทั่วไป',
      sheetCode: activity?.sheetCode || '',
      seq,
      name,
      responsiblePerson,
      budgetType,
      allocatedAmount: Number(allocatedAmount),
      usedAmount: activity?.usedAmount || 0,
      remainingAmount: Number(allocatedAmount) - (activity?.usedAmount || 0),
      status: activity?.status || 'approved',
      approvedDate,
      note,
      expenses: activity?.expenses || [],
      gdriveUrl
    };

    await saveActivity(updated);
    setIsSubmitting(false);
    if (onSuccess) onSuccess(updated);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activity ? 'แก้ไขข้อมูลกิจกรรม' : 'เพิ่มกิจกรรมใหม่ตามแผน'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">ปีงบประมาณ {currentYear}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ฝ่ายบริหารงาน <span className="text-rose-500">*</span></label>
              <select
                value={departmentId}
                onChange={(e) => {
                  const newDept = e.target.value;
                  setDepartmentId(newDept);
                  const currentProj = filteredProjects.find(p => p.id === projectId);
                  if (currentProj && currentProj.departmentId !== newDept) {
                    const firstProj = filteredProjects.find(p => p.departmentId === newDept);
                    setProjectId(firstProj ? firstProj.id : '');
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                required
              >
                {db.departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">สังกัดโครงการ</label>
              <select
                value={projectId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setProjectId(selectedId);
                  const proj = filteredProjects.find(p => p.id === selectedId);
                  if (proj && proj.departmentId && proj.departmentId !== departmentId) {
                    setDepartmentId(proj.departmentId);
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- ไม่ระบุ / โครงการทั่วไป --</option>
                {currentDeptProjects.length > 0 && (
                  <optgroup label={`โครงการใน ${deptObj?.name || 'ฝ่ายที่เลือก'}`}>
                    {currentDeptProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </optgroup>
                )}
                {otherDeptProjects.length > 0 && (
                  <optgroup label="โครงการฝ่ายอื่นๆ (คลิกเลือกแล้วฝ่ายจะเปลี่ยนอัตโนมัติ)">
                    {otherDeptProjects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.departmentName || p.departmentId})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block font-semibold text-slate-700 mb-1">ลำดับ (เช่น 1.1)</label>
              <input
                type="text"
                placeholder="1.1"
                value={seq}
                onChange={(e) => setSeq(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">ชื่อกิจกรรม <span className="text-rose-500">*</span></label>
              <input
                type="text"
                placeholder="เช่น กิจกรรมพัฒนาผลสัมฤทธิ์ทางการเรียน"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ประเภทเงินงบประมาณ <span className="text-rose-500">*</span></label>
              <select
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="งบพื้นที่นวัตกรรม">งบพื้นที่นวัตกรรม</option>
                <option value="งบอุดหนุน">งบอุดหนุน</option>
                <option value="งบพัฒนาผู้เรียน">งบพัฒนาผู้เรียน</option>
                <option value="งบรายได้สถานศึกษา">งบรายได้สถานศึกษา</option>
                <option value="งบอื่นๆ">งบอื่นๆ</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">งบประมาณที่ได้รับจัดสรร (บาท) <span className="text-rose-500">*</span></label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={allocatedAmount}
                onChange={(e) => setAllocatedAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold text-sky-700"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ผู้รับผิดชอบกิจกรรม</label>
              <input
                type="text"
                placeholder="เช่น ครูบุหงา / หัวหน้ากลุ่มสาระ"
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">วันที่ขออนุมัติใช้เงิน</label>
              <input
                type="text"
                placeholder="เช่น 15 ต.ค. 2569"
                value={approvedDate}
                onChange={(e) => setApprovedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">ลิงก์ Google Drive เอกสารกิจกรรม (ถ้ามี)</label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={gdriveUrl}
              onChange={(e) => setGdriveUrl(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">หมายเหตุ</label>
            <input
              type="text"
              placeholder="หมายเหตุเพิ่มเติม"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="active-press flex-1 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="active-press flex-1 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
