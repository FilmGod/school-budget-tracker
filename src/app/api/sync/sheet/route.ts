import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Activity, Project } from '@/lib/types';

export const dynamic = 'force-dynamic';

const GOOGLE_SHEETS_WEBAPP_URL = 
  process.env.GOOGLE_SHEETS_WEBAPP_URL || 
  'https://script.google.com/macros/s/AKfycbxW9TOBSNRG4Mh_6dT79LVWr1qCYIkpHx5tSYyR0hSgZfj-W2k_mkOpCa9_Pq5bKkxY/exec';

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
    // 1. Fetch raw activities from Google Sheets Web App
    const res = await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
      redirect: 'follow'
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Google Sheets responded with status ${res.status}` },
        { status: 502 }
      );
    }

    const sheetData = await res.json();
    if (!sheetData || !sheetData.activities || !Array.isArray(sheetData.activities)) {
      return NextResponse.json(
        { error: 'Invalid data format from Google Sheets Web App' },
        { status: 502 }
      );
    }

    const sheetActivities = sheetData.activities;

    // 2. Load current database state from Supabase
    const [actRes, projRes] = await Promise.all([
      supabase.from('activities').select('data'),
      supabase.from('projects').select('data')
    ]);

    const currentActivities: Activity[] = (actRes.data || []).map((r: any) => r.data as Activity);
    const currentProjects: Project[] = (projRes.data || []).map((r: any) => r.data as Project);

    let addedCount = 0;
    let updatedCount = 0;
    const projectMap = new Map<string, Project>();
    currentProjects.forEach(p => projectMap.set(p.name, p));

    // 3. Process each activity from Google Sheets
    for (const item of sheetActivities) {
      if (!item.name || item.name.trim() === '' || item.name === '-') continue;

      const dept = mapDepartment(item.department);
      const budgetType = mapBudgetType(item.budgetType);
      const allocatedAmount = typeof item.allocatedAmount === 'number' ? item.allocatedAmount : 0;
      const projectName = item.project && item.project.trim() ? item.project.trim() : 'โครงการทั่วไป';

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
        await supabase.from('projects').upsert({ id: newProj.id, data: newProj });
      }

      const activeProject: Project = project;

      // Check if activity already exists in database (by sheetCode or by exact name)
      const existing = currentActivities.find(a => 
        (item.sheetCode && a.sheetCode && a.sheetCode.trim() === item.sheetCode.trim()) ||
        a.name.trim() === item.name.trim()
      );

      if (existing) {
        // Update existing activity, preserving transactions & expenses
        const used = existing.usedAmount || 0;
        const remaining = Math.max(0, allocatedAmount - used);
        const status: 'approved' | 'completed' | 'in_progress' | 'pending' = 
          remaining <= 0 && allocatedAmount > 0 ? 'completed' : used > 0 ? 'in_progress' : 'approved';

        const updatedActivity: Activity = {
          ...existing,
          name: item.name.trim(),
          sheetCode: item.sheetCode || existing.sheetCode,
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
          responsiblePerson: item.responsible || existing.responsiblePerson || ''
        };

        await supabase.from('activities').upsert({ id: updatedActivity.id, data: updatedActivity });
        updatedCount++;
      } else {
        // Create new activity added from Google Sheets
        const newActId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newActivity: Activity = {
          id: newActId,
          fiscalYear: '2570',
          projectId: activeProject.id,
          projectName: activeProject.name,
          departmentId: dept.id,
          departmentName: dept.name,
          name: item.name.trim(),
          sheetCode: item.sheetCode || '',
          seq: item.seq ? String(item.seq) : String(currentActivities.length + addedCount + 1),
          budgetType: budgetType,
          allocatedAmount: allocatedAmount,
          usedAmount: 0,
          remainingAmount: allocatedAmount,
          status: 'approved',
          responsiblePerson: item.responsible || '',
          expenses: []
        };

        await supabase.from('activities').upsert({ id: newActivity.id, data: newActivity });
        addedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `ซิงค์ข้อมูลจาก Google Sheets สำเร็จ`,
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
