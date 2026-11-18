/**
 * Budget type helpers.
 *
 * Imported data (Google Sheets / xlsx plan) sometimes carries variants such as
 * "พื้นที่นวัตกรรม 69" or "งบอุดหนุน (เงินอุดหนุนรายหัว)". Everything is mapped
 * back to the five canonical buckets so totals never fall out of a category.
 */

export const BUDGET_TYPES = [
  'งบพื้นที่นวัตกรรม',
  'งบอุดหนุน',
  'งบพัฒนาผู้เรียน',
  'งบรายได้สถานศึกษา',
  'งบอื่นๆ'
] as const;

export type BudgetType = (typeof BUDGET_TYPES)[number];

export function normalizeBudgetType(raw?: string | null): BudgetType {
  const value = (raw || '').trim();
  if (!value) return 'งบอื่นๆ';
  if (value.includes('นวัตกรรม')) return 'งบพื้นที่นวัตกรรม';
  if (value.includes('อุดหนุน')) return 'งบอุดหนุน';
  if (value.includes('พัฒนาผู้เรียน')) return 'งบพัฒนาผู้เรียน';
  if (value.includes('รายได้')) return 'งบรายได้สถานศึกษา';
  return 'งบอื่นๆ';
}
