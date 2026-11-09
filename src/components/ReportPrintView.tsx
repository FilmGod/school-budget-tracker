'use client';

import React, { useState } from 'react';
import { ActivityReport } from '@/lib/types';
import { Printer, Download, ArrowLeft, Sparkles, FileText } from 'lucide-react';
import { exportReportToDocx } from '@/lib/docxExport';

interface ReportPrintViewProps {
  report: ActivityReport;
  onBack: () => void;
}

export default function ReportPrintView({ report, onBack }: ReportPrintViewProps) {
  const [templateType, setTemplateType] = useState<'infographic' | 'formal'>('infographic');

  const handlePrint = () => {
    window.print();
  };

  const handleDocxExport = async () => {
    await exportReportToDocx(report);
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
            <span>เทมเพลตอินโฟกราฟิกหน้าเดียว (แนะนำ)</span>
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

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDocxExport}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลดเป็น Word (.docx)</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน / บันทึก PDF (หน้าเดียว)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. INFOGRAPHIC ONE-PAGE TEMPLATE (TH Sarabun New 16pt / ฟิตพอดี 1 หน้า A4) */}
      {/* ========================================================================= */}
      {templateType === 'infographic' && (
        <div className="flex justify-center">
          <div 
            id="print-sheet"
            className="print-page w-[210mm] h-[282mm] max-h-[285mm] bg-white text-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between border border-slate-200 print:border-none print:shadow-none print:m-0"
            style={{ 
              boxSizing: 'border-box',
              fontFamily: "'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', sans-serif"
            }}
          >
            {/* Background gradient decorative banner */}
            <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-r from-sky-400 via-sky-300 to-pink-300 pointer-events-none" />
            <div className="absolute top-0 -left-10 w-44 h-44 bg-white/25 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-0 -right-10 w-48 h-48 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Top Year Banner Tab */}
            <div className="relative z-10 flex justify-end pt-1.5 pr-5">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[14px] font-bold px-3 py-0.5 rounded-full shadow-xs">
                ปีงบประมาณ พ.ศ.{fiscalYearThai}
              </div>
            </div>

            {/* Top Header Card */}
            <div className="relative z-10 px-5 pt-0 pb-1.5">
              <div className="flex items-center justify-between gap-3">
                {/* School Emblem Logo - Fitted Edge-to-Edge inside circle without white margins */}
                <div className="flex-shrink-0">
                  <div className="w-[84px] h-[84px] rounded-full shadow-md border-2 border-white flex items-center justify-center overflow-hidden bg-sky-900">
                    <img
                      src="/school-logo.png"
                      alt="ตราโรงเรียนบางกล่ำวิทยารัชมังคลาภิเษก"
                      className="w-full h-full object-cover scale-110 object-center"
                    />
                  </div>
                </div>

                {/* Main Titles */}
                <div className="flex-1 pl-1">
                  <h1 className="text-[26px] font-black text-rose-600 tracking-tight leading-tight drop-shadow-xs">
                    รายงานผลการดำเนินงาน
                  </h1>
                  <h2 className="text-[19px] font-extrabold text-sky-950 line-clamp-1 leading-tight mt-0.5">
                    {report.projectName || 'โครงการตามแผนปฏิบัติการประจำปี'}
                  </h2>

                  {/* Activity Pill */}
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[15px] font-bold text-slate-700 whitespace-nowrap">กิจกรรม</span>
                    <div className="inline-block px-3 py-0.5 bg-white/95 border border-sky-400 text-sky-900 rounded-full text-[15px] font-bold shadow-xs truncate max-w-md">
                      {report.activityName}
                    </div>
                  </div>

                  {/* Financial & In-charge line - Font size 15-16px */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-0 text-[15px] text-slate-700 font-medium mt-1 leading-tight">
                    <div>
                      งบประมาณ : <b className="text-slate-900">{(report.allocatedBudget || 0).toLocaleString()} บาท</b>
                    </div>
                    <div>
                      แหล่งงบประมาณ : <b className="text-slate-900">{report.budgetSource || 'งบอุดหนุน'}</b>
                    </div>
                    <div>
                      ผู้รับผิดชอบโครงการ : <b className="text-slate-900">{report.responsiblePerson || '-'}</b>
                    </div>
                  </div>
                </div>

                {/* QR Code Scan Me */}
                <div className="flex-shrink-0 text-center pl-1">
                  <div className="border border-pink-400 bg-white rounded-xl p-1 shadow-xs inline-block">
                    <div className="text-[10px] font-extrabold text-pink-600 tracking-wider mb-0.5 uppercase">SCAN ME</div>
                    {/* SVG QR Code Simulation */}
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

            {/* Main Content Area (Two Columns inside clean white card) */}
            <div className="relative z-10 px-4 flex-1 flex flex-col justify-between pb-1">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3.5 grid grid-cols-12 gap-3 flex-1">
                
                {/* ---------------- LEFT COLUMN (col-span-5) ---------------- */}
                <div className="col-span-5 flex flex-col justify-between pr-2 border-r border-slate-200">
                  <div className="space-y-3">
                    {/* วัตถุประสงค์ */}
                    <div>
                      <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[15px] font-bold px-3 py-0.5 rounded-full shadow-xs mb-1">
                        วัตถุประสงค์
                      </div>
                      <div className="text-[15px] text-slate-800 space-y-1 pl-1 leading-snug">
                        {(report.objectives || []).slice(0, 3).map((obj, i) => (
                          <div key={i} className="flex items-start space-x-1">
                            <span className="font-bold text-slate-900">{i + 1}.</span>
                            <span>{obj}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* เป้าหมาย */}
                    <div>
                      <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[15px] font-bold px-3 py-0.5 rounded-full shadow-xs mb-1">
                        เป้าหมาย
                      </div>
                      <div className="space-y-1.5 pl-1 text-[15px] leading-snug">
                        <div>
                          <div className="font-bold text-amber-900">เชิงปริมาณ</div>
                          <p className="text-slate-800 pl-1">{report.quantitativeTarget || '-'}</p>
                        </div>
                        <div>
                          <div className="font-bold text-amber-900">เชิงคุณภาพ</div>
                          <p className="text-slate-800 pl-1">{report.qualitativeTarget || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Left Bottom: Signature Box 1 */}
                  <div className="mt-2 pt-1.5 border-t border-slate-100">
                    <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-2 text-center text-[15px] leading-tight">
                      <div className="text-slate-700">ลงชื่อ........................................................ผู้รายงาน</div>
                      <div className="font-bold text-slate-900 mt-1">( {report.reporterName || '........................................................'} )</div>
                      <div className="text-slate-600 text-[14px]">ตำแหน่ง {report.reporterPosition || 'ครู'}</div>
                    </div>
                  </div>
                </div>

                {/* ---------------- RIGHT COLUMN (col-span-7) ---------------- */}
                <div className="col-span-7 flex flex-col justify-between pl-1">
                  <div className="space-y-2">
                    {/* ขอบเขตของโครงการ */}
                    <div>
                      <div className="text-[16px] font-bold text-slate-900 leading-tight">
                        ขอบเขตของโครงการ
                      </div>
                      <div className="text-[15px] text-slate-700 leading-snug">
                        <div>ระยะเวลาดำเนินงาน: ระหว่าง วันที่ {report.periodStart || '-'} ถึง {report.periodEnd || '-'}</div>
                        <div>งบประมาณ จำนวน <b className="text-slate-900 font-bold">{(report.actualUsedBudget || 0).toLocaleString()} บาท</b> (คงเหลือ {((report.allocatedBudget || 0) - (report.actualUsedBudget || 0)).toLocaleString()} บาท)</div>
                      </div>
                    </div>

                    {/* ผลการดำเนินงาน */}
                    <div>
                      <div className="inline-block bg-amber-100 text-amber-900 text-[14px] font-bold px-2 py-0.5 rounded mb-0.5">
                        ผลการดำเนินงาน
                      </div>
                      <p className="text-[15px] text-slate-800 leading-snug line-clamp-2">
                        {report.performanceResult || 'การดำเนินงานบรรลุตามวัตถุประสงค์ที่กำหนดไว้ทุกประการ นักเรียนและบุคลากรได้รับประโยชน์และมีส่วนร่วมอย่างมีประสิทธิภาพ'}
                      </p>
                    </div>

                    {/* ปัญหา/อุปสรรค/ข้อเสนอแนะ */}
                    <div>
                      <div className="text-[15px] font-bold text-slate-900 mb-0.5 leading-tight">
                        ปัญหา/อุปสรรค/ข้อเสนอแนะ
                      </div>
                      <p className="text-[14px] text-slate-700 leading-snug line-clamp-2">
                        {report.problemsObstacles || 'การจัดกิจกรรมเป็นไปด้วยความเรียบร้อย ไม่มีปัญหาหรืออุปสรรค'}
                      </p>
                    </div>

                    {/* ภาพกิจกรรม 3 ภาพ */}
                    <div>
                      <div className="text-[15px] font-bold text-slate-900 mb-1 leading-tight">
                        ภาพกิจกรรม
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[0, 1, 2].map((idx) => {
                          const img = report.images?.[idx];
                          return (
                            <div key={idx} className="h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                              {img ? (
                                <img
                                  src={img}
                                  alt={`ภาพกิจกรรม ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[12px] text-slate-400">
                                  ภาพที่ {idx + 1}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* สรุปผลการดำเนินงานตามเป้าหมาย / ตัวชี้วัด */}
                    <div>
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[14px] font-bold px-2.5 py-0.5 rounded shadow-2xs mb-1">
                        สรุปผลการดำเนินงานตามเป้าหมาย / ตัวชี้วัด
                      </div>
                      <table className="w-full text-[14px] border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold">
                            <th className="border border-slate-300 py-0.5 px-1 text-center w-8">ข้อที่</th>
                            <th className="border border-slate-300 py-0.5 px-1 text-left">วัตถุประสงค์</th>
                            <th className="border border-slate-300 py-0.5 px-1 text-center w-12">บรรลุ</th>
                            <th className="border border-slate-300 py-0.5 px-1 text-center w-14">ไม่บรรลุ</th>
                            <th className="border border-slate-300 py-0.5 px-1 text-left w-24">ผลดำเนินงาน</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(report.evaluations || []).slice(0, 3).map((ev, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="border border-slate-300 py-0.5 px-1 text-center font-bold text-slate-700">{i + 1}</td>
                              <td className="border border-slate-300 py-0.5 px-1 truncate max-w-[130px]">{ev.objective}</td>
                              <td className="border border-slate-300 py-0.5 px-1 text-center font-bold text-emerald-700">
                                {ev.isAchieved ? '✓' : ''}
                              </td>
                              <td className="border border-slate-300 py-0.5 px-1 text-center font-bold text-rose-700">
                                {!ev.isAchieved ? '✓' : ''}
                              </td>
                              <td className="border border-slate-300 py-0.5 px-1 text-slate-700">
                                {ev.isAchieved ? 'บรรลุเป้าหมาย' : 'ไม่บรรลุ'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Bottom: Signature Box 2 */}
                  <div className="mt-2 pt-1.5 border-t border-slate-100">
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2 text-center text-[15px] leading-tight">
                      <div className="text-slate-700">ลงชื่อ........................................................ผู้อนุมัติโครงการ</div>
                      <div className="font-bold text-slate-900 mt-1">( {report.directorName || 'นายผู้อำนวยการ เกียรติภูมิสูง'} )</div>
                      <div className="text-slate-600 text-[14px]">ตำแหน่ง ผู้อำนวยการโรงเรียน</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Footer Ribbon Strip */}
            <div className="relative z-10 bg-gradient-to-r from-red-800 via-rose-800 to-red-900 text-white py-1.5 px-5 flex items-center justify-between text-[14px] font-bold tracking-tight shadow-md">
              <div className="flex items-center space-x-2">
                <span className="tracking-widest opacity-80">:::::</span>
                <span>{schoolName}</span>
                <span className="opacity-80 font-normal">| {areaOffice}</span>
              </div>
              <span className="text-[13px] font-normal opacity-85">ระบบติดตามแผนปฏิบัติการงบประมาณ</span>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FORMAL GOVERNMENT A4 TEMPLATE (ฟิตพอดี 1 หน้ากระดาษ A4)                 */}
      {/* ========================================================================= */}
      {templateType === 'formal' && (
        <div className="flex justify-center">
          <div 
            className="print-page w-[210mm] h-[282mm] max-h-[285mm] bg-white p-6 sm:p-10 shadow-lg border border-slate-200 print:border-none print:shadow-none print:p-0 text-slate-900 leading-snug flex flex-col justify-between overflow-hidden"
            style={{ 
              boxSizing: 'border-box',
              fontFamily: "'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', sans-serif"
            }}
          >
            <div>
              {/* Header */}
              <div className="text-center space-y-0.5 mb-4 border-b border-slate-900 pb-2">
                <h1 className="text-[22px] font-bold tracking-tight">
                  แบบรายงานผลการดำเนินงานโครงการ / กิจกรรม
                </h1>
                <p className="text-[17px] font-semibold">
                  {schoolName} ตามแผนปฏิบัติการประจำปีงบประมาณ {fiscalYearThai}
                </p>
              </div>

              {/* Section 1 */}
              <div className="space-y-1 mb-3 text-[16px]">
                <h2 className="font-bold underline text-[17px]">
                  ๑. ข้อมูลทั่วไปของโครงการและกิจกรรม
                </h2>
                <div className="space-y-0.5 pl-2 leading-tight">
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
              <div className="space-y-1 mb-3 text-[16px]">
                <h2 className="font-bold underline text-[17px]">
                  ๒. รายละเอียดการดำเนินงานและผลการปฏิบัติงาน
                </h2>
                <div className="space-y-0.5 pl-2 leading-tight">
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
              <div className="space-y-1 mb-3 text-[16px]">
                <h2 className="font-bold underline text-[17px]">
                  ๓. สรุปผลการประเมินตามวัตถุประสงค์
                </h2>
                <table className="w-full text-[15px] border-collapse border border-slate-900">
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
              <div className="space-y-1 mb-3 text-[16px]">
                <h2 className="font-bold underline text-[17px]">
                  ๔. ภาพถ่ายการจัดกิจกรรม (๓ ภาพ)
                </h2>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {(report.images || []).slice(0, 3).map((img, i) => (
                    <div key={i} className="text-center space-y-0.5">
                      <div className="h-20 bg-slate-100 border border-slate-300 rounded overflow-hidden flex items-center justify-center">
                        <img src={img} alt={`ภาพกิจกรรม ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[13px] text-slate-600 font-medium">ภาพที่ {i + 1}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 5: Signatures strictly on same page */}
            <div className="pt-2 border-t border-slate-300 text-[16px] leading-tight space-y-3">
              <div className="flex justify-end pr-4">
                <div className="text-center space-y-0.5 min-w-[220px]">
                  <div>ลงชื่อ........................................................ผู้รายงาน</div>
                  <div>( {report.reporterName || '........................................................'} )</div>
                  <div>ตำแหน่ง {report.reporterPosition || '........................................................'}</div>
                </div>
              </div>

              <div className="text-center space-y-0.5 pt-1">
                <p className="font-semibold text-[15px]">ขอรับรองว่ารายงานดังกล่าวเป็นความจริงทุกประการ</p>
                <div className="pt-1">ลงชื่อ........................................................ผู้อำนวยการโรงเรียน</div>
                <div>( {report.directorName || '........................................................'} )</div>
                <div className="font-bold">ผู้อำนวยการ{schoolName}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
