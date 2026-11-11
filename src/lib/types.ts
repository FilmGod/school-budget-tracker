export type BudgetType = 'งบพื้นที่นวัตกรรม' | 'งบอุดหนุน' | 'งบพัฒนาผู้เรียน' | 'งบรายได้สถานศึกษา' | 'อื่นๆ';

export interface ExpenseItem {
  id: string;
  index: number | string;
  date: string;
  description: string;
  amount: number;
  refund: number;
  note?: string;
}

export interface Activity {
  id: string;
  fiscalYear: string;
  departmentId: string;
  departmentName: string;
  projectId: string;
  projectName: string;
  sheetCode?: string;
  seq?: string;
  name: string;
  responsiblePerson: string;
  budgetType: string;
  allocatedAmount: number;
  usedAmount: number;
  remainingAmount: number;
  status: 'approved' | 'completed' | 'in_progress' | 'pending';
  approvedDate?: string;
  note?: string;
  expenses: ExpenseItem[];
  gdriveUrl?: string;
}

export interface Project {
  id: string;
  fiscalYear: string;
  departmentId: string;
  departmentName: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface EvaluationItem {
  objective: string;
  isAchieved: boolean;
}

export interface ActivityReport {
  id: string;
  fiscalYear: string;
  activityId: string;
  projectName: string;
  activityName: string;
  allocatedBudget: number;
  budgetSource: string;
  actualUsedBudget: number;
  responsiblePerson: string;
  periodStart: string;
  periodEnd: string;
  objectives: string[];
  quantitativeTarget: string;
  qualitativeTarget: string;
  performanceResult: string;
  problemsObstacles: string;
  evaluations: EvaluationItem[];
  images: string[];
  reporterName: string;
  reporterPosition: string;
  directorName: string;
  createdAt: string;
}

export interface ProjectDocument {
  id: string;
  fiscalYear: string;
  departmentId: string;
  title: string;
  docType: 'plan_book' | 'folder' | 'activity_pdf' | 'other';
  gdriveUrl: string;
  updatedAt: string;
}

export interface FiscalYear {
  id: string;
  name: string;
  schoolName: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface DatabaseSchema {
  fiscalYears: FiscalYear[];
  departments: Department[];
  projects: Project[];
  activities: Activity[];
  reports: ActivityReport[];
  documents: ProjectDocument[];
}
