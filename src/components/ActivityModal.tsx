'use client';

import React, { useState } from 'react';
import { Activity, BudgetType } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { X, Layers } from 'lucide-react';

interface ActivityModalProps {
  activity?: Activity | null;
  onClose: () => void;
}

export default function ActivityModal({ activity, onClose }: ActivityModalProps) {
  const { db, currentYear, filteredProjects, saveActivity } = useApp();

  const [departmentId, setDepartmentId] = useState(activity?.departmentId || 'academic');
  const [projectId, setProjectId] = useState(activity?.projectId || (filteredProjects[0]?.id || ''));
  const [name, setName] = useState(activity?.name || '');
  const [seq, setSeq] = useState(activity?.seq || '');
  const [responsiblePerson, setResponsiblePerson] = useState(activity?.responsiblePerson || '');
  const [budgetType, setBudgetType] = useState(activity?.budgetType || 'งบอุดหนุน');
  const [allocatedAmount, setAllocatedAmount] = useState<number | ''>(activity?.allocatedAmount || '');
  const [approvedDate, setApprovedDate] = useState(activity?.approvedDate || '');
  const [gdriveUrl, setGdriveUrl] = useState(activity?.gdriveUrl || '');
  const [note, setNote] = useState(activity?.note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deptObj = db.departments.find(d => d.id === departmentId);
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {activity ? 'แก้ไขข้อมูลกิจกรรม' : 'เพิ่มกิจกรรมใหม่ตามแผน'}
              </h3>
              <p className="text-xs text-slate-500">ปีงบประมาณ {currentYear}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ฝ่ายบริหารงาน <span className="text-rose-500">*</span></label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                required
              >
                {db.departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">สังกัดโครงการ</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="">-- ไม่ระบุ / โครงการทั่วไป --</option>
                {filteredProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
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

          <div className="flex space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
