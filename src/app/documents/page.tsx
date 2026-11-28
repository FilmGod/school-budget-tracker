'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ProjectDocument } from '@/lib/types';
import DocumentModal from '@/components/DocumentModal';
import { 
  FolderDown, 
  BookOpen, 
  ExternalLink, 
  Plus, 
  Folder, 
  FileText, 
  GraduationCap, 
  Building2, 
  Users, 
  Coins, 
  Edit3, 
  AlertCircle
} from 'lucide-react';

export default function DocumentsPage() {
  const { 
    currentYear, 
    filteredDocuments, 
    filteredActivities, 
    isAdmin
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ProjectDocument | null>(null);

  // Master Plan Books
  const masterBooks = filteredDocuments.filter(d => d.departmentId === 'all' || d.docType === 'plan_book');
  const masterPlanDoc = masterBooks[0];

  // Department Folder mapping
  const departmentConfigs: Array<{
    id: string;
    name: string;
    subtitle?: string;
    icon: typeof GraduationCap;
    color: string;
    bg: string;
    border: string;
    isFormCard?: boolean;
  }> = [
    { id: 'academic', name: 'ฝ่ายบริหารวิชาการ', icon: GraduationCap, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
    { id: 'general', name: 'ฝ่ายบริหารทั่วไป', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { id: 'personnel', name: 'ฝ่ายบริหารงานบุคคล', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { id: 'budget', name: 'ฝ่ายบริหารงบประมาณ', icon: Coins, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    {
      id: 'plan_forms',
      name: 'แบบฟอร์มเอกสารงานแผน',
      subtitle: 'กดดาวน์โหลดไฟล์เอกสารเพื่อแก้ไขข้อมูล',
      icon: FileText,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      isFormCard: true,
    },
  ];

  return (
    <div className="legacy-page space-y-8 stagger">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brandSoft text-brand text-xs font-semibold rounded-full mb-2">
            <FolderDown className="w-3.5 h-3.5" />
            <span>คลังรวมไฟล์เอกสารงานแผน ปีงบ {currentYear}</span>
          </div>
          <h1 className="text-2xl font-bold text-ink">
            ดาวน์โหลดแผนกิจกรรมและแบบฟอร์ม
          </h1>
          <p className="text-sm text-muted mt-1">
            เล่มแผนปฏิบัติการประจำปีและคลังเอกสารทางการเงิน
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingDoc(null);
              setShowModal(true);
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มลิงก์เอกสาร / ไดรฟ์</span>
          </button>
        )}
      </div>

      {/* 1. Master Plan Book Feature Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-medium text-sky-200">
            <BookOpen className="w-3.5 h-3.5" />
            <span>เอกสารหลักประจำสถานศึกษา</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            เล่มแผนปฏิบัติการประจำปีงบประมาณ {currentYear}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            เอกสารแผนปฏิบัติการประจำปีฉบับสมบูรณ์ และแบบฟอร์มงานแผนงานโรงเรียน
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {masterPlanDoc && masterPlanDoc.gdriveUrl ? (
              <a
                href={masterPlanDoc.gdriveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/25 transition-all"
              >
                <span>เปิดดูไฟล์ Google Drive ฉบับเต็ม</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-medium text-slate-300 border border-white/10">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>รอผู้ดูแลระบบ (Admin) เพิ่มลิงก์เอกสารเล่มแผนปฏิบัติการ</span>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditingDoc(null);
                      setShowModal(true);
                    }}
                    className="ml-2 px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg text-[11px] transition-colors"
                  >
                    + ใส่ลิงก์ตอนนี้
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Folders by 4 Departments + Plan Forms */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            โฟลเดอร์รวบรวมเอกสารและแบบฟอร์มงานแผน
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            คลิกเพื่อเปิดโฟลเดอร์ และดาวน์โหลดแผนแต่ละกิจกรรม
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {departmentConfigs.map((dept) => {
            const Icon = dept.icon;
            const doc = filteredDocuments.find(d => d.departmentId === dept.id);
            const actCount = filteredActivities.filter(a => a.departmentId === dept.id).length;

            return (
              <div
                key={dept.id}
                className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${dept.bg} dark:bg-slate-800 ${dept.color} flex items-center justify-center border ${dept.border} dark:border-slate-700`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isAdmin && doc && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setEditingDoc(doc);
                            setShowModal(true);
                          }}
                          className="p-1 text-slate-400 hover:text-sky-600 rounded"
                          title="แก้ไขลิงก์"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{dept.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {dept.subtitle ?? `${actCount} โครงการ/กิจกรรมในสังกัด`}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  {doc && doc.gdriveUrl ? (
                    <a
                      href={doc.gdriveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <Folder className="w-4 h-4 text-amber-500" />
                      <span>{dept.isFormCard ? 'เปิดไฟล์ / ดาวน์โหลด' : 'เปิดโฟลเดอร์ Drive'}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ) : (
                    <div className="text-center">
                      {isAdmin ? (
                        <button
                          onClick={() => {
                            setEditingDoc({
                              id: dept.isFormCard ? 'doc_plan_forms' : `doc_dept_${dept.id}`,
                              fiscalYear: currentYear,
                              departmentId: dept.id,
                              title: dept.isFormCard ? 'แบบฟอร์มเอกสารงานแผน' : `โฟลเดอร์${dept.name} ปีงบ ${currentYear}`,
                              docType: 'folder',
                              gdriveUrl: '',
                              updatedAt: new Date().toISOString().split('T')[0]
                            });
                            setShowModal(true);
                          }}
                          className="active-press w-full inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 text-xs font-semibold rounded-xl border border-sky-200 dark:border-sky-800 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{dept.isFormCard ? 'ใส่ลิงก์แบบฟอร์ม' : 'ใส่ลิงก์ Drive ฝ่ายนี้'}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 block py-1.5">
                          รอแอดมินเพิ่มลิงก์โฟลเดอร์
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <DocumentModal
          doc={editingDoc}
          onClose={() => {
            setShowModal(false);
            setEditingDoc(null);
          }}
        />
      )}
    </div>
  );
}
