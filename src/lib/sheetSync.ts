import os from 'os';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { Activity, ExpenseItem } from './types';

const execFileAsync = promisify(execFile);

export const SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_ID || '1RHyp3kMPISBBUA31TaOOeWhE_MG0ziaC7OmbqXDGSkI';

export const GOOGLE_SHEETS_WEBAPP_URL =
  process.env.GOOGLE_SHEETS_WEBAPP_URL ||
  'https://script.google.com/macros/s/AKfycbxW9TOBSNRG4Mh_6dT79LVWr1qCYIkpHx5tSYyR0hSgZfj-W2k_mkOpCa9_Pq5bKkxY/exec';

function parseNum(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/,/g, '').trim();
  if (cleaned === '-' || cleaned === '') return 0;
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

/**
 * Push a single activity's expenses to its corresponding sub-sheet (`001`..`065`, range `B6:F37`)
 * via both Google Apps Script Web App (`SYNC_EXPENSES`) and `gsheets` CLI when available.
 */
export async function syncActivityExpensesToSheet(act: Activity): Promise<boolean> {
  const sheetCode = (act.sheetCode || '').trim();
  const expenses = act.expenses || [];

  // 1. Always fire POST to Google Apps Script Web App
  if (GOOGLE_SHEETS_WEBAPP_URL) {
    fetch(GOOGLE_SHEETS_WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SYNC_EXPENSES',
        sheetCode,
        activityId: act.id,
        activityName: act.name,
        expenses
      })
    }).catch((err) => {
      console.error('Error pushing expenses to Google Sheets WebApp:', err);
    });
  }

  // 2. If sheetCode exists, also write directly via `gsheets mutate batch` if CLI is available
  if (!sheetCode) return false;

  try {
    // Build 32 rows for B6:F37 (Date, Description, Amount, Refund, Note)
    const rows: (string | number)[][] = [];
    for (let i = 0; i < 32; i++) {
      const exp = expenses[i];
      if (exp) {
        rows.push([
          exp.date || '',
          exp.description || '',
          exp.amount || 0,
          exp.refund && exp.refund > 0 ? exp.refund : '',
          exp.note || ''
        ]);
      } else {
        rows.push(['', '', '', '', '']);
      }
    }

    const batchPayload = [
      {
        op: 'write',
        range: `${sheetCode}!B6:F37`,
        data: rows
      }
    ];

    const tmpFile = path.join(os.tmpdir(), `bwr_sync_${sheetCode}_${Date.now()}.json`);
    fs.writeFileSync(tmpFile, JSON.stringify(batchPayload, null, 2), 'utf-8');

    try {
      await execFileAsync('gsheets', ['mutate', 'batch', SPREADSHEET_ID, '-f', tmpFile], {
        timeout: 15000
      });
      return true;
    } finally {
      try {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      } catch {}
    }
  } catch (err) {
    // Ignore if gsheets CLI is not available (e.g. on Vercel Serverless)
    return false;
  }
}

export interface SheetSyncRow {
  seq: string;
  department: string;
  project: string;
  sheetCode: string;
  name: string;
  responsible: string;
  budgetType: string;
  allocatedAmount: number;
  usedAmount: number;
  expenses?: ExpenseItem[];
}

/**
 * Reads sub-sheet expenses (`B6:F37`) for a specific sheetCode using `gsheets readonly read`.
 */
export async function readSubSheetExpensesViaCli(sheetCode: string): Promise<ExpenseItem[] | null> {
  const cleanCode = sheetCode.trim();
  if (!cleanCode) return null;

  try {
    const { stdout } = await execFileAsync(
      'gsheets',
      ['readonly', 'read', SPREADSHEET_ID, `${cleanCode}!A6:F37`, '--json'],
      { timeout: 12000 }
    );
    const rows = JSON.parse(stdout);
    if (!Array.isArray(rows)) return [];

    const expenses: ExpenseItem[] = [];
    rows.forEach((r: any[], idx: number) => {
      const date = (r[1] || '').toString().trim();
      const description = (r[2] || '').toString().trim();
      const amount = parseNum(r[3]);
      const refund = parseNum(r[4]);
      const note = (r[5] || '').toString().trim();

      if (description || amount > 0 || refund > 0) {
        expenses.push({
          id: `exp_${cleanCode}_${idx + 1}`,
          index: idx + 1,
          date: date || '-',
          description: description || 'รายการเบิกจ่ายงบประมาณ',
          amount,
          refund,
          note
        });
      }
    });
    return expenses;
  } catch {
    return null;
  }
}

/**
 * Reads master sheet (`โครงการ-กิจกรรม!A4:K62`) directly via `gsheets readonly read` if available,
 * including live `usedAmount` from column J.
 */
export async function readMasterSheetViaCli(): Promise<SheetSyncRow[] | null> {
  try {
    const { stdout } = await execFileAsync(
      'gsheets',
      ['readonly', 'read', SPREADSHEET_ID, 'โครงการ-กิจกรรม!A4:K62', '--json'],
      { timeout: 15000 }
    );
    const rows = JSON.parse(stdout);
    if (!Array.isArray(rows)) return null;

    let currentDept = 'กลุ่มบริหารวิชาการ';
    let currentProj = 'โครงการทั่วไป';
    const result: SheetSyncRow[] = [];

    for (const r of rows) {
      const seq = (r[0] || '').toString().trim();
      const deptCell = (r[1] || '').toString().trim();
      const projCell = (r[2] || '').toString().trim();
      const sheetCode = (r[3] || '').toString().trim();
      const name = (r[5] || '').toString().trim();
      const responsible = (r[6] || '').toString().trim();
      const budgetType = (r[7] || '').toString().trim();
      const allocatedAmount = parseNum(r[8]);
      const usedAmount = parseNum(r[9]);

      if (deptCell) currentDept = deptCell;
      if (projCell) currentProj = projCell;

      if (!name || name === '-') continue;

      result.push({
        seq,
        department: currentDept,
        project: currentProj,
        sheetCode,
        name,
        responsible,
        budgetType,
        allocatedAmount,
        usedAmount
      });
    }

    return result;
  } catch {
    return null;
  }
}
