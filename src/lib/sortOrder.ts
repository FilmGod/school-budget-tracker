import initialData from '@/data/initialData.json';
import { Activity, Project } from './types';

const DEPT_ORDER: Record<string, number> = {
  academic: 1,
  budget: 2,
  personnel: 3,
  general: 4,
  surplus: 5
};

const INITIAL_PROJECT_INDEX = new Map<string, number>();
const INITIAL_PROJECT_NAME_INDEX = new Map<string, number>();
(initialData.projects || []).forEach((p, idx) => {
  INITIAL_PROJECT_INDEX.set(p.id, idx);
  if (p.name) INITIAL_PROJECT_NAME_INDEX.set(p.name.trim(), idx);
});

const INITIAL_ACTIVITY_INDEX = new Map<string, number>();
(initialData.activities || []).forEach((a, idx) => {
  INITIAL_ACTIVITY_INDEX.set(a.id, idx);
});

/**
 * Extracts a deterministic sort rank for a project:
 * canonical `initialData` order (proj_1..proj_11) -> `proj_<N>` number -> department order -> id/name.
 */
function getProjectRank(project: Project): number {
  const initIdx = INITIAL_PROJECT_INDEX.get(project.id);
  if (initIdx !== undefined) return initIdx;

  const byName = INITIAL_PROJECT_NAME_INDEX.get((project.name || '').trim());
  if (byName !== undefined) return byName;

  const numMatch = project.id.match(/^proj_(\d+)$/);
  if (numMatch) {
    const n = parseInt(numMatch[1], 10);
    if (n < 1000) return n - 1;
  }

  return Number.MAX_SAFE_INTEGER;
}

export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const rankA = getProjectRank(a);
    const rankB = getProjectRank(b);
    if (rankA !== rankB) return rankA - rankB;

    const deptA = DEPT_ORDER[a.departmentId] ?? 99;
    const deptB = DEPT_ORDER[b.departmentId] ?? 99;
    if (deptA !== deptB) return deptA - deptB;

    return a.name.localeCompare(b.name, 'th');
  });
}

/**
 * Parses sequence strings like "1", "3.1", "10", "2.15" into numeric segments
 * so "2" < "3.1" < "3.2" < "10" sorts naturally.
 */
function parseSeqParts(seq?: string): number[] {
  const cleaned = (seq || '').trim().replace(/^[^\d]+/, '');
  if (!cleaned) return [];
  const parts = cleaned
    .split('.')
    .map((p) => parseInt(p, 10))
    .filter((n) => !isNaN(n));
  return parts;
}

function compareSeqParts(a: number[], b: number[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  if (a.length === 0) return 1; // empty seq goes after numbered items
  if (b.length === 0) return -1;

  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    const va = a[i] ?? -1;
    const vb = b[i] ?? -1;
    if (va !== vb) return va - vb;
  }
  return 0;
}

function parseSheetCodeNum(sheetCode?: string): number {
  const cleaned = (sheetCode || '').trim();
  if (!cleaned) return Number.MAX_SAFE_INTEGER;
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
}

export function sortActivities(activities: Activity[], projects: Project[] = []): Activity[] {
  const sortedProjs = sortProjects(projects);
  const projRankById = new Map<string, number>();
  const projRankByName = new Map<string, number>();
  sortedProjs.forEach((p, idx) => {
    projRankById.set(p.id, idx);
    if (p.name) projRankByName.set(p.name.trim(), idx);
  });

  const getActProjRank = (act: Activity): number => {
    if (act.projectId && projRankById.has(act.projectId)) {
      return projRankById.get(act.projectId)!;
    }
    const nameKey = (act.projectName || '').trim();
    if (nameKey && projRankByName.has(nameKey)) {
      return projRankByName.get(nameKey)!;
    }
    const initProjIdx = INITIAL_PROJECT_INDEX.get(act.projectId || '');
    if (initProjIdx !== undefined) return initProjIdx;
    return Number.MAX_SAFE_INTEGER;
  };

  return [...activities].sort((a, b) => {
    // 1. Group/order by parent project's canonical plan order
    const projA = getActProjRank(a);
    const projB = getActProjRank(b);
    if (projA !== projB) return projA - projB;

    // 2. Order by activity seq (e.g. 1, 2, 3, ..., 3.1, 3.2, 25...)
    const seqCmp = compareSeqParts(parseSeqParts(a.seq), parseSeqParts(b.seq));
    if (seqCmp !== 0) return seqCmp;

    // 3. Fallback to sheetCode numeric order (001, 002, ...)
    const sheetA = parseSheetCodeNum(a.sheetCode);
    const sheetB = parseSheetCodeNum(b.sheetCode);
    if (sheetA !== sheetB) return sheetA - sheetB;

    // 4. Fallback to canonical initialData position
    const initA = INITIAL_ACTIVITY_INDEX.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const initB = INITIAL_ACTIVITY_INDEX.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    if (initA !== initB) return initA - initB;

    return a.name.localeCompare(b.name, 'th');
  });
}
