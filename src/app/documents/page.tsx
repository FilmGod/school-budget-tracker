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
  Trash2, 
  Calendar,
  Sparkles
} from 'lucide-react';

export default function DocumentsPage() {
  const { 
    currentYear, 
    filteredDocuments, 
    filteredActivities, 
    db, 
    isAdmin, 
    deleteDocument 
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ProjectDocument | null>(null);

  // Master Plan Books
  const masterBooks = filteredDocuments.filter(d => d.departmentId === 'all' || d.docType === 'plan_book');

  // Department Folder mapping
  const departmentConfigs = [
    { id: 'academic', name: 'ฝ่ายบริหารวิชาการ', icon: GraduationCap, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
    { id: 'general', name: 'ฝ่ายบริหารทั่วไป', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { id: 'personnel', name: 'ฝ่ายบริหารงานบุคคล', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { id: 'budget', name: 'ฝ่ายบริหารงบประมาณ', icon: Coins, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  ];

  // Activities with specific GDrive URLs (if any)
  const activitiesWithDrive = filteredActivities.filter(a => a.gdriveUrl && a.gdriveUrl.trim().length > 0);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`คุณต้องการลบเอกสาร "${title}" ใช่หรือไม่?`)) {
      await deleteDocument(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100 mb-2">
            <FolderDown className="w-3.5 h-3.5" />
            <span>คลังเอกสารและโฟลเดอร์ Google Drive ปีงบ {currentYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            รวมเล่มแผนปฏิบัติการและไฟล์โครงการ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            เข้าถึงเล่มแผนปฏิบัติการประจำปี และไฟล์ PDF รายงานโครงการของแต่ละฝ่ายผ่าน Google Drive
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingDoc(null);
              setShowModal(true);
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มลิงก์เอกสาร / ไดรฟ์</span>
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
            รวบรวมแผนงาน โครงการ กิจกรรม และการจัดสรรงบประมาณทั้งหมดของโรงเรียนตามระเบียบราชการ เชื่อมโยงตรงกับ Google Drive ให้สามารถเปิดดูไฟล์ฉบับเต็มและดาวน์โหลดได้ตลอดเวลา
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="https://docs.google.com/spreadsheets/d/1sMVxmsE9hNw2vc5se50OuC__ZAqBHZCJ/edit?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/25 transition-all"
            >
              <span>เปิดดูไฟล์ Google Drive ฉบับเต็ม</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Folders by 4 Departments */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            โฟลเดอร์รวบรวมเอกสารแยกตาม ๔ ฝ่าย
          </h2>
          <p className="text-xs text-slate-500">
            คลิกเพื่อเปิดโฟลเดอร์ Google Drive ของแต่ละฝ่ายสำหรับดูและอัปโหลดไฟล์ PDF
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {departmentConfigs.map((dept) => {
            const Icon = dept.icon;
            const doc = filteredDocuments.find(d => d.departmentId === dept.id);
            const actCount = filteredActivities.filter(a => a.departmentId === dept.id).length;

            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${dept.bg} ${dept.color} flex items-center justify-center border ${dept.border}`}>
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
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{dept.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {actCount} โครงการ/กิจกรรมในสังกัด
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <a
                    href={doc?.gdriveUrl || 'https://drive.google.com/'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
                  >
                    <Folder className="w-4 h-4 text-amber-500" />
                    <span>เปิดโฟลเดอร์ Drive</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. All Documents & Links Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              รายการเอกสารและไฟล์ PDF โครงการทั้งหมด
            </h3>
            <p className="text-xs text-slate-500">
              รวมลิงก์เข้าถึงเอกสารแนบ แผนปฏิบัติการ และสรุปผลโครงการ
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
            {filteredDocuments.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ชื่อเอกสาร / รายละเอียด</th>
                <th className="py-3 px-4 w-44">ฝ่ายที่รับผิดชอบ</th>
                <th className="py-3 px-4 w-36">ประเภท</th>
                <th className="py-3 px-4 w-32">อัปเดตเมื่อ</th>
                <th className="py-3 px-4 text-center w-36">ลิงก์ Google Drive</th>
                {isAdmin && <th className="py-3 px-4 text-center w-24">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocuments.map((doc) => {
                const deptObj = db.departments.find(d => d.id === doc.departmentId);
                const deptName = doc.departmentId === 'all' ? 'รวมทั้งโรงเรียน' : (deptObj?.name || '-');

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-sky-600 flex-shrink-0" />
                        <span className="font-bold text-slate-800">{doc.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {deptName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                        {doc.docType === 'plan_book' ? 'เล่มแผนปฏิบัติการ' : doc.docType === 'folder' ? 'โฟลเดอร์ฝ่าย' : 'เอกสาร PDF'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {doc.updatedAt || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <a
                        href={doc.gdriveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-sky-600 hover:text-sky-800 font-semibold"
                      >
                        <span>เปิด Drive</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingDoc(doc);
                              setShowModal(true);
                            }}
                            className="p-1 text-slate-400 hover:text-sky-600 rounded"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id, doc.title)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
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
