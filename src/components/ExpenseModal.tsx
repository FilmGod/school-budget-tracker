'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Activity, ExpenseItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { Plus, X, Receipt, Edit3, Trash2, CheckCircle2 } from 'lucide-react';

interface ExpenseModalProps {
  activity: Activity;
  initialMode?: 'add' | 'edit';
  initialExpenseIndex?: number;
  onClose: () => void;
}

export default function ExpenseModal({
  activity,
  initialMode,
  initialExpenseIndex = 0,
  onClose
}: ExpenseModalProps) {
  const { recordExpense, updateExpense, deleteExpense } = useApp();
  const [mounted, setMounted] = useState(false);

  const existingExpenses = activity.expenses || [];
  const hasExisting = existingExpenses.length > 0;

  // Determine initial mode: if activity has existing expenses and initialMode wasn't forced to 'add', default to 'edit'
  const [mode, setMode] = useState<'add' | 'edit'>(() => {
    if (initialMode) return initialMode;
    return hasExisting ? 'edit' : 'add';
  });

  const [selectedIdx, setSelectedIdx] = useState<number>(initialExpenseIndex);

  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [refund, setRefund] = useState<number | ''>(0);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Populate form fields whenever mode or selectedIdx changes
  useEffect(() => {
    if (mode === 'edit' && existingExpenses[selectedIdx]) {
      const target = existingExpenses[selectedIdx];
      setDate(target.date || '');
      setDescription(target.description || '');
      setAmount(target.amount ?? '');
      setRefund(target.refund ?? 0);
      setNote(target.note || '');
    } else if (mode === 'edit' && !existingExpenses[selectedIdx] && activity.usedAmount > 0) {
      // Fallback if usedAmount > 0 but expenses array was empty
      setDate(new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }));
      setDescription('รายการเบิกจ่ายงบประมาณ');
      setAmount(activity.usedAmount);
      setRefund(0);
      setNote('');
    } else {
      setDate('');
      setDescription('');
      setAmount('');
      setRefund(0);
      setNote('');
    }
  }, [mode, selectedIdx, activity.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount === '' || Number(amount) < 0) return;

    setIsSubmitting(true);
    const formattedDate =
      date.trim() ||
      new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });

    if (mode === 'edit') {
      const currentTarget = existingExpenses[selectedIdx];
      const updatedItem: ExpenseItem = {
        id: currentTarget?.id || `exp_${activity.sheetCode || activity.id}_${selectedIdx + 1}`,
        index: currentTarget?.index || selectedIdx + 1,
        date: formattedDate,
        description: description.trim(),
        amount: Number(amount),
        refund: Number(refund) || 0,
        note: note.trim()
      };
      await updateExpense(activity.id, updatedItem);
    } else {
      const newExpense: ExpenseItem = {
        id: `exp_${Date.now()}`,
        index: existingExpenses.length + 1,
        date: formattedDate,
        description: description.trim(),
        amount: Number(amount),
        refund: Number(refund) || 0,
        note: note.trim()
      };
      await recordExpense(activity.id, newExpense);
    }

    setIsSubmitting(false);
    onClose();
  };

  const handleDeleteCurrent = async () => {
    const currentTarget = existingExpenses[selectedIdx];
    if (!currentTarget) return;
    setIsSubmitting(true);
    await deleteExpense(activity.id, currentTarget.id);
    setIsSubmitting(false);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                mode === 'edit'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
              }`}
            >
              {mode === 'edit' ? <Edit3 className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {mode === 'edit' ? 'แก้ไขข้อมูลการเบิกจ่ายงบประมาณ' : 'บันทึกการเบิกจ่ายงบประมาณ'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                {activity.sheetCode ? `[ชีท ${activity.sheetCode}] ` : ''}
                {activity.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Snapshot */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl mb-4 text-center border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400">จัดสรร</span>
            <div className="font-bold text-slate-800 dark:text-slate-200">
              {activity.allocatedAmount.toLocaleString()} ฿
            </div>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">ใช้ไปแล้ว</span>
            <div className="font-bold text-amber-600 dark:text-amber-400">
              {activity.usedAmount.toLocaleString()} ฿
            </div>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">คงเหลือ</span>
            <div className="font-bold text-emerald-600 dark:text-emerald-400">
              {activity.remainingAmount.toLocaleString()} ฿
            </div>
          </div>
        </div>

        {/* Selector for existing expense installments OR adding a new installment */}
        {hasExisting && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                เลือกรายการเบิกจ่ายที่ต้องการแก้ไข หรือเพิ่มครั้งใหม่:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {existingExpenses.map((exp, idx) => {
                const isSelected = mode === 'edit' && selectedIdx === idx;
                return (
                  <button
                    key={exp.id || idx}
                    type="button"
                    onClick={() => {
                      setMode('edit');
                      setSelectedIdx(idx);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      ครั้งที่ {idx + 1} ({(exp.amount - (exp.refund || 0)).toLocaleString()} ฿)
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setMode('add')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1 ${
                  mode === 'add'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เบิกจ่ายครั้งใหม่</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              วันที่ขออนุมัติ / วันที่จ่ายเงิน <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="เช่น 25 ต.ค. 69 หรือ วันนี้"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              รายละเอียดการใช้จ่ายงบประมาณ <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="เช่น ค่าจัดซื้อวัสดุฝึกอบรม, ค่าเดินทางไปราชการ"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                งบประมาณที่ใช้ (บาท) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value !== '' ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                คืนเงิน (บาท ถ้ามี)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={refund}
                onChange={(e) => setRefund(e.target.value !== '' ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              หมายเหตุ
            </label>
            <input
              type="text"
              placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            {mode === 'edit' && existingExpenses[selectedIdx] && (
              <button
                type="button"
                onClick={handleDeleteCurrent}
                disabled={isSubmitting}
                className="active-press px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center space-x-1 transition-colors disabled:opacity-50"
                title="ลบรายการเบิกจ่ายนี้"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบรายการนี้</span>
              </button>
            )}

            <div className="flex flex-1 space-x-2">
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
                className={`active-press flex-1 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow transition-colors disabled:opacity-50 ${
                  mode === 'edit'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                {isSubmitting
                  ? 'กำลังบันทึกและซิงค์...'
                  : mode === 'edit'
                  ? 'บันทึกการแก้ไข'
                  : 'บันทึกการเบิกจ่าย'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
