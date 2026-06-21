import { Category } from '../../categories/models/category';
import { Expense } from '../../expenses/models/expense';
import { selectCategoryBreakdown, selectRecentExpenses } from './dashboard.selectors';

/**
 * TC-09 / PA-15 (distribución porcentual por categorías) y
 * TC-10 / PA-16 (gastos recientes). Funciones projector, sin store.
 */
function expense(amount: number, categoryId: string, date = '2026-06-01'): Expense {
  return { id: `e-${categoryId}-${date}`, amount, currency: 'PEN', description: 'x', categoryId, date };
}

const categories: Category[] = [
  { id: 'food', name: 'Comida' },
  { id: 'transport', name: 'Transporte' },
];

describe('TC-09 / PA-15: distribución por categorías', () => {
  it('sin tipo de cambio (null) devuelve lista vacía', () => {
    expect(selectCategoryBreakdown.projector([expense(10, 'food')], null, categories)).toEqual([]);
  });

  it('agrupa por categoría y calcula el porcentaje', () => {
    const expenses = [expense(60, 'food'), expense(20, 'food'), expense(20, 'transport')];
    const rows = selectCategoryBreakdown.projector(expenses, 1, categories);
    const food = rows.find((r) => r.id === 'food')!;
    const transport = rows.find((r) => r.id === 'transport')!;

    expect(food.totalPEN).toBe(80);
    expect(food.percent).toBe(80);
    expect(transport.percent).toBe(20);
  });

  it('categoría sin gastos → 0 sin dividir por cero', () => {
    const rows = selectCategoryBreakdown.projector([], 1, categories);
    expect(rows.every((r) => r.totalPEN === 0 && r.percent === 0)).toBe(true);
  });
});

describe('TC-10 / PA-16: gastos recientes', () => {
  it('ordena por fecha descendente y corta a 5', () => {
    const dates = ['2026-01-01', '2026-06-10', '2026-03-05', '2026-06-20', '2026-02-02', '2026-05-05', '2026-04-04'];
    const expenses = dates.map((d, i) => expense(i + 1, 'food', d));

    const recent = selectRecentExpenses.projector(expenses);

    expect(recent).toHaveLength(5);
    expect(recent[0].date).toBe('2026-06-20');
    expect(recent[1].date).toBe('2026-06-10');
  });
});
