'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ProjectDocument } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { X, FolderPlus } from 'lucide-react';

interface DocumentModalProps {
  doc?: ProjectDocument | null;
  onClose: () => void;
}

export default function DocumentModal({ doc, onClose }: DocumentModalProps) {
  const { db, currentYear, saveDocument } = useApp();
  const [departmentId, setDepartmentId] = useState(doc?.departmentId || 'all');
  const [title, setTitle] = useState(doc?.title || '');
  const [docType, setDocType] = useState<'plan_book' | 'folder' | 'activity_pdf' | 'other'>(doc?.docType || 'folder');
  const [gdriveUrl, setGdriveUrl] = useState(doc?.gdriveUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    if (mounted && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !gdriveUrl) return;

    setIsSubmitting(true);
    const updated: ProjectDocument = {
      id: doc?.id || `doc_${Date.now()}`,
      fiscalYear: currentYear,
      departmentId,
      title,
      docType,
      gdriveUrl,
      updatedAt: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    await saveDocument(updated);
    setIsSubmitting(false);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {doc ? 'แก้ไขลิงก์เอกสาร' : 'เพิ่มลิงก์เอกสาร / Google Drive'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">ปีงบประมาณ {currentYear}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              สังกัดฝ่าย / แผนรวม <span className="text-rose-500">*</span>
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="all">เล่มรวมทั้งโรงเรียน / แผนปฏิบัติการรวม</option>
              {db.departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ประเภทเอกสาร</label>
            <select
              value={docType}
              onChange={(e: any) => setDocType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="folder">โฟลเดอร์ Google Drive รวมฝ่าย</option>
              <option value="plan_book">เล่มแผนปฏิบัติการประจำปี</option>
              <option value="activity_pdf">ไฟล์ PDF สรุปโครงการ/กิจกรรม</option>
              <option value="other">เอกสารอื่นๆ</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อเอกสาร / โฟลเดอร์ <span className="text-rose-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="เช่น เล่มแผนปฏิบัติการประจำปี 2570 ฉบับสมบูรณ์"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ลิงก์ Google Drive (URL) <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={gdriveUrl}
              onChange={(e) => setGdriveUrl(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              required
            />
          </div>

          <div className="flex space-x-2 pt-2">
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
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกเอกสาร'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
