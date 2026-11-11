'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Project } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { X, FolderPlus } from 'lucide-react';

interface ProjectModalProps {
  onClose: () => void;
  onSuccess?: (project: Project) => void;
}

export default function ProjectModal({ onClose, onSuccess }: ProjectModalProps) {
  const { db, currentYear, addProject } = useApp();
  const [departmentId, setDepartmentId] = useState('academic');
  const [name, setName] = useState('');
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

  // Available departments including "งบเหลือจ่าย"
  const availableDepts = [...db.departments];
  if (!availableDepts.some(d => d.name === 'งบเหลือจ่าย' || d.id === 'surplus')) {
    availableDepts.push({
      id: 'surplus',
      name: 'งบเหลือจ่าย',
      icon: 'Coins',
      color: '#ec4899'
    });
  }

  const deptObj = availableDepts.find(d => d.id === departmentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      fiscalYear: currentYear,
      departmentId,
      departmentName: deptObj?.name || 'ฝ่ายบริหารวิชาการ',
      name
    };

    await addProject(newProject);
    setIsSubmitting(false);
    if (onSuccess) onSuccess(newProject);
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
        className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">เพิ่มโครงการใหม่</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">ปีงบประมาณ {currentYear}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ฝ่ายบริหารงาน <span className="text-rose-500">*</span></label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            >
              {availableDepts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ชื่อโครงการ <span className="text-rose-500">*</span></label>
            <input
              ref={inputRef}
              type="text"
              placeholder="เช่น โครงการส่งเสริมความเป็นเลิศทางวิชาการ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกโครงการ'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
