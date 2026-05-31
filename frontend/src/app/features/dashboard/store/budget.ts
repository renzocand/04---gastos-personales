import { Expense } from '../../expenses/models/expense';

/** Niveles de consumo del ingreso, según umbrales 50/80/100%. */
export type BudgetLevel = 'ok' | 'info' | 'warning' | 'danger';

export interface BudgetStatus {
  income: number | null; // null = el usuario no configuró ingreso
  spentPEN: number;
  remaining: number;
  percent: number;
  level: BudgetLevel;
}

/** Convierte un gasto a PEN usando el tipo de cambio (USD→PEN). */
export function toPen(expense: Expense, rate: number): number {
  return expense.currency === 'USD' ? expense.amount * rate : expense.amount;
}

/**
 * Escalón de alerta para un porcentaje dado:
 * 0 (<50%), 1 (≥50%), 2 (≥80%), 3 (≥100%). Se usa para detectar cruces.
 */
export function tierFor(percent: number): number {
  if (percent >= 100) return 3;
  if (percent >= 80) return 2;
  if (percent >= 50) return 1;
  return 0;
}

export function levelFor(percent: number): BudgetLevel {
  switch (tierFor(percent)) {
    case 3:
      return 'danger';
    case 2:
      return 'warning';
    case 1:
      return 'info';
    default:
      return 'ok';
  }
}
