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
            onClick={handleDirectPdfDownload}
            disabled={isExportingPdf}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'กำลังสร้างไฟล์ PDF...' : 'ดาวน์โหลด PDF ตรง (1 หน้าจบ เป๊ะ 100%)'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition-all"
            title="หากต้องการพิมพ์ ให้เลือก ขอบกระดาษ เป็น 'ไม่มี' (Margins: None)"
          >
            <Printer className="w-4 h-4" />
            <span>สั่งพิมพ์ / Print Dialog</span>
          </button>
        </div>
      </div>

      {/* Helpful Tip */}
      <div className="max-w-4xl mx-auto mb-4 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-2">
          <span className="font-bold">💡 แนะนำ:</span>
          <span>กดปุ่มสีแดง <b>"ดาวน์โหลด PDF ตรง"</b> จะได้ไฟล์ขนาด A4 ชิดขอบบน-ล่างพอดี 1 หน้าเป๊ะทันทีโดยไม่ต้องตั้งค่าใดๆ (หากต้องการสั่งพิมพ์ผ่านเบราว์เซอร์ ให้เลือก ขอบกระดาษ เป็น "ไม่มี" / Margins: None)</span>
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
            <div className="relative z-10 px-5 pt-2.5 pb-2.5 bg-gradient-to-r from-sky-400 via-sky-300 to-pink-300 shadow-xs flex-shrink-0">
              {/* Year badge */}
              <div className="flex justify-end mb-0.5">
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[15px] font-bold px-3.5 py-0.5 rounded-full shadow-xs">
                  ปีงบประมาณ พ.ศ.{fiscalYearThai}
                </span>
              </div>

              {/* Title & Logo row */}
              <div className="flex items-center justify-between gap-3.5">
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
                  <h1 className="text-[26px] font-black text-rose-600 tracking-tight leading-none drop-shadow-xs">
                    รายงานผลการดำเนินงาน
                  </h1>
                  <h2 className="text-[18px] font-extrabold text-sky-950 line-clamp-1 leading-tight mt-1">
                    {report.projectName || 'โครงการตามแผนปฏิบัติการประจำปี'}
                  </h2>

                  {/* Activity Pill */}
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[16px] font-bold text-slate-800 whitespace-nowrap">กิจกรรม</span>
                    <div className="inline-block px-3.5 py-0.5 bg-white/95 border border-sky-400 text-sky-900 rounded-full text-[16px] font-bold shadow-xs truncate max-w-md">
                      {report.activityName}
                    </div>
                  </div>

                  {/* Budget & Responsible Metadata */}
                  <div className="flex flex-wrap items-center gap-x-4 text-[16px] text-slate-700 font-medium mt-1 leading-tight">
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
                  <div className="border border-pink-400 bg-white rounded-xl p-1 shadow-xs inline-block">
                    <div className="text-[10px] font-extrabold text-pink-600 tracking-wider mb-0.5 uppercase">SCAN ME</div>
                    <div className="w-11 h-11 bg-slate-900 p-0.5 rounded flex items-center justify-center">
                      <div className="w-full h-full grid grid-cols-4 gap-0.5 bg-slate-900">
                        <div className="bg-white rounded-[1px]"></div>
                        <div className="bg-white rounded-[1px]"></div>
                        <div className="bg-slate-900"></div>
                        <div className="bg-white rounded-[1px]"></div>
                        <div className="bg-white rounded-[1px]"></div>
                        <div className="bg-slate-900"></div>
                        <div className="bg-white rounded-[1px]"></div>
                        <div className="bg-slate-900"></div>
                        <div className="bg-slate-900"></div>
                        <div className="bg-white rounded-[1px]"></div>
                        <div className="bg-white rounded-[1px]"></div>
                        <div className="bg-white rounded-[1px]"></div>
                        <div className="bg-white rounded-[1px]"></div>
                        <div className="bg-slate-900"></div>
                        <div className="bg-white rounded-[1px]"></div>
                        <div className="bg-white rounded-[1px]"></div>
                      </div>
                    </div>
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
                    <div className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-3 shadow-2xs">
                      <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[16px] font-bold px-3 py-0.5 rounded-full shadow-xs mb-1.5">
                        วัตถุประสงค์
                      </div>
                      <div className="text-[16px] text-slate-800 space-y-1.5 pl-1 leading-snug">
                        {(report.objectives || []).slice(0, 3).map((obj, i) => (
                          <div key={i} className="flex items-start space-x-1.5">
                            <span className="font-bold text-slate-900">{i + 1}.</span>
                            <span>{obj}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* เป้าหมาย: อยู่ต่อเนื่องด้านล่างอย่างพอดี */}
                    <div className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-3 shadow-2xs">
                      <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[16px] font-bold px-3 py-0.5 rounded-full shadow-xs mb-1.5">
                        เป้าหมาย
                      </div>
                      <div className="space-y-2.5 pl-1 text-[16px] leading-snug">
                        <div>
                          <div className="font-bold text-amber-900 flex items-center gap-1">
                            <span>•</span>
                            <span>เชิงปริมาณ</span>
                          </div>
                          <p className="text-slate-800 pl-3">{report.quantitativeTarget || '-'}</p>
                        </div>
                        <div>
                          <div className="font-bold text-amber-900 flex items-center gap-1">
                            <span>•</span>
                            <span>เชิงคุณภาพ</span>
                          </div>
                          <p className="text-slate-800 pl-3">{report.qualitativeTarget || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ---------------- RIGHT COLUMN (col-span-7) ---------------- */}
                  {/* Natural auto-spacing between sections */}
                  <div className="col-span-7 flex flex-col pl-1 overflow-hidden space-y-2">
                    {/* ขอบเขตของโครงการ */}
                    <div>
                      <div className="text-[16px] font-bold text-slate-900 leading-none mb-0.5">
                        ขอบเขตของโครงการ
                      </div>
                      <div className="text-[15px] text-slate-700 leading-tight">
                        <div>ระยะเวลาดำเนินงาน: ระหว่าง วันที่ {report.periodStart || '-'} ถึง {report.periodEnd || '-'}</div>
                        <div>งบประมาณ จำนวน <b className="text-slate-900 font-bold">{(report.actualUsedBudget || 0).toLocaleString()} บาท</b> (คงเหลือ {((report.allocatedBudget || 0) - (report.actualUsedBudget || 0)).toLocaleString()} บาท)</div>
                      </div>
                    </div>

                    {/* ผลการดำเนินงาน */}
                    <div>
                      <div className="inline-block bg-amber-100 text-amber-900 text-[15px] font-bold px-2 py-0.5 rounded mb-0.5 leading-tight">
                        ผลการดำเนินงาน
                      </div>
                      <p className="text-[16px] text-slate-800 leading-snug line-clamp-3">
                        {report.performanceResult || 'การดำเนินงานบรรลุตามวัตถุประสงค์ที่กำหนดไว้ทุกประการ นักเรียนและบุคลากรได้รับประโยชน์และมีส่วนร่วมอย่างมีประสิทธิภาพ'}
                      </p>
                    </div>

                    {/* ปัญหา/อุปสรรค/ข้อเสนอแนะ */}
                    <div>
                      <div className="text-[15px] font-bold text-slate-900 leading-none mb-0.5">
                        ปัญหา/อุปสรรค/ข้อเสนอแนะ
                      </div>
                      <p className="text-[15px] text-slate-700 leading-snug line-clamp-2">
                        {report.problemsObstacles || 'การจัดกิจกรรมเป็นไปด้วยความเรียบร้อย ไม่มีปัญหาหรืออุปสรรค'}
                      </p>
                    </div>

                    {/* ภาพกิจกรรม 3 ภาพ: ขยายให้ใหญ่ขึ้นชัดเจน มองออกว่าทำอะไร (h-36 ~ 144px) */}
                    <div>
                      <div className="text-[16px] font-bold text-slate-900 leading-none mb-1.5 flex items-center justify-between">
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
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[15px] font-bold px-2.5 py-0.5 rounded shadow-2xs mb-0.5 leading-tight">
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
            <div className="relative z-10 bg-gradient-to-r from-red-800 via-rose-800 to-red-900 text-white py-2 px-5 flex items-center justify-between text-[13.5px] font-bold tracking-tight shadow-md flex-shrink-0">
              <div className="flex items-center space-x-2">
                <span className="tracking-widest opacity-85">:::::</span>
                <span>{schoolName}</span>
                <span className="opacity-85 font-normal">| {areaOffice}</span>
              </div>
              <span className="text-[12px] font-normal opacity-90">ระบบติดตามแผนปฏิบัติการงบประมาณ</span>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FORMAL GOVERNMENT A4 TEMPLATE (ฟิตพอดี 1 หน้ากระดาษ A4)                 */}
      {/* ========================================================================= */}
      {templateType === 'formal' && (
        <div className="flex justify-center print:block print:m-0 print:p-0">
          <div 
            className="print-page w-[210mm] h-[296mm] max-h-[296mm] min-h-[296mm] bg-white p-5 sm:p-6 shadow-lg border border-slate-200 print:border-none print:shadow-none print:m-0 text-slate-900 leading-snug flex flex-col justify-between overflow-hidden"
            style={{ 
              boxSizing: 'border-box',
              fontFamily: "'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', sans-serif"
            }}
          >
            <div>
              {/* Header */}
              <div className="text-center space-y-0.5 mb-2.5 border-b border-slate-900 pb-1">
                <h1 className="text-[22px] font-bold tracking-tight leading-none">
                  แบบรายงานผลการดำเนินงานโครงการ / กิจกรรม
                </h1>
                <p className="text-[16px] font-semibold mt-0.5">
                  {schoolName} ตามแผนปฏิบัติการประจำปีงบประมาณ {fiscalYearThai}
                </p>
              </div>

              {/* Section 1 */}
              <div className="space-y-0.5 mb-2 text-[15px] leading-tight">
                <h2 className="font-bold underline text-[16px]">
                  ๑. ข้อมูลทั่วไปของโครงการและกิจกรรม
                </h2>
                <div className="space-y-0.5 pl-2">
                  <div>
                    <span className="font-bold">ชื่อโครงการ: </span>
                    <span>{report.projectName || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold">ชื่อกิจกรรม: </span>
                    <span>{report.activityName || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-bold">แหล่งงบประมาณ: </span>
                      <span>{report.budgetSource || '-'}</span>
                    </div>
                    <div>
                      <span className="font-bold">งบประมาณที่ได้รับจัดสรร: </span>
                      <span>{(report.allocatedBudget || 0).toLocaleString()} บาท</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-bold">งบประมาณที่ใช้จริง: </span>
                      <span>{(report.actualUsedBudget || 0).toLocaleString()} บาท</span>
                    </div>
                    <div>
                      <span className="font-bold">งบประมาณคงเหลือ: </span>
                      <span>{((report.allocatedBudget || 0) - (report.actualUsedBudget || 0)).toLocaleString()} บาท</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
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

              {/* Section 2 */}
              <div className="space-y-0.5 mb-2 text-[15px] leading-tight">
                <h2 className="font-bold underline text-[16px]">
                  ๒. รายละเอียดการดำเนินงานและผลการปฏิบัติงาน
                </h2>
                <div className="space-y-0.5 pl-2">
                  <div>
                    <span className="font-bold">วัตถุประสงค์ของโครงการ: </span>
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

              {/* Section 3 */}
              <div className="space-y-0.5 mb-2 text-[15px] leading-tight">
                <h2 className="font-bold underline text-[16px]">
                  ๓. สรุปผลการประเมินตามวัตถุประสงค์
                </h2>
                <table className="w-full text-[14px] border-collapse border border-slate-900">
                  <thead>
                    <tr className="bg-slate-100 font-bold">
                      <th className="border border-slate-900 py-0.5 px-2 text-center w-10">ที่</th>
                      <th className="border border-slate-900 py-0.5 px-2 text-center">วัตถุประสงค์</th>
                      <th className="border border-slate-900 py-0.5 px-2 text-center w-20">บรรลุ</th>
                      <th className="border border-slate-900 py-0.5 px-2 text-center w-20">ไม่บรรลุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.evaluations || []).map((ev, i) => (
                      <tr key={i}>
                        <td className="border border-slate-900 py-0.5 px-2 text-center font-medium">{i + 1}</td>
                        <td className="border border-slate-900 py-0.5 px-2">{ev.objective}</td>
                        <td className="border border-slate-900 py-0.5 px-2 text-center font-bold text-emerald-800">
                          {ev.isAchieved ? '✓' : ''}
                        </td>
                        <td className="border border-slate-900 py-0.5 px-2 text-center font-bold text-rose-800">
                          {!ev.isAchieved ? '✓' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section 4 */}
              <div className="space-y-0.5 mb-2 text-[15px] leading-tight">
                <h2 className="font-bold underline text-[16px]">
                  ๔. ภาพถ่ายการจัดกิจกรรม (๓ ภาพ)
                </h2>
                <div className="grid grid-cols-3 gap-2 pt-0.5">
                  {(report.images || []).slice(0, 3).map((img, i) => (
                    <div key={i} className="text-center space-y-0.5">
                      <div className="h-14 bg-slate-100 border border-slate-300 rounded overflow-hidden flex items-center justify-center">
                        <img src={img} alt={`ภาพกิจกรรม ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[12px] text-slate-600 font-medium">ภาพที่ {i + 1}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 5: Signatures side-by-side strictly on same page */}
            <div className="pt-2 border-t border-slate-300 text-[15px] leading-tight">
              <div className="grid grid-cols-2 gap-4">
                {/* Left: ผู้รายงาน */}
                <div className="text-center space-y-0.5">
                  <div className="whitespace-nowrap">ลงชื่อ................................................ผู้รายงาน</div>
                  <div className="font-bold whitespace-nowrap">( {report.reporterName || '................................................'} )</div>
                  <div className="text-slate-600 text-[14px] whitespace-nowrap">ตำแหน่ง {report.reporterPosition || 'ครู'}</div>
                </div>

                {/* Right: ผู้อำนวยการโรงเรียน */}
                <div className="text-center space-y-0.5">
                  <div className="whitespace-nowrap">ลงชื่อ................................................ผู้อนุมัติโครงการ</div>
                  <div className="font-bold whitespace-nowrap">( {report.directorName || '................................................'} )</div>
                  <div className="text-slate-600 text-[14px] whitespace-nowrap">ผู้อำนวยการ{schoolName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
