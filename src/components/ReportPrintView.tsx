'use client';

import React, { useState } from 'react';
import { ActivityReport } from '@/lib/types';
import { Printer, Download, ArrowLeft, Sparkles, FileText, Check, Image as ImageIcon } from 'lucide-react';
import { exportReportToDocx } from '@/lib/docxExport';

interface ReportPrintViewProps {
  report: ActivityReport;
  onBack: () => void;
}

export default function ReportPrintView({ report, onBack }: ReportPrintViewProps) {
  const [templateType, setTemplateType] = useState<'infographic' | 'formal'>('infographic');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDocxExport = async () => {
    await exportReportToDocx(report);
  };

  const handleDirectPdfDownload = async () => {
    setIsExportingPdf(true);
    try {
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready;
      }
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('print-sheet');
      if (!element) return;
      const opt = {
        margin: 0,
        filename: `รายงาน_${report.activityName || 'กิจกรรม'}_ปี${report.fiscalYear || '2570'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: 'avoid-all' as const }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Direct PDF export error, falling back to print dialog:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const schoolName = 'โรงเรียนบางกล่ำวิทยารัชมังคลาภิเษก';
  const areaOffice = 'สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาสงขลา สตูล';
  const fiscalYearThai = report.fiscalYear || '2570';

  return (
    <div className="space-y-6">
      {/* Action Toolbar (hidden on print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปแก้ไขฟอร์ม</span>
        </button>

        {/* Template Style Toggle */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setTemplateType('infographic')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 ${
              templateType === 'infographic'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>เทมเพลตอินโฟกราฟิกหน้าเดียว (ตามแบบตัวอย่าง)</span>
          </button>
          <button
            onClick={() => setTemplateType('formal')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 ${
              templateType === 'formal'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>แบบฟอร์มทางการราชการ</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDocxExport}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลดเป็น Word (.docx)</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน / บันทึกเป็น PDF (1 หน้าจบ สวยงาม 100%)</span>
          </button>
        </div>
      </div>

      {/* Guidance Banner */}
      <div className="max-w-4xl mx-auto mb-4 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl text-xs text-amber-950 shadow-xs print:hidden">
        <div className="flex items-start space-x-2.5">
          <span className="text-base">📌</span>
          <div className="space-y-1">
            <div className="font-bold text-[13px] text-amber-950">คำแนะนำการบันทึก PDF ให้ได้ไฟล์คมชัด 1 หน้าจบพอดีเป๊ะ:</div>
            <div className="text-slate-700 leading-relaxed">
              เมื่อกดปุ่มสีแดง <b>"พิมพ์รายงาน / บันทึกเป็น PDF"</b> หน้าต่างของระบบจะเปิดขึ้นมา ให้ตรวจสอบ 2 จุดนี้:
              <ul className="list-disc pl-4 mt-1 space-y-0.5 font-medium">
                <li>ปลายทาง (Destination): เลือก <b>"บันทึกเป็น PDF" (Save as PDF)</b></li>
                <li>ขอบกระดาษ (Margins): เลือก <b>"ไม่มี" (None)</b> เพื่อให้แถบสีชิดขอบกระดาษบน-ล่างพอดี 1 หน้าเป๊ะ (ไม่มีหน้าที่ 2)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. INFOGRAPHIC ONE-PAGE TEMPLATE (จัดสัดส่วนตรงตามภาพตัวอย่าง 100%)       */}
      {/* ========================================================================= */}
      {templateType === 'infographic' && (
        <div className="flex justify-center print:block print:m-0 print:p-0">
          <div 
            id="print-sheet"
            className="print-page w-[210mm] h-[296mm] max-h-[296mm] min-h-[296mm] bg-white text-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between border border-slate-200 print:border-none print:shadow-none print:m-0"
            style={{ 
              boxSizing: 'border-box',
              fontFamily: "'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', sans-serif"
            }}
          >
            {/* Top Header Area: Flush to top edge of paper, full gradient cover */}
            <div className="relative z-10 px-5 pt-3 pb-3 bg-gradient-to-r from-sky-400 via-sky-300 to-pink-300 shadow-xs flex-shrink-0">
              {/* Year badge */}
              <div className="flex justify-end mb-1">
                <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-rose-600 text-white text-[14px] font-bold shadow-xs leading-none">
                  ปีงบประมาณ พ.ศ.{fiscalYearThai}
                </span>
              </div>

              {/* Title & Logo row */}
              <div className="flex items-center justify-between gap-4">
                {/* School Emblem Logo: Enlarged to 96px, perfectly fitted inside the colored banner */}
                <div className="w-[96px] h-[96px] rounded-full shadow-lg border-[3px] border-white flex-shrink-0 relative overflow-hidden bg-[#24588d] flex items-center justify-center">
                  <img
                    src="/school-logo.png"
                    alt="ตราโรงเรียนบางกล่ำวิทยารัชมังคลาภิเษก"
                    className="w-full h-full object-cover object-center scale-105"
                  />
                </div>

                {/* Main titles */}
                <div className="flex-1 pl-1">
                  <h1 className="text-[25px] font-black text-rose-600 tracking-tight leading-snug drop-shadow-xs mb-0.5">
                    รายงานผลการดำเนินงาน
                  </h1>
                  <h2 className="text-[17px] font-extrabold text-sky-950 leading-snug mb-1.5 truncate">
                    {report.projectName || 'โครงการตามแผนปฏิบัติการประจำปี'}
                  </h2>

                  {/* Activity Pill */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[16px] font-bold text-slate-800 whitespace-nowrap">กิจกรรม</span>
                    <div className="inline-flex items-center px-3 py-1 bg-white border border-sky-400 text-sky-900 rounded-full text-[15px] font-bold shadow-xs leading-none truncate max-w-md">
                      {report.activityName}
                    </div>
                  </div>

                  {/* Budget & Responsible Metadata */}
                  <div className="flex flex-wrap items-center gap-x-4 text-[15px] text-slate-800 font-medium leading-snug">
                    <div>
                      งบประมาณ : <b className="text-slate-950">{(report.allocatedBudget || 0).toLocaleString()} บาท</b>
                    </div>
                    <div>
                      แหล่งงบประมาณ : <b className="text-slate-950">{report.budgetSource || 'งบอุดหนุน'}</b>
                    </div>
                    <div>
                      ผู้รับผิดชอบโครงการ : <b className="text-slate-950">{report.responsiblePerson || '-'}</b>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex-shrink-0 text-center pl-1">
                  <div className="border border-pink-400 bg-white rounded-xl p-1.5 shadow-xs inline-block">
                    <div className="text-[10px] font-extrabold text-pink-600 tracking-wider mb-1 uppercase">SCAN ME</div>
                    <svg className="w-11 h-11" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="33" height="33" rx="3" fill="#0f172a"/>
                      <rect x="3" y="3" width="9" height="9" fill="white" rx="1"/>
                      <rect x="5" y="5" width="5" height="5" fill="#0f172a"/>
                      <rect x="6.5" y="6.5" width="2" height="2" fill="white"/>
                      <rect x="21" y="3" width="9" height="9" fill="white" rx="1"/>
                      <rect x="23" y="5" width="5" height="5" fill="#0f172a"/>
                      <rect x="24.5" y="6.5" width="2" height="2" fill="white"/>
                      <rect x="3" y="21" width="9" height="9" fill="white" rx="1"/>
                      <rect x="5" y="23" width="5" height="5" fill="#0f172a"/>
                      <rect x="6.5" y="24.5" width="2" height="2" fill="white"/>
                      <rect x="15" y="4" width="3" height="6" fill="white"/>
                      <rect x="15" y="14" width="6" height="3" fill="white"/>
                      <rect x="14" y="21" width="4" height="4" fill="white"/>
                      <rect x="22" y="16" width="3" height="4" fill="white"/>
                      <rect x="26" y="22" width="4" height="3" fill="white"/>
                      <rect x="20" y="25" width="3" height="5" fill="white"/>
                      <rect x="26" y="27" width="4" height="3" fill="white"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area: Single cohesive card wrapping Columns & Signatures */}
            <div className="relative z-10 px-4 my-2 flex-1 flex flex-col justify-between overflow-hidden">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 flex-1 flex flex-col justify-between overflow-hidden">
                
                {/* 2-Column Content Layout (Natural top-to-bottom auto layout) */}
                <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden">
                  {/* ---------------- LEFT COLUMN (col-span-5) ---------------- */}
                  {/* Natural auto-spacing: เป้าหมาย moves up close to วัตถุประสงค์ with balanced spacing */}
                  <div className="col-span-5 flex flex-col pr-3.5 border-r border-slate-200 overflow-hidden space-y-3">
                    {/* วัตถุประสงค์ */}
                    <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3 shadow-2xs">
                      <div className="inline-flex items-center px-3 py-1 bg-amber-500 text-white text-[15px] font-bold rounded-full shadow-2xs mb-2 leading-none">
                        วัตถุประสงค์
                      </div>
                      <div className="text-[16px] text-slate-800 space-y-1.5 pl-1 leading-normal">
                        {(report.objectives || []).slice(0, 3).map((obj, i) => (
                          <div key={i} className="flex items-start space-x-1.5">
                            <span className="font-bold text-slate-900">{i + 1}.</span>
                            <span>{obj}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* เป้าหมาย: อยู่ต่อเนื่องด้านล่างอย่างพอดี */}
                    <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3 shadow-2xs">
                      <div className="inline-flex items-center px-3 py-1 bg-amber-500 text-white text-[15px] font-bold rounded-full shadow-2xs mb-2 leading-none">
                        เป้าหมาย
                      </div>
                      <div className="space-y-2 pl-1 text-[16px] leading-normal">
                        <div>
                          <div className="font-bold text-amber-900 flex items-center gap-1.5">
                            <span className="text-amber-600">▪</span>
                            <span>เชิงปริมาณ</span>
                          </div>
                          <p className="text-slate-800 pl-3.5 pt-0.5">{report.quantitativeTarget || '-'}</p>
                        </div>
                        <div>
                          <div className="font-bold text-amber-900 flex items-center gap-1.5">
                            <span className="text-amber-600">▪</span>
                            <span>เชิงคุณภาพ</span>
                          </div>
                          <p className="text-slate-800 pl-3.5 pt-0.5">{report.qualitativeTarget || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ---------------- RIGHT COLUMN (col-span-7) ---------------- */}
                  {/* Natural auto-spacing between sections */}
                  <div className="col-span-7 flex flex-col pl-1 overflow-hidden space-y-2">
                    {/* ขอบเขตของโครงการ */}
                    <div>
                      <div className="text-[16px] font-bold text-slate-900 leading-snug mb-0.5">
                        ขอบเขตของโครงการ
                      </div>
                      <div className="text-[15px] text-slate-700 leading-normal">
                        <div>ระยะเวลาดำเนินงาน: ระหว่าง วันที่ {report.periodStart || '-'} ถึง {report.periodEnd || '-'}</div>
                        <div>งบประมาณ จำนวน <b className="text-slate-900 font-bold">{(report.actualUsedBudget || 0).toLocaleString()} บาท</b> (คงเหลือ {((report.allocatedBudget || 0) - (report.actualUsedBudget || 0)).toLocaleString()} บาท)</div>
                      </div>
                    </div>

                    {/* ผลการดำเนินงาน */}
                    <div>
                      <div className="inline-flex items-center px-2.5 py-0.5 bg-amber-100 text-amber-950 text-[14px] font-bold rounded mb-1 leading-normal">
                        ผลการดำเนินงาน
                      </div>
                      <p className="text-[15px] text-slate-800 leading-normal">
                        {report.performanceResult || 'การดำเนินงานบรรลุตามวัตถุประสงค์ที่กำหนดไว้ทุกประการ นักเรียนและบุคลากรได้รับประโยชน์และมีส่วนร่วมอย่างมีประสิทธิภาพ'}
                      </p>
                    </div>

                    {/* ปัญหา/อุปสรรค/ข้อเสนอแนะ */}
                    <div>
                      <div className="text-[15px] font-bold text-slate-900 leading-snug mb-0.5">
                        ปัญหา/อุปสรรค/ข้อเสนอแนะ
                      </div>
                      <p className="text-[15px] text-slate-700 leading-normal">
                        {report.problemsObstacles || 'การจัดกิจกรรมเป็นไปด้วยความเรียบร้อย ไม่มีปัญหาหรืออุปสรรค'}
                      </p>
                    </div>

                    {/* ภาพกิจกรรม 3 ภาพ: ขยายให้ใหญ่ขึ้นชัดเจน มองออกว่าทำอะไร (h-36 ~ 144px) */}
                    <div>
                      <div className="text-[16px] font-bold text-slate-900 leading-snug mb-1.5 flex items-center justify-between">
                        <span>ภาพกิจกรรม</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[0, 1, 2].map((idx) => {
                          const img = report.images?.[idx];
                          return (
                            <div key={idx} className="h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-sm relative group">
                              {img ? (
                                <img
                                  src={img}
                                  alt={`ภาพกิจกรรม ${idx + 1}`}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                  <ImageIcon className="w-7 h-7 mb-1 opacity-50" />
                                  <span className="text-[14px] font-medium">ภาพที่ {idx + 1}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* สรุปผลการดำเนินงานตามเป้าหมาย / ตัวชี้วัด */}
                    <div>
                      <div className="inline-flex items-center px-3 py-1 bg-amber-500 text-white text-[14px] font-bold rounded mb-1 leading-none shadow-2xs">
                        สรุปผลการดำเนินงานตามเป้าหมาย / ตัวชี้วัด
                      </div>
                      <table className="w-full text-[15px] border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold">
                            <th className="border border-slate-300 py-0.5 px-1 text-center w-8">ข้อที่</th>
                            <th className="border border-slate-300 py-0.5 px-1.5 text-left">วัตถุประสงค์</th>
                            <th className="border border-slate-300 py-0.5 px-1 text-center w-12">บรรลุ</th>
                            <th className="border border-slate-300 py-0.5 px-1 text-center w-14">ไม่บรรลุ</th>
                            <th className="border border-slate-300 py-0.5 px-1.5 text-left w-24">ผลดำเนินงาน</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(report.evaluations || []).slice(0, 3).map((ev, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="border border-slate-300 py-0.5 px-1 text-center font-bold text-slate-700">{i + 1}</td>
                              <td className="border border-slate-300 py-0.5 px-1.5 truncate max-w-[130px]">{ev.objective}</td>
                              <td className="border border-slate-300 py-0.5 px-1 text-center font-bold text-emerald-700">
                                {ev.isAchieved ? '✓' : ''}
                              </td>
                              <td className="border border-slate-300 py-0.5 px-1 text-center font-bold text-rose-700">
                                {!ev.isAchieved ? '✓' : ''}
                              </td>
                              <td className="border border-slate-300 py-0.5 px-1.5 text-slate-700">
                                {ev.isAchieved ? 'บรรลุเป้าหมาย' : 'ไม่บรรลุ'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Bottom Signatures Section: Pinned neatly at bottom of card */}
                <div className="grid grid-cols-2 gap-3 pt-2 mt-2 border-t border-slate-100">
                  {/* Left signature capsule */}
                  <div className="bg-sky-50/70 border border-sky-200/90 rounded-xl px-3 py-1.5 text-center text-[15px] leading-tight shadow-2xs">
                    <div className="text-slate-700 whitespace-nowrap">ลงชื่อ................................................ผู้รายงาน</div>
                    <div className="font-bold text-slate-900 mt-0.5 whitespace-nowrap">( {report.reporterName || '................................................'} )</div>
                    <div className="text-slate-600 text-[14px] whitespace-nowrap">ตำแหน่ง {report.reporterPosition || 'ครู'}</div>
                  </div>

                  {/* Right signature capsule */}
                  <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl px-3 py-1.5 text-center text-[15px] leading-tight shadow-2xs">
                    <div className="text-slate-700 whitespace-nowrap">ลงชื่อ................................................ผู้อนุมัติโครงการ</div>
                    <div className="font-bold text-slate-900 mt-0.5 whitespace-nowrap">( {report.directorName || 'นายผู้อำนวยการ เกียรติภูมิสูง'} )</div>
                    <div className="text-slate-600 text-[14px] whitespace-nowrap">ตำแหน่ง ผู้อำนวยการโรงเรียน</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Footer Ribbon Strip */}
            <div className="relative z-10 bg-gradient-to-r from-red-800 via-rose-800 to-red-900 text-white py-2 px-5 flex items-center justify-center text-[14px] font-bold tracking-tight shadow-md flex-shrink-0">
              <div className="flex items-center space-x-2 text-center">
                <span className="tracking-widest opacity-85">:::::</span>
                <span>{schoolName}</span>
                <span className="opacity-85 font-normal">| {areaOffice}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FORMAL GOVERNMENT A4 TEMPLATE (ฟิตพอดี 1 หน้ากระดาษ A4 สัดส่วนราชการ) */}
      {/* ========================================================================= */}
      {templateType === 'formal' && (
        <div className="flex justify-center print:block print:m-0 print:p-0">
          <div 
            className="print-page w-[210mm] h-[297mm] max-h-[297mm] min-h-[297mm] bg-white px-10 py-9 shadow-xl border border-slate-200 print:border-none print:shadow-none print:m-0 text-slate-900 flex flex-col justify-between overflow-hidden"
            style={{ 
              boxSizing: 'border-box',
              fontFamily: "'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', sans-serif"
            }}
          >
            <div className="space-y-4">
              {/* Header (Title 18pt) */}
              <div className="text-center border-b-2 border-slate-900 pb-2">
                <h1 className="text-[18px] font-bold tracking-tight text-slate-950 leading-snug">
                  แบบรายงานผลการดำเนินงานโครงการ / กิจกรรม
                </h1>
                <p className="text-[16px] font-bold text-slate-900 mt-0.5 leading-snug">
                  {schoolName} ตามแผนปฏิบัติการประจำปีงบประมาณ {fiscalYearThai}
                </p>
              </div>

              {/* ๑. ข้อมูลทั่วไปของโครงการและกิจกรรม (Header 16pt, Body 14pt) */}
              <div className="space-y-1.5">
                <h2 className="font-bold underline text-[16px] text-slate-950 leading-normal">
                  ๑. ข้อมูลทั่วไปของโครงการและกิจกรรม
                </h2>
                <div className="space-y-1 pl-3 text-[14px] text-slate-900 leading-snug">
                  <div>
                    <span className="font-bold">ชื่อโครงการ: </span>
                    <span>{report.projectName || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold">ชื่อกิจกรรม: </span>
                    <span>{report.activityName || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold">แหล่งงบประมาณ: </span>
                      <span>{report.budgetSource || '-'}</span>
                    </div>
                    <div>
                      <span className="font-bold">งบประมาณที่ได้รับจัดสรร: </span>
                      <span>{(report.allocatedBudget || 0).toLocaleString()} บาท</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold">งบประมาณที่ใช้จริง: </span>
                      <span>{(report.actualUsedBudget || 0).toLocaleString()} บาท</span>
                    </div>
                    <div>
                      <span className="font-bold">งบประมาณคงเหลือ: </span>
                      <span>{((report.allocatedBudget || 0) - (report.actualUsedBudget || 0)).toLocaleString()} บาท</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold">ผู้รับผิดชอบโครงการ: </span>
                      <span>{report.responsiblePerson || '-'}</span>
                    </div>
                    <div>
                      <span className="font-bold">ระยะเวลาดำเนินการ: </span>
                      <span>{report.periodStart || '-'} ถึง {report.periodEnd || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ๒. รายละเอียดการดำเนินงานและผลลัพธ์ (Header 16pt, Body 14pt) */}
              <div className="space-y-1.5">
                <h2 className="font-bold underline text-[16px] text-slate-950 leading-normal">
                  ๒. รายละเอียดการดำเนินงานและผลลัพธ์
                </h2>
                <div className="space-y-1 pl-3 text-[14px] text-slate-900 leading-snug">
                  <div>
                    <span className="font-bold">วัตถุประสงค์โครงการ: </span>
                    <span>{(report.objectives || []).join(' | ')}</span>
                  </div>
                  <div>
                    <span className="font-bold">เป้าหมายเชิงปริมาณ: </span>
                    <span>{report.quantitativeTarget || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold">เป้าหมายเชิงคุณภาพ: </span>
                    <span>{report.qualitativeTarget || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold">ผลการดำเนินงาน: </span>
                    <span>{report.performanceResult || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold">ปัญหา อุปสรรค และข้อเสนอแนะ: </span>
                    <span>{report.problemsObstacles || '-'}</span>
                  </div>
                </div>
              </div>

              {/* ๓. สรุปผลการประเมินตามวัตถุประสงค์ (Header 16pt, Table 14pt) */}
              <div className="space-y-1.5">
                <h2 className="font-bold underline text-[16px] text-slate-950 leading-normal">
                  ๓. สรุปผลการประเมินตามวัตถุประสงค์
                </h2>
                <table className="w-full text-[14px] border-collapse border border-slate-900 text-slate-900">
                  <thead>
                    <tr className="bg-slate-100 font-bold">
                      <th className="border border-slate-900 py-1 px-2 text-center w-12">ที่</th>
                      <th className="border border-slate-900 py-1 px-2.5 text-center">วัตถุประสงค์</th>
                      <th className="border border-slate-900 py-1 px-2 text-center w-24">บรรลุ</th>
                      <th className="border border-slate-900 py-1 px-2 text-center w-24">ไม่บรรลุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.evaluations || []).map((ev, i) => (
                      <tr key={i}>
                        <td className="border border-slate-900 py-1 px-2 text-center font-bold">{i + 1}</td>
                        <td className="border border-slate-900 py-1 px-2.5">{ev.objective}</td>
                        <td className="border border-slate-900 py-1 px-2 text-center font-bold text-emerald-800">
                          {ev.isAchieved ? '✓' : ''}
                        </td>
                        <td className="border border-slate-900 py-1 px-2 text-center font-bold text-rose-800">
                          {!ev.isAchieved ? '✓' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ๔. ภาพถ่ายกิจกรรม (๓ ภาพ) (Header 16pt, Captions 14pt, Images h-32 ไม่แบน) */}
              <div className="space-y-1.5">
                <h2 className="font-bold underline text-[16px] text-slate-950 leading-normal">
                  ๔. ภาพถ่ายกิจกรรม (๓ ภาพ)
                </h2>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {[0, 1, 2].map((idx) => {
                    const img = report.images?.[idx];
                    return (
                      <div key={idx} className="text-center space-y-1">
                        <div className="h-32 bg-slate-100 border border-slate-400 rounded overflow-hidden flex items-center justify-center shadow-2xs">
                          {img ? (
                            <img
                              src={img}
                              alt={`ภาพกิจกรรม ${idx + 1}`}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[13px]">
                              <span>ไม่มีภาพ</span>
                            </div>
                          )}
                        </div>
                        <p className="text-[13px] text-slate-800 font-medium leading-snug line-clamp-1">
                          ภาพที่ {idx + 1}: ภาพการดำเนินกิจกรรม {report.activityName || 'กิจกรรมพัฒนาคุณภาพผู้เรียน'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ส่วนลงชื่อราชการ strictly on same page */}
            <div className="pt-4 border-t border-slate-400 text-[14px] leading-relaxed">
              <div className="text-center mb-3">
                <p className="text-[14px] font-semibold text-slate-800">
                  ขอรับรองว่ารายงานดังกล่าวเป็นความจริงทุกประการ
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Left: ผู้รายงาน */}
                <div className="text-center space-y-0.5">
                  <div className="whitespace-nowrap">ลงชื่อ........................................................ผู้รายงาน</div>
                  <div className="font-bold whitespace-nowrap">( {report.reporterName || '........................................................'} )</div>
                  <div className="text-slate-700 whitespace-nowrap">ตำแหน่ง {report.reporterPosition || 'ครู'}</div>
                </div>

                {/* Right: ผู้อำนวยการโรงเรียน */}
                <div className="text-center space-y-0.5">
                  <div className="whitespace-nowrap">ลงชื่อ........................................................ผู้อำนวยการโรงเรียน</div>
                  <div className="font-bold whitespace-nowrap">( {report.directorName || 'นายผู้อำนวยการ เกียรติภูมิสูง'} )</div>
                  <div className="text-slate-700 whitespace-nowrap">ตำแหน่ง ผู้อำนวยการโรงเรียน</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
