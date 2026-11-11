import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import initialData from '@/data/initialData.json';
import { DatabaseSchema, Activity, ActivityReport, FiscalYear, Project, ProjectDocument } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const localDbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

function getLocalDB(): DatabaseSchema {
  try {
    if (fs.existsSync(localDbPath)) {
      return JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
    }
  } catch (e) {
    // Ignore in read-only / serverless environment
  }
  return initialData as DatabaseSchema;
}

function saveLocalDB(data: DatabaseSchema) {
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // Expected in Vercel serverless environment
  }
}

export async function GET() {
  try {
    const [fyRes, deptRes, projRes, actRes, repRes, docRes] = await Promise.all([
      supabase.from('fiscal_years').select('data').order('id'),
      supabase.from('departments').select('data'),
      supabase.from('projects').select('data'),
      supabase.from('activities').select('data'),
      supabase.from('reports').select('data'),
      supabase.from('documents').select('data')
    ]);

    // If Supabase returned data, format it
    if (actRes.data && actRes.data.length > 0) {
      const db: DatabaseSchema = {
        fiscalYears: (fyRes.data || []).map((r: any) => r.data as FiscalYear),
        departments: (deptRes.data || []).map((r: any) => r.data),
        projects: (projRes.data || []).map((r: any) => r.data as Project),
        activities: (actRes.data || []).map((r: any) => r.data as Activity),
        reports: (repRes.data || []).map((r: any) => r.data as ActivityReport),
        documents: (docRes.data || []).map((r: any) => r.data as ProjectDocument)
      };

      // Also keep departments if empty
      if (db.departments.length === 0) {
        db.departments = initialData.departments as any;
      }
      return NextResponse.json(db);
    }
  } catch (err) {
    console.error('Error querying Supabase in GET /api/data:', err);
  }

  // Fallback to local
  return NextResponse.json(getLocalDB());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      case 'SET_FULL_DB': {
        saveLocalDB(payload);
        return NextResponse.json({ success: true, data: payload });
      }

      case 'ADD_FISCAL_YEAR': {
        await supabase.from('fiscal_years').upsert({ id: payload.id, data: payload });
        return NextResponse.json({ success: true, data: payload });
      }

      case 'SAVE_ACTIVITY': {
        await supabase.from('activities').upsert({ id: payload.id, data: payload });
        
        // Also sync to local DB fallback
        try {
          const ldb = getLocalDB();
          const existingIdx = ldb.activities.findIndex(a => a.id === payload.id);
          if (existingIdx >= 0) {
            ldb.activities[existingIdx] = payload;
          } else {
            ldb.activities.push(payload);
          }
          saveLocalDB(ldb);
        } catch (e) {
          console.error('Error saving activity to local DB:', e);
        }

        // Forward to Google Sheets Web App if configured
        const webappUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL;
        if (webappUrl) {
          fetch(webappUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'ADD_ACTIVITY', data: payload })
          }).catch(err => console.error('Error forwarding activity to Google Sheets:', err));
        }
        return NextResponse.json({ success: true, data: payload });
      }

      case 'DELETE_ACTIVITY': {
        await supabase.from('activities').delete().eq('id', payload.id);
        try {
          const ldb = getLocalDB();
          ldb.activities = ldb.activities.filter(a => a.id !== payload.id);
          saveLocalDB(ldb);
        } catch (e) {
          console.error('Error deleting activity from local DB:', e);
        }
        return NextResponse.json({ success: true, data: { id: payload.id } });
      }

      case 'ADD_PROJECT': {
        await supabase.from('projects').upsert({ id: payload.id, data: payload });
        try {
          const ldb = getLocalDB();
          const existingIdx = (ldb.projects || []).findIndex(p => p.id === payload.id);
          if (existingIdx >= 0) {
            ldb.projects[existingIdx] = payload;
          } else {
            if (!ldb.projects) ldb.projects = [];
            ldb.projects.push(payload);
          }
          saveLocalDB(ldb);
        } catch (e) {
          console.error('Error saving project to local DB:', e);
        }
        return NextResponse.json({ success: true, data: payload });
      }

      case 'DELETE_PROJECT': {
        await supabase.from('projects').delete().eq('id', payload.id);
        try {
          const ldb = getLocalDB();
          ldb.projects = (ldb.projects || []).filter(p => p.id !== payload.id);
          saveLocalDB(ldb);
        } catch (e) {
          console.error('Error deleting project from local DB:', e);
        }
        return NextResponse.json({ success: true, data: { id: payload.id } });
      }

      case 'RECORD_EXPENSE': {
        const { activityId, expense } = payload;
        // Fetch current activity from Supabase
        const { data: actRow } = await supabase.from('activities').select('data').eq('id', activityId).single();
        let act: Activity | null = actRow ? actRow.data : null;

        if (act) {
          if (!act.expenses) act.expenses = [];
          act.expenses.push(expense);
          act.usedAmount = act.expenses.reduce((sum, e) => sum + (e.amount || 0) - (e.refund || 0), 0);
          act.remainingAmount = act.allocatedAmount - act.usedAmount;
          act.status = act.remainingAmount <= 0 ? 'completed' : 'in_progress';

          await supabase.from('activities').upsert({ id: act.id, data: act });
          return NextResponse.json({ success: true, data: act });
        }
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
      }

      case 'SAVE_REPORT': {
        const { error } = await supabase.from('reports').upsert({ id: payload.id, data: payload });
        if (error) {
          console.error('Supabase SAVE_REPORT error:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, data: payload });
      }

      case 'DELETE_REPORT': {
        const { error } = await supabase.from('reports').delete().eq('id', payload.id);
        if (error) {
          console.error('Supabase DELETE_REPORT error:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, data: { id: payload.id } });
      }

      case 'SAVE_DOCUMENT': {
        await supabase.from('documents').upsert({ id: payload.id, data: payload });
        return NextResponse.json({ success: true, data: payload });
      }

      case 'DELETE_DOCUMENT': {
        await supabase.from('documents').delete().eq('id', payload.id);
        return NextResponse.json({ success: true, data: { id: payload.id } });
      }

      case 'RESET_DB': {
        // Re-seed all initial data to Supabase
        for (const fy of initialData.fiscalYears || []) {
          await supabase.from('fiscal_years').upsert({ id: fy.id, data: fy });
        }
        for (const d of initialData.departments || []) {
          await supabase.from('departments').upsert({ id: d.id, data: d });
        }
        for (const p of initialData.projects || []) {
          await supabase.from('projects').upsert({ id: p.id, data: p });
        }
        for (const a of initialData.activities || []) {
          await supabase.from('activities').upsert({ id: a.id, data: a });
        }
        for (const r of initialData.reports || []) {
          await supabase.from('reports').upsert({ id: r.id, data: r });
        }
        for (const doc of ((initialData as DatabaseSchema).documents || [])) {
          await supabase.from('documents').upsert({ id: doc.id, data: doc });
        }
        return NextResponse.json({ success: true, data: initialData });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
