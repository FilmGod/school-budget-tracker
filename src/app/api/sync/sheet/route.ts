import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Activity, Project } from '@/lib/types';
import {
  GOOGLE_SHEETS_WEBAPP_URL,
  readMasterSheetViaCli,
  readSubSheetExpensesViaCli,
  syncActivityExpensesToSheet
} from '@/lib/sheetSync';

export const dynamic = 'force-dynamic';

function mapDepartment(deptName: string): { id: string; name: string } {
  const clean = deptName || '';
  if (clean.includes('วิชาการ')) return { id: 'academic', name: 'กลุ่มบริหารวิชาการ' };
  if (clean.includes('ทั่วไป')) return { id: 'general', name: 'กลุ่มบริหารทั่วไป' };
  if (clean.includes('บุคคล')) return { id: 'personnel', name: 'กลุ่มบริหารบุคคล' };
  if (clean.includes('งบประมาณ')) return { id: 'budget', name: 'กลุ่มบริหารงบประมาณ' };
  return { id: 'academic', name: 'กลุ่มบริหารวิชาการ' };
}

function mapBudgetType(typeStr: string): string {
  const clean = typeStr || '';
  if (clean.includes('อุดหนุน')) return 'งบอุดหนุน';
  if (clean.includes('พัฒนาผู้เรียน')) return 'งบพัฒนาผู้เรียน';
  if (clean.includes('นวัตกรรม')) return 'งบพื้นที่นวัตกรรม';
  if (clean.includes('รายได้')) return 'งบรายได้สถานศึกษา';
  return 'งบอุดหนุน';
}

export async function GET() {
  return handleSync();
}

export async function POST(req: NextRequest) {
  return handleSync();
}

async function handleSync() {
  try {
    // 1. Try reading master sheet via gsheets CLI first (includes live usedAmount from Col J)
    let sheetActivities: any[] | null = await readMasterSheetViaCli();

    // 2. Also fetch from Google Sheets Web App (or use as primary if CLI not available)
    try {
      const res = await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
        redirect: 'follow'
      });

      if (res.ok) {
        const sheetData = await res.json();
        if (sheetData && Array.isArray(sheetData.activities)) {
          if (!sheetActivities) {
            sheetActivities = sheetData.activities;
          } else {
            // Merge any extra fields (such as expenses if WebApp returns them)
            for (const waItem of sheetData.activities) {
              const match = sheetActivities.find(
                (s) =>
                  (waItem.sheetCode && s.sheetCode === String(waItem.sheetCode).trim()) ||
                  (waItem.name && s.name === String(waItem.name).trim())
              );
              if (match) {
                if (typeof waItem.usedAmount === 'number' && !match.usedAmount) {
                  match.usedAmount = waItem.usedAmount;
                }
                if (Array.isArray(waItem.expenses) && waItem.expenses.length > 0) {
                  match.expenses = waItem.expenses;
                }
              }
            }
          }
        }
      }
    } catch (e) {
      if (!sheetActivities) {
        throw e;
      }
    }

    if (!sheetActivities || !Array.isArray(sheetActivities)) {
      return NextResponse.json(
        { error: 'ไม่สามารถดึงข้อมูลจาก Google Sheets ได้' },
        { status: 502 }
      );
    }

    // 3. Load current database state from Supabase
    const [actRes, projRes] = await Promise.all([
      supabase.from('activities').select('data'),
      supabase.from('projects').select('data')
    ]);

    const currentActivities: Activity[] = (actRes.data || []).map((r: any) => r.data as Activity);
    const currentProjects: Project[] = (projRes.data || []).map((r: any) => r.data as Project);

    let addedCount = 0;
    let updatedCount = 0;
    const projectMap = new Map<string, Project>();
    currentProjects.forEach((p) => projectMap.set(p.name, p));

    const projectsToUpsert: { id: string; data: Project }[] = [];
    const activitiesToUpsert: { id: string; data: Activity }[] = [];
    const pushToSheetPromises: Promise<boolean>[] = [];

    // 4. Process each activity (Two-Way Sync)
    for (const item of sheetActivities) {
      if (!item.name || item.name.trim() === '' || item.name === '-') continue;

      const dept = mapDepartment(item.department);
      const budgetType = mapBudgetType(item.budgetType);
      const allocatedAmount = typeof item.allocatedAmount === 'number' ? item.allocatedAmount : 0;
      const projectName = item.project && item.project.trim() ? item.project.trim() : 'โครงการทั่วไป';
      const cleanSheetCode = (item.sheetCode || '').toString().trim();

      // Ensure project exists
      let project: Project | undefined = projectMap.get(projectName);
      if (!project) {
        const newProjId = `proj_${dept.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const newProj: Project = {
          id: newProjId,
          fiscalYear: '2570',
          departmentId: dept.id,
          departmentName: dept.name,
          name: projectName
        };
        project = newProj;
        projectMap.set(projectName, newProj);
        projectsToUpsert.push({ id: newProj.id, data: newProj });
      }

      const activeProject: Project = project;

      const existing = currentActivities.find(
        (a) =>
          (cleanSheetCode && a.sheetCode && a.sheetCode.trim() === cleanSheetCode) ||
          a.name.trim() === item.name.trim()
      );

      if (existing) {
        let expenses = existing.expenses ? [...existing.expenses] : [];
        let used = existing.usedAmount || 0;
        const sheetUsed = typeof item.usedAmount === 'number' ? item.usedAmount : null;

        // Two-way expense sync logic:
        if (Array.isArray(item.expenses) && item.expenses.length > 0) {
          // Sheet (via WebApp) has expense rows -> pull into Web
          expenses = item.expenses;
          used = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0) - (e.refund || 0), 0);
        } else if (sheetUsed !== null && sheetUsed !== used && cleanSheetCode) {
          // Discrepancy between Web and Google Sheet (CLI fallback for local runtime)
          const cliExpenses = await readSubSheetExpensesViaCli(cleanSheetCode);
          if (cliExpenses !== null) {
            const cliUsed = cliExpenses.reduce((s, e) => s + (e.amount || 0) - (e.refund || 0), 0);
            if (cliExpenses.length > 0 && (expenses.length === 0 || cliUsed === sheetUsed)) {
              expenses = cliExpenses;
              used = cliUsed;
            } else if (expenses.length > 0 && cliExpenses.length === 0) {
              pushToSheetPromises.push(syncActivityExpensesToSheet(existing));
            }
          } else if (expenses.length > 0 && sheetUsed === 0) {
            pushToSheetPromises.push(syncActivityExpensesToSheet(existing));
          }
        } else if (expenses.length > 0 && cleanSheetCode && (sheetUsed === null || sheetUsed === 0)) {
          // Web has expenses that are not yet reflected in Google Sheet -> push to Sheet
          pushToSheetPromises.push(syncActivityExpensesToSheet(existing));
        }

        const remaining = Math.max(0, allocatedAmount - used);
        const status: 'approved' | 'completed' | 'in_progress' | 'pending' =
          remaining <= 0 && allocatedAmount > 0 ? 'completed' : used > 0 ? 'in_progress' : 'approved';

        const updatedActivity: Activity = {
          ...existing,
          name: item.name.trim(),
          sheetCode: cleanSheetCode || existing.sheetCode,
          seq: item.seq ? String(item.seq) : existing.seq,
          projectId: activeProject.id,
          projectName: activeProject.name,
          departmentId: dept.id,
          departmentName: dept.name,
          budgetType: budgetType,
          allocatedAmount: allocatedAmount,
          usedAmount: used,
          remainingAmount: remaining,
          status: status,
          responsiblePerson: item.responsible || existing.responsiblePerson || '',
          expenses
        };

        activitiesToUpsert.push({ id: updatedActivity.id, data: updatedActivity });
        updatedCount++;
      } else {
        let expenses = Array.isArray(item.expenses) ? item.expenses : [];
        let used = typeof item.usedAmount === 'number' ? item.usedAmount : 0;

        if (used > 0 && expenses.length === 0 && cleanSheetCode) {
          const cliExpenses = await readSubSheetExpensesViaCli(cleanSheetCode);
          if (cliExpenses && cliExpenses.length > 0) {
            expenses = cliExpenses;
            used = expenses.reduce((s: number, e: any) => s + (e.amount || 0) - (e.refund || 0), 0);
          }
        }

        const remaining = Math.max(0, allocatedAmount - used);
        const status: 'approved' | 'completed' | 'in_progress' | 'pending' =
          remaining <= 0 && allocatedAmount > 0 ? 'completed' : used > 0 ? 'in_progress' : 'approved';

        const newActId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newActivity: Activity = {
          id: newActId,
          fiscalYear: '2570',
          projectId: activeProject.id,
          projectName: activeProject.name,
          departmentId: dept.id,
          departmentName: dept.name,
          name: item.name.trim(),
          sheetCode: cleanSheetCode,
          seq: item.seq ? String(item.seq) : String(currentActivities.length + addedCount + 1),
          budgetType: budgetType,
          allocatedAmount: allocatedAmount,
          usedAmount: used,
          remainingAmount: remaining,
          status: status,
          responsiblePerson: item.responsible || '',
          expenses
        };

        activitiesToUpsert.push({ id: newActivity.id, data: newActivity });
        addedCount++;
      }
    }

    // Batch upsert to Supabase & await sheet pushes in parallel
    if (projectsToUpsert.length > 0) {
      await supabase.from('projects').upsert(projectsToUpsert);
    }
    if (activitiesToUpsert.length > 0) {
      await supabase.from('activities').upsert(activitiesToUpsert);
    }
    if (pushToSheetPromises.length > 0) {
      await Promise.allSettled(pushToSheetPromises);
    }

    return NextResponse.json({
      success: true,
      message: `ซิงค์ข้อมูลสองทางกับ Google Sheets สำเร็จ (อัปเดต ${updatedCount} รายการ, เพิ่มใหม่ ${addedCount} รายการ)`,
      totalInSheet: sheetActivities.length,
      updatedCount,
      addedCount,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error in /api/sync/sheet:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to sync with Google Sheets' },
      { status: 500 }
    );
  }
}
