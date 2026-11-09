import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import initialData from '@/data/initialData.json';
import { DatabaseSchema } from '@/lib/types';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'db.json');

function getDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData as DatabaseSchema;
    }
    const raw = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading db.json:', error);
    return initialData as DatabaseSchema;
  }
}

function saveDB(data: DatabaseSchema): boolean {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to db.json:', error);
    return false;
  }
}

export async function GET() {
  const db = getDB();
  return NextResponse.json(db);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const db = getDB();

    switch (action) {
      case 'SET_FULL_DB': {
        saveDB(payload);
        return NextResponse.json({ success: true, data: payload });
      }

      case 'ADD_FISCAL_YEAR': {
        const exists = db.fiscalYears.some(f => f.id === payload.id);
        if (!exists) {
          db.fiscalYears.push(payload);
          saveDB(db);
        }
        return NextResponse.json({ success: true, data: db.fiscalYears });
      }

      case 'SAVE_ACTIVITY': {
        const index = db.activities.findIndex(a => a.id === payload.id);
        if (index >= 0) {
          db.activities[index] = { ...db.activities[index], ...payload };
        } else {
          db.activities.push(payload);
        }
        saveDB(db);
        return NextResponse.json({ success: true, data: db.activities });
      }

      case 'DELETE_ACTIVITY': {
        db.activities = db.activities.filter(a => a.id !== payload.id);
        saveDB(db);
        return NextResponse.json({ success: true, data: db.activities });
      }

      case 'ADD_PROJECT': {
        const exists = db.projects.some(p => p.id === payload.id);
        if (!exists) {
          db.projects.push(payload);
          saveDB(db);
        }
        return NextResponse.json({ success: true, data: db.projects });
      }

      case 'RECORD_EXPENSE': {
        const { activityId, expense } = payload;
        const act = db.activities.find(a => a.id === activityId);
        if (act) {
          if (!act.expenses) act.expenses = [];
          act.expenses.push(expense);
          act.usedAmount = act.expenses.reduce((sum, e) => sum + (e.amount || 0) - (e.refund || 0), 0);
          act.remainingAmount = act.allocatedAmount - act.usedAmount;
          act.status = act.remainingAmount <= 0 ? 'completed' : 'in_progress';
          saveDB(db);
        }
        return NextResponse.json({ success: true, data: act });
      }

      case 'SAVE_REPORT': {
        const index = db.reports.findIndex(r => r.id === payload.id);
        if (index >= 0) {
          db.reports[index] = { ...db.reports[index], ...payload };
        } else {
          db.reports.push(payload);
        }
        saveDB(db);
        return NextResponse.json({ success: true, data: db.reports });
      }

      case 'SAVE_DOCUMENT': {
        const index = db.documents.findIndex(d => d.id === payload.id);
        if (index >= 0) {
          db.documents[index] = { ...db.documents[index], ...payload };
        } else {
          db.documents.push(payload);
        }
        saveDB(db);
        return NextResponse.json({ success: true, data: db.documents });
      }

      case 'DELETE_DOCUMENT': {
        db.documents = db.documents.filter(d => d.id !== payload.id);
        saveDB(db);
        return NextResponse.json({ success: true, data: db.documents });
      }

      case 'RESET_DB': {
        saveDB(initialData as DatabaseSchema);
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
