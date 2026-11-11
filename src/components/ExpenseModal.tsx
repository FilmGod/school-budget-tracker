'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Activity, ExpenseItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { PlusCircle, X, Receipt } from 'lucide-react';

interface ExpenseModalProps {
  activity: Activity;
  onClose: () => void;
}

export default function ExpenseModal({ activity, onClose }: ExpenseModalProps) {
  const { recordExpense } = useApp();
  const [mounted, setMounted] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    const newExpense: ExpenseItem = {
      id: `exp_${Date.now()}`,
      index: (activity.expenses?.length || 0) + 1,
      date: date || new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }),
      description,
      amount: Number(amount),
      refund: Number(refund) || 0,
      note
    };

    await recordExpense(activity.id, newExpense);
    setIsSubmitting(false);
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
        className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">บันทึกการเบิกจ่ายงบประมาณ</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{activity.name}</p>
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
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl mb-4 text-center border border-slate-100 text-xs">
          <div>
            <span className="text-slate-500">จัดสรร</span>
            <div className="font-bold text-slate-800">{activity.allocatedAmount.toLocaleString()} ฿</div>
          </div>
          <div>
            <span className="text-slate-500">ใช้ไปแล้ว</span>
            <div className="font-bold text-amber-600">{activity.usedAmount.toLocaleString()} ฿</div>
          </div>
          <div>
            <span className="text-slate-500">คงเหลือ</span>
            <div className="font-bold text-emerald-600">{activity.remainingAmount.toLocaleString()} ฿</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              วันที่ขออนุมัติ / วันที่จ่ายเงิน <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="เช่น 25 ต.ค. 2569 หรือ วันนี้"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              รายละเอียดการใช้จ่ายงบประมาณ <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="เช่น ค่าจัดซื้อวัสดุฝึกอบรม, ค่าเดินทางไปราชการ"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                งบประมาณที่ใช้ (บาท) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                คืนเงิน (บาท ถ้ามี)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={refund}
                onChange={(e) => setRefund(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">หมายเหตุ</label>
            <input
              type="text"
              placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
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
              className="active-press flex-1 px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเบิกจ่าย'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
