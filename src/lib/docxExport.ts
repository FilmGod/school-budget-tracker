import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { ActivityReport } from './types';

// Helper to convert base64 or fetch image URL to Uint8Array
async function getImageBuffer(url: string): Promise<Uint8Array | null> {
  try {
    if (url.startsWith('data:image')) {
      const base64Data = url.split(',')[1];
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } else {
      const res = await fetch(url);
      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }
  } catch (e) {
    console.error('Failed to convert image for docx:', e);
    return null;
  }
}

export async function exportReportToDocx(report: ActivityReport) {
  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: '888888' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '888888' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '888888' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '888888' },
  };

  // Process Images
  const imageRuns: Paragraph[] = [];
  if (report.images && report.images.length > 0) {
    for (let i = 0; i < Math.min(3, report.images.length); i++) {
      const imgBuffer = await getImageBuffer(report.images[i]);
      if (imgBuffer) {
        imageRuns.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new ImageRun({
                data: imgBuffer,
                type: 'jpg',
                transformation: {
                  width: 450,
                  height: 280,
                },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `ภาพที่ ${i + 1}: ภาพการดำเนินกิจกรรม ${report.activityName}`,
                font: 'TH Sarabun PSK',
                size: 28,
                italics: true,
              }),
            ],
          })
        );
      }
    }
  }

  // Evaluation rows for table
  const evalRows = (report.evaluations || []).map((ev, index) => {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `${index + 1}`, font: 'TH Sarabun PSK', size: 28 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 60, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          children: [
            new Paragraph({
              children: [new TextRun({ text: ev.objective, font: 'TH Sarabun PSK', size: 28 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: ev.isAchieved ? '✓ บรรลุ' : '-', font: 'TH Sarabun PSK', size: 28, bold: ev.isAchieved })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          borders: tableBorder,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: !ev.isAchieved ? '✓ ไม่บรรลุ' : '-', font: 'TH Sarabun PSK', size: 28, bold: !ev.isAchieved })],
            }),
          ],
        }),
      ],
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'แบบรายงานผลการดำเนินงานโครงการ / กิจกรรม',
                font: 'TH Sarabun PSK',
                size: 36,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `ตามแผนปฏิบัติการประจำปีงบประมาณ ${report.fiscalYear || '2570'}`,
                font: 'TH Sarabun PSK',
                size: 32,
                bold: true,
              }),
            ],
          }),

          // Part 1
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({
                text: '๑. ส่วนหัวข้อมูลโครงการและกิจกรรม',
                font: 'TH Sarabun PSK',
                size: 32,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'ชื่อโครงการ: ', font: 'TH Sarabun PSK', size: 30, bold: true }),
              new TextRun({ text: report.projectName || '-', font: 'TH Sarabun PSK', size: 30 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'ชื่อกิจกรรม: ', font: 'TH Sarabun PSK', size: 30, bold: true }),
              new TextRun({ text: report.activityName || '-', font: 'TH Sarabun PSK', size: 30 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'แหล่งงบประมาณ: ', font: 'TH Sarabun PSK', size: 30, bold: true }),
              new TextRun({ text: `${report.budgetSource || '-'}  |  `, font: 'TH Sarabun PSK', size: 30 }),
              new TextRun({ text: 'งบประมาณที่ได้รับจัดสรร: ', font: 'TH Sarabun PSK', size: 30, bold: true }),
              new TextRun({ text: `${(report.allocatedBudget || 0).toLocaleString()} บาท`, font: 'TH Sarabun PSK', size: 30 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'งบประมาณที่ใช้จริง: ', font: 'TH Sarabun PSK', size: 30, bold: true }),
              new TextRun({ text: `${(report.actualUsedBudget || 0).toLocaleString()} บาท  |  `, font: 'TH Sarabun PSK', size: 30 }),
              new TextRun({ text: 'งบประมาณคงเหลือ: ', font: 'TH Sarabun PSK', size: 30, bold: true }),
              new TextRun({ text: `${((report.allocatedBudget || 0) - (report.actualUsedBudget || 0)).toLocaleString()} บาท`, font: 'TH Sarabun PSK', size: 30 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: 'ผู้รับผิดชอบโครงการ: ', font: 'TH Sarabun PSK', size: 30, bold: true }),
              new TextRun({ text: `${report.responsiblePerson || '-'}  |  `, font: 'TH Sarabun PSK', size: 30 }),
              new TextRun({ text: 'ระยะเวลาดำเนินการ: ', font: 'TH Sarabun PSK', size: 30, bold: true }),
              new TextRun({ text: `${report.periodStart || ''} ถึง ${report.periodEnd || ''}`, font: 'TH Sarabun PSK', size: 30 }),
            ],
          }),

          // Part 2
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({
                text: '๒. รายละเอียดการดำเนินงานและผลลัพธ์',
                font: 'TH Sarabun PSK',
                size: 32,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'วัตถุประสงค์โครงการ:', font: 'TH Sarabun PSK', size: 30, bold: true }),
            ],
          }),
          ...(report.objectives || []).map((obj, i) =>
            new Paragraph({
              indent: { left: 720 },
              spacing: { after: 40 },
              children: [
                new TextRun({ text: `${i + 1}. ${obj}`, font: 'TH Sarabun PSK', size: 28 }),
              ],
            })
          ),
          new Paragraph({
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({ text: 'เป้าหมายเชิงปริมาณ: ', font: 'TH Sarabun PSK', size: 30, bold: true }),
              new TextRun({ text: report.quantitativeTarget || '-', font: 'TH Sarabun PSK', size: 30 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'เป้าหมายเชิงคุณภาพ: ', font: 'TH Sarabun PSK', size: 30, bold: true }),
              new TextRun({ text: report.qualitativeTarget || '-', font: 'TH Sarabun PSK', size: 30 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'ผลการดำเนินงาน: ', font: 'TH Sarabun PSK', size: 30, bold: true }),
              new TextRun({ text: report.performanceResult || '-', font: 'TH Sarabun PSK', size: 30 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: 'ปัญหาและอุปสรรค / ข้อเสนอแนะ: ', font: 'TH Sarabun PSK', size: 30, bold: true }),
              new TextRun({ text: report.problemsObstacles || '-', font: 'TH Sarabun PSK', size: 30 }),
            ],
          }),

          // Part 3: Evaluation Table
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({
                text: '๓. สรุปผลการประเมินตามวัตถุประสงค์',
                font: 'TH Sarabun PSK',
                size: 32,
                bold: true,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 10, type: WidthType.PERCENTAGE },
                    borders: tableBorder,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'ที่', font: 'TH Sarabun PSK', size: 28, bold: true })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    borders: tableBorder,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'วัตถุประสงค์', font: 'TH Sarabun PSK', size: 28, bold: true })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    borders: tableBorder,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'บรรลุ', font: 'TH Sarabun PSK', size: 28, bold: true })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    borders: tableBorder,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'ไม่บรรลุ', font: 'TH Sarabun PSK', size: 28, bold: true })],
                      }),
                    ],
                  }),
                ],
              }),
              ...evalRows,
            ],
          }),

          // Part 4: Images
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 120 },
            children: [
              new TextRun({
                text: '๔. ภาพถ่ายกิจกรรม (๓ ภาพ)',
                font: 'TH Sarabun PSK',
                size: 32,
                bold: true,
              }),
            ],
          }),
          ...imageRuns,

          // Part 5: Signatures
          new Paragraph({
            spacing: { before: 400, after: 100 },
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: 'ลงชื่อ........................................................ผู้รายงาน\n', font: 'TH Sarabun PSK', size: 30 }),
              new TextRun({ text: `( ${report.reporterName || '........................................................'} )\n`, font: 'TH Sarabun PSK', size: 30 }),
              new TextRun({ text: `ตำแหน่ง ${report.reporterPosition || '........................................................'}`, font: 'TH Sarabun PSK', size: 30 }),
            ],
          }),
          new Paragraph({
            spacing: { before: 300, after: 100 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'ขอรับรองว่ารายงานดังกล่าวเป็นความจริงทุกประการ\n\n', font: 'TH Sarabun PSK', size: 30 }),
              new TextRun({ text: 'ลงชื่อ........................................................ผู้อำนวยการโรงเรียน\n', font: 'TH Sarabun PSK', size: 30 }),
              new TextRun({ text: `( ${report.directorName || '........................................................'} )\n`, font: 'TH Sarabun PSK', size: 30 }),
              new TextRun({ text: 'ผู้อำนวยการโรงเรียน', font: 'TH Sarabun PSK', size: 30, bold: true }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await (await import('docx')).Packer.toBlob(doc);
  saveAs(blob, `รายงานกิจกรรม_${report.activityName || 'รายงาน'}.docx`);
}
