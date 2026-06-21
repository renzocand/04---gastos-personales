import { Expense } from '../../expenses/models/expense';
import { UserSettings } from '../../settings/models/settings';
import { selectBudgetStatus, selectMonthSpendingPEN } from './budget.selectors';

/**
 * TC-02 (gasto del mes en PEN) · TC-11 / PA-17 (cálculo del %) · PA-18 (nivel).
 * Se prueban las funciones projector de los selectores, sin store.
 */
function expense(amount: number, currency: 'PEN' | 'USD', date: string): Expense {
  return { id: 'e', amount, currency, description: 'x', categoryId: 'food', date };
}

/** Fecha del día 15 del mes en curso (siempre "este mes"). */
function thisMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-15`;
}

function settings(monthlyIncome: number | null): UserSettings {
  return { monthlyIncome, alertsEnabled: true, highContrast: false, fontScale: 'normal', reduceMotion: false };
}

describe('TC-02 / TC-11 / PA-17, PA-18: selectores de presupuesto', () => {
  describe('selectMonthSpendingPEN', () => {
    it('suma solo gastos del mes en curso y convierte USD→PEN', () => {
      const expenses = [
        expense(100, 'PEN', thisMonth()),
        expense(10, 'USD', thisMonth()), // ×3 = 30
        expense(999, 'PEN', '2000-01-01'), // otro mes → excluido
      ];
      expect(selectMonthSpendingPEN.projector(expenses, 3)).toBe(130);
    });

    it('sin tipo de cambio (null) trata los USD como 0', () => {
      expect(selectMonthSpendingPEN.projector([expense(10, 'USD', thisMonth())], null)).toBe(0);
    });
  });

  describe('selectBudgetStatus', () => {
    it('sin ingreso configurado → income null, percent 0, level ok', () => {
      const res = selectBudgetStatus.projector(settings(null), 500);
      expect(res.income).toBeNull();
      expect(res.percent).toBe(0);
      expect(res.level).toBe('ok');
    });

    it('ingreso 0 se trata como sin configurar (level ok)', () => {
      expect(selectBudgetStatus.projector(settings(0), 500).level).toBe('ok');
    });

    it('calcula percent, remaining y level (80% → warning)', () => {
      const res = selectBudgetStatus.projector(settings(1000), 800);
      expect(res.percent).toBe(80);
      expect(res.remaining).toBe(200);
      expect(res.level).toBe('warning');
    });

    it('gasto ≥100% del ingreso → level danger', () => {
      expect(selectBudgetStatus.projector(settings(1000), 1200).level).toBe('danger');
    });
  });
});
