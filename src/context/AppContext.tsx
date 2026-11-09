'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatabaseSchema, Activity, Project, ActivityReport, ProjectDocument, FiscalYear, ExpenseItem } from '@/lib/types';
import initialData from '@/data/initialData.json';

interface AppContextType {
  db: DatabaseSchema;
  isLoading: boolean;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  currentYear: string;
  setCurrentYear: (year: string) => void;
  filteredActivities: Activity[];
  filteredProjects: Project[];
  filteredReports: ActivityReport[];
  filteredDocuments: ProjectDocument[];
  addFiscalYear: (year: string) => Promise<void>;
  saveActivity: (activity: Activity) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  recordExpense: (activityId: string, expense: ExpenseItem) => Promise<void>;
  saveReport: (report: ActivityReport) => Promise<void>;
  saveDocument: (doc: ProjectDocument) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DatabaseSchema>(initialData as DatabaseSchema);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentYear, setCurrentYear] = useState<string>('2570');
  const [isAdmin, setIsAdminState] = useState<boolean>(false);

  useEffect(() => {
    // Check localStorage for admin mode
    const storedAdmin = localStorage.getItem('school_budget_is_admin');
    if (storedAdmin === 'true') {
      setIsAdminState(true);
    }
    const storedYear = localStorage.getItem('school_budget_year');
    if (storedYear) {
      setCurrentYear(storedYear);
    }
    fetchData();
  }, []);

  const setIsAdmin = (val: boolean) => {
    setIsAdminState(val);
    localStorage.setItem('school_budget_is_admin', val ? 'true' : 'false');
  };

  const handleSetCurrentYear = (year: string) => {
    setCurrentYear(year);
    localStorage.setItem('school_budget_year', year);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setDb(data);
      }
    } catch (e) {
      console.error('Failed to fetch data, using local initial data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const addFiscalYear = async (year: string) => {
    const newYearObj: FiscalYear = {
      id: year,
      name: `ปีงบประมาณ ${year}`,
      schoolName: db.fiscalYears[0]?.schoolName || 'โรงเรียนตามแผนปฏิบัติการประจำปี',
      createdAt: new Date().toISOString()
    };
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADD_FISCAL_YEAR', payload: newYearObj })
      });
      if (res.ok) {
        await fetchData();
        handleSetCurrentYear(year);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveActivity = async (activity: Activity) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_ACTIVITY', payload: activity })
      });
      if (res.ok) await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_ACTIVITY', payload: { id } })
      });
      if (res.ok) await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const addProject = async (project: Project) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADD_PROJECT', payload: project })
      });
      if (res.ok) await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const recordExpense = async (activityId: string, expense: ExpenseItem) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RECORD_EXPENSE', payload: { activityId, expense } })
      });
      if (res.ok) await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const saveReport = async (report: ActivityReport) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_REPORT', payload: report })
      });
      if (res.ok) await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const saveDocument = async (doc: ProjectDocument) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_DOCUMENT', payload: doc })
      });
      if (res.ok) await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_DOCUMENT', payload: { id } })
      });
      if (res.ok) await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const resetDatabase = async () => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_DB', payload: {} })
      });
      if (res.ok) await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredActivities = (db.activities || []).filter(a => a.fiscalYear === currentYear);
  const filteredProjects = (db.projects || []).filter(p => p.fiscalYear === currentYear);
  const filteredReports = (db.reports || []).filter(r => r.fiscalYear === currentYear);
  const filteredDocuments = (db.documents || []).filter(d => d.fiscalYear === currentYear);

  return (
    <AppContext.Provider
      value={{
        db,
        isLoading,
        isAdmin,
        setIsAdmin,
        currentYear,
        setCurrentYear: handleSetCurrentYear,
        filteredActivities,
        filteredProjects,
        filteredReports,
        filteredDocuments,
        addFiscalYear,
        saveActivity,
        deleteActivity,
        addProject,
        recordExpense,
        saveReport,
        saveDocument,
        deleteDocument,
        resetDatabase,
        refreshData: fetchData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
